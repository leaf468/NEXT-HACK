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
      // 축제의 시작일부터 종료일까지 모든 날짜에 이벤트 추가
      if (festival.startDate && festival.endDate) {
        let startDate, endDate;

        // 타임스탬프 객체인 경우
        if (festival.startDate && typeof festival.startDate.toDate === 'function') {
          startDate = festival.startDate.toDate();
        } else if (typeof festival.startDate === 'string') {
          startDate = new Date(festival.startDate);
        } else {
          startDate = festival.startDate;
        }

        if (festival.endDate && typeof festival.endDate.toDate === 'function') {
          endDate = festival.endDate.toDate();
        } else if (typeof festival.endDate === 'string') {
          endDate = new Date(festival.endDate);
        } else {
          endDate = festival.endDate;
        }

        // 시작일부터 종료일까지 반복
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dateStr = format(date, "yyyy-MM-dd");

          if (!events[dateStr]) {
            events[dateStr] = {
              artists: [],
              schools: []
            };
          }

          // 학교 정보 추가 (중복 체크)
          const schoolName = festival.universityName || festival.university?.name || festival.school || '';
          if (!events[dateStr].schools.includes(schoolName)) {
            events[dateStr].schools.push(schoolName);
          }

          // 아티스트 정보 추가 (중복 체크)
          if (festival.artists && festival.artists.length > 0) {
            festival.artists.forEach((artist) => {
              const existingArtist = events[dateStr].artists.find(a => a.name === artist.name);
              if (!existingArtist) {
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
      }
      // 이전 방식 지원 (date 필드가 있는 경우)
      else if (festival.date) {
        const dateStr = festival.date;

        if (!events[dateStr]) {
          events[dateStr] = {
            artists: [],
            schools: []
          };
        }

        // 학교 정보 추가
        const schoolName = festival.universityName || festival.university?.name || festival.school || '';
        if (!events[dateStr].schools.includes(schoolName)) {
          events[dateStr].schools.push(schoolName);
        }

        // 아티스트 정보 추가
        if (festival.artists && festival.artists.length > 0) {
          festival.artists.forEach((artist) => {
            const existingArtist = events[dateStr].artists.find(a => a.name === artist.name);
            if (!existingArtist) {
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
    const allArtists = selectedDateFestivals.flatMap(festival =>
      festival.artists.map(artist => ({
        name: artist.name,
        festivalId: festival.id,
        festivalName: festival.name || "축제",
        schoolName: festival.university?.name || festival.universityName || "학교",
        time: artist.time || "시간 미정"
      }))
    );

    // 중복 제거: 같은 이름의 아티스트는 한 번만 표시
    const artistMap = new Map();
    allArtists.forEach(artist => {
      // 아티스트 이름으로 구분
      if (!artistMap.has(artist.name)) {
        artistMap.set(artist.name, artist);
      }
    });

    // 중복이 제거된 아티스트 목록
    const uniqueArtistList = Array.from(artistMap.values());

    if (isLoading) {
      return <p>데이터를 불러오는 중...</p>;
    }

    if (uniqueArtistList.length === 0) {
      // 기존 캐시된 데이터도 확인해보자 (백업)
      const cachedEvents = calendarEvents[dateStr];
      if (cachedEvents && cachedEvents.artists && cachedEvents.artists.length > 0) {
        // 캐시된 데이터도 중복 제거
        const cachedArtistMap = new Map();
        cachedEvents.artists.forEach(artist => {
          if (!cachedArtistMap.has(artist.name)) {
            cachedArtistMap.set(artist.name, artist);
          }
        });

        const uniqueCachedArtists = Array.from(cachedArtistMap.values());

        return (
          <div className="selected-date-events">
            <h3>{format(value, "yyyy년 MM월 dd일")} 공연 아티스트</h3>
            <ul className="event-list">
              {uniqueCachedArtists.map((artist, index) => (
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
          {uniqueArtistList.map((artist, index) => (
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
    let schoolSet = new Set();
    selectedDateFestivals.forEach(festival => {
      const schoolName = festival.university?.name || festival.universityName || "학교 이름 없음";
      schoolSet.add(schoolName);
    });

    // 중복이 제거된 학교 목록
    const uniqueSchoolList = Array.from(schoolSet);

    if (isLoading) {
      return <p>데이터를 불러오는 중...</p>;
    }

    if (uniqueSchoolList.length === 0) {
      // 기존 캐시된 데이터도 확인해보자 (백업)
      const cachedEvents = calendarEvents[dateStr];
      if (cachedEvents && cachedEvents.schools && cachedEvents.schools.length > 0) {
        // 캐시된 데이터도 중복 제거
        const uniqueCachedSchools = [...new Set(cachedEvents.schools)];

        return (
          <div className="selected-date-events">
            <h3>{format(value, "yyyy년 MM월 dd일")} 페스티벌 학교</h3>
            <ul className="event-list">
              {uniqueCachedSchools.map((school, index) => (
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
          {uniqueSchoolList.map((school, index) => (
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