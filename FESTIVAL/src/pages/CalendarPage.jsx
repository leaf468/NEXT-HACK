import React, { useState, useContext, useEffect } from "react";
import Calendar from "react-calendar";
import { FestivalContext } from "../contexts/FestivalContext";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";
import "../styles/components/calendar.css";
import { getFestivalsByDate } from "../lib/firebase";

function CalendarPage() {
  const { festivals } = useContext(FestivalContext);
  const [value, setValue] = useState(new Date());
  const [viewType, setViewType] = useState("artist"); // "artist" or "school"
  const [calendarEvents, setCalendarEvents] = useState({});
  const [selectedDateFestivals, setSelectedDateFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 모든 축제 데이터에서 날짜별 이벤트 정보 추출
  useEffect(() => {
    const events = {};

    festivals.forEach((festival) => {
      const dateStr = festival.date || (festival.startDate ? format(new Date(festival.startDate), "yyyy-MM-dd") : null);
      
      if (dateStr) {
        if (!events[dateStr]) {
          events[dateStr] = {
            artists: [],
            schools: []
          };
        }

        // 학교 정보 추가
        const schoolName = festival.universityName || festival.university?.name || festival.school || '';
        if (!events[dateStr].schools.some(s => s === schoolName)) {
          events[dateStr].schools.push(schoolName);
        }

        // 아티스트 정보 추가
        if (festival.artists && festival.artists.length > 0) {
          festival.artists.forEach((artist) => {
            if (!events[dateStr].artists.some(a => a.name === artist.name)) {
              events[dateStr].artists.push({
                name: artist.name,
                festivalId: festival.id,
                festivalName: festival.name || "축제",
                schoolName: schoolName,
                time: artist.time || "시간 미정"
              });
            }
          });
        }
      }
    });

    setCalendarEvents(events);
  }, [festivals]);

  // 날짜 클릭했을 때 처리
  const handleDateChange = async (date) => {
    setValue(date);
    
    // 선택한 날짜 형식 변환
    const dateStr = format(date, "yyyy-MM-dd");
    
    try {
      setIsLoading(true);
      // Firebase에서 선택한 날짜의 축제 정보 가져오기
      const dateSpecificFestivals = await getFestivalsByDate(dateStr);
      setSelectedDateFestivals(dateSpecificFestivals);
    } catch (error) {
      console.error("날짜별 축제 정보를 가져오는데 실패했습니다:", error);
      setSelectedDateFestivals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 달력에 이벤트가 있는 날짜에 콘텐츠 표시
  const tileContent = ({ date, view }) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const events = calendarEvents[dateStr];

    if (view === "month" && events) {
      const items = viewType === "artist" ? events.artists : events.schools;
      if (items && items.length > 0) {
        return (
          <div className="calendar-event-marker">
            <span className="event-count">{items.length}</span>
          </div>
        );
      }
    }
    return null;
  };

  // 선택한 날짜의 아티스트 이벤트 표시
  const renderArtistEvents = () => {
    const dateStr = format(value, "yyyy-MM-dd");
    
    // 새로 가져온 데이터 사용
    const artistList = selectedDateFestivals.flatMap(festival => 
      festival.artists.map(artist => ({
        name: artist.name,
        festivalId: festival.id,
        festivalName: festival.name || "축제",
        schoolName: festival.university?.name || festival.universityName || "학교",
        time: artist.time || "시간 미정"
      }))
    );
    
    if (isLoading) {
      return <p>데이터를 불러오는 중...</p>;
    }
    
    if (artistList.length === 0) {
      // 기존 캐시된 데이터도 확인해보자 (백업)
      const cachedEvents = calendarEvents[dateStr];
      if (cachedEvents && cachedEvents.artists && cachedEvents.artists.length > 0) {
        return (
          <div className="selected-date-events">
            <h3>{format(value, "yyyy년 MM월 dd일")} 공연 아티스트</h3>
            <ul className="event-list">
              {cachedEvents.artists.map((artist, index) => (
                <li key={index} className="event-item">
                  <div className="event-name">{artist.name}</div>
                  <div className="event-details">
                    <span>{artist.schoolName} - {artist.festivalName}</span>
                    <span className="event-time">{typeof artist.time === 'string' ? artist.time.split(" ")[1] || "시간 미정" : "시간 미정"}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      } else {
        return <p>선택한 날짜에 예정된 아티스트 공연이 없습니다.</p>;
      }
    }

    return (
      <div className="selected-date-events">
        <h3>{format(value, "yyyy년 MM월 dd일")} 공연 아티스트</h3>
        <ul className="event-list">
          {artistList.map((artist, index) => (
            <li key={index} className="event-item">
              <div className="event-name">{artist.name}</div>
              <div className="event-details">
                <span>{artist.schoolName} - {artist.festivalName}</span>
                <span className="event-time">{typeof artist.time === 'string' ? artist.time.split(" ")[1] || "시간 미정" : "시간 미정"}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // 선택한 날짜의 학교 이벤트 표시
  const renderSchoolEvents = () => {
    const dateStr = format(value, "yyyy-MM-dd");
    
    // 새로 가져온 데이터 사용
    const schoolList = selectedDateFestivals.map(festival => 
      festival.university?.name || festival.universityName || "학교 이름 없음"
    );
    
    if (isLoading) {
      return <p>데이터를 불러오는 중...</p>;
    }
    
    if (schoolList.length === 0) {
      // 기존 캐시된 데이터도 확인해보자 (백업)
      const cachedEvents = calendarEvents[dateStr];
      if (cachedEvents && cachedEvents.schools && cachedEvents.schools.length > 0) {
        return (
          <div className="selected-date-events">
            <h3>{format(value, "yyyy년 MM월 dd일")} 페스티벌 학교</h3>
            <ul className="event-list">
              {cachedEvents.schools.map((school, index) => (
                <li key={index} className="event-item">
                  <div className="event-name">{school}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      } else {
        return <p>선택한 날짜에 진행 중인 학교 축제가 없습니다.</p>;
      }
    }

    return (
      <div className="selected-date-events">
        <h3>{format(value, "yyyy년 MM월 dd일")} 페스티벌 학교</h3>
        <ul className="event-list">
          {schoolList.map((school, index) => (
            <li key={index} className="event-item">
              <div className="event-name">{school}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // 선택한 보기 타입에 따라 다른 이벤트 표시
  const renderSelectedDateEvents = () => {
    if (viewType === "artist") {
      return renderArtistEvents();
    } else {
      return renderSchoolEvents();
    }
  };

  return (
    <div className="calendar-page">
      <h1>페스티벌 달력</h1>
      
      <div className="view-toggle">
        <button 
          className={viewType === "artist" ? "active" : ""} 
          onClick={() => setViewType("artist")}
        >
          아티스트별 보기
        </button>
        <button 
          className={viewType === "school" ? "active" : ""} 
          onClick={() => setViewType("school")}
        >
          학교별 보기
        </button>
      </div>
      
      <div className="calendar-container">
        <div className="calendar-wrapper">
          <Calendar 
            onChange={handleDateChange}
            value={value}
            tileContent={tileContent}
          />
        </div>
        
        <div className="events-container">
          {renderSelectedDateEvents()}
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;