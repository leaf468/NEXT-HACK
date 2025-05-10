import React, { useState, useContext, useEffect } from "react";
import Calendar from "react-calendar";
import { FestivalContext } from "../contexts/FestivalContext";
import { format, isWithinInterval, parseISO } from "date-fns";
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
    const [selectedDate, setSelectedDate] = useState(null);

    // 날짜 객체 표준화 함수
    const normalizeDateObject = (dateValue) => {
        if (!dateValue) return null;

        try {
            // Firestore 타임스탬프 객체인 경우
            if (dateValue && typeof dateValue.toDate === "function") {
                return dateValue.toDate();
            }
            // 문자열인 경우
            else if (typeof dateValue === "string") {
                // 한국어 형식 (YYYY년 MM월 DD일)인지 확인
                const koreanPattern = /(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일/;
                const match = dateValue.match(koreanPattern);

                if (match) {
                    // 한국어 형식을 ISO 형식으로 변환 (YYYY-MM-DD)
                    const year = match[1];
                    const month = match[2].padStart(2, '0');
                    const day = match[3].padStart(2, '0');
                    const isoDateStr = `${year}-${month}-${day}`;
                    console.log(`Converting Korean date: ${dateValue} => ${isoDateStr}`);
                    return parseISO(isoDateStr);
                } else {
                    // ISO 형식 문자열로 가정하고 파싱
                    return parseISO(dateValue);
                }
            }
            // 이미 Date 객체인 경우
            else if (dateValue instanceof Date) {
                return dateValue;
            }
        } catch (error) {
            console.error("날짜 변환 중 오류:", error);
        }
        return null;
    };

    // 날짜가 유효한지 확인하는 함수
    const isValidDate = (date) => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    // 특정 날짜가 축제 기간 내에 있는지 확인하는 함수
    const isFestivalActiveOnDate = (festival, targetDate) => {
        if (!targetDate) return false;

        const startDate = normalizeDateObject(festival.startDate);
        const endDate = normalizeDateObject(festival.endDate);

        // 시작일과 종료일이 모두 유효한 경우
        if (isValidDate(startDate) && isValidDate(endDate)) {
            try {
                // targetDate가 시작일과 종료일 사이에 있는지 확인
                return isWithinInterval(targetDate, {
                    start: startDate,
                    end: endDate,
                });
            } catch (error) {
                console.error("날짜 비교 중 오류:", error, {
                    festivalName: festival.name,
                    startDate,
                    endDate,
                    targetDate,
                });
                return false;
            }
        }

        // date 필드가 있는 이전 방식 지원
        if (festival.date) {
            try {
                const festivalDate =
                    typeof festival.date === "string"
                        ? parseISO(festival.date)
                        : normalizeDateObject(festival.date);

                if (isValidDate(festivalDate)) {
                    // Convert both dates to the same format for accurate comparison
                    const festivalDateStr = format(festivalDate, "yyyy-MM-dd");
                    const targetDateStr = format(targetDate, "yyyy-MM-dd");
                    const isMatch = festivalDateStr === targetDateStr;
                    console.log(`Date comparison: ${festivalDateStr} === ${targetDateStr}, result: ${isMatch}`);
                    return isMatch;
                }
            } catch (error) {
                console.error("date 필드 비교 중 오류:", error);
            }
        }

        return false;
    };

    // 모든 축제 데이터에서 날짜별 이벤트 정보 추출
    useEffect(() => {
        // 이벤트 정보를 저장할 객체
        const events = {};

        console.log("Processing festivals:", festivals);

        // festivals가 없거나 비어있으면 처리하지 않음
        if (!festivals || festivals.length === 0) return;

        // 초기 로딩 시 선택된 날짜가 없고 festivals가 있을 때만 모든 축제를 보여줌
        if (!selectedDate && festivals.length > 0) {
            // 이전 상태와 festivals가 다른 경우에만 업데이트
            setSelectedDateFestivals(prevFestivals => {
                if (prevFestivals.length !== festivals.length) {
                    return festivals;
                }
                return prevFestivals;
            });
        }

        festivals.forEach((festival) => {
            const startDate = normalizeDateObject(festival.startDate);
            const endDate = normalizeDateObject(festival.endDate);

            // 날짜 로깅
            console.log(`Festival ${festival.name} parsed dates:`, {
                startDate,
                endDate,
                isStartDateValid: isValidDate(startDate),
                isEndDateValid: isValidDate(endDate),
            });

            // 유효한 시작일과 종료일이 있는 경우
            if (isValidDate(startDate) && isValidDate(endDate)) {
                // 시작일부터 종료일까지 반복
                for (
                    let date = new Date(startDate);
                    date <= endDate;
                    date.setDate(date.getDate() + 1)
                ) {
                    const dateStr = format(date, "yyyy-MM-dd");

                    if (!events[dateStr]) {
                        events[dateStr] = {
                            artists: [],
                            schools: [],
                        };
                    }

                    // 학교 정보 추가 (중복 체크)
                    const schoolName =
                        festival.universityName ||
                        (festival.university && festival.university.name) ||
                        festival.school ||
                        "";

                    if (
                        schoolName &&
                        !events[dateStr].schools.includes(schoolName)
                    ) {
                        events[dateStr].schools.push(schoolName);
                    }

                    // 아티스트 정보 추가 (중복 체크)
                    if (
                        festival.artists &&
                        Array.isArray(festival.artists) &&
                        festival.artists.length > 0
                    ) {
                        festival.artists.forEach((artist) => {
                            // 유효한 아티스트 객체인지 확인
                            if (artist && typeof artist === "object") {
                                const artistName = artist.name || "이름 없음";
                                const existingArtist = events[
                                    dateStr
                                ].artists.find((a) => a.name === artistName);

                                if (!existingArtist) {
                                    events[dateStr].artists.push({
                                        name: artistName,
                                        festivalId: festival.id,
                                        festivalName: festival.name || "축제",
                                        schoolName: schoolName,
                                        time: artist.time || "시간 미정",
                                    });
                                }
                            }
                        });
                    }
                }
            }
            // 단일 date 필드가 있는 경우 (이전 방식 지원)
            else if (festival.date) {
                let dateStr;
                try {
                    const festivalDate =
                        typeof festival.date === "string"
                            ? parseISO(festival.date)
                            : normalizeDateObject(festival.date);

                    if (isValidDate(festivalDate)) {
                        dateStr = format(festivalDate, "yyyy-MM-dd");
                    } else {
                        // 문자열 그대로 사용
                        dateStr = festival.date;
                    }
                } catch (error) {
                    console.error("festival.date 처리 중 오류:", error);
                    return; // 이 축제는 건너뜀
                }

                if (!events[dateStr]) {
                    events[dateStr] = {
                        artists: [],
                        schools: [],
                    };
                }

                // 학교 정보 추가
                const schoolName =
                    festival.universityName ||
                    (festival.university && festival.university.name) ||
                    festival.school ||
                    "";

                if (
                    schoolName &&
                    !events[dateStr].schools.includes(schoolName)
                ) {
                    events[dateStr].schools.push(schoolName);
                }

                // 아티스트 정보 추가
                if (
                    festival.artists &&
                    Array.isArray(festival.artists) &&
                    festival.artists.length > 0
                ) {
                    festival.artists.forEach((artist) => {
                        if (artist && typeof artist === "object") {
                            const artistName = artist.name || "이름 없음";
                            const existingArtist = events[dateStr].artists.find(
                                (a) => a.name === artistName
                            );

                            if (!existingArtist) {
                                events[dateStr].artists.push({
                                    name: artistName,
                                    festivalId: festival.id,
                                    festivalName: festival.name || "축제",
                                    schoolName: schoolName,
                                    time: artist.time || "시간 미정",
                                });
                            }
                        }
                    });
                }
            }
        });

        setCalendarEvents(events);
    }, [festivals, selectedDate]);

    // 날짜 클릭했을 때 처리
    const handleDateChange = async (date) => {
        setValue(date);
        setSelectedDate(date);

        // 선택한 날짜 형식 변환 (항상 yyyy-MM-dd 형식으로 통일)
        const dateStr = format(date, "yyyy-MM-dd");
        console.log("Selected date:", dateStr, "Date object:", date);

        try {
            setIsLoading(true);

            // 표준화된 날짜 문자열로 Firebase에서 축제 정보 가져오기
            console.log("Fetching festivals for standardized date:", dateStr);
            const dateSpecificFestivals = await getFestivalsByDate(dateStr);
            console.log(
                "Fetched festivals count:",
                dateSpecificFestivals.length
            );

            // Firebase에서 가져온 데이터가 없거나 오류가 있으면 로컬 필터링 사용
            if (!dateSpecificFestivals || dateSpecificFestivals.length === 0) {
                console.log("Firebase 데이터 없음, 로컬 필터링 사용");

                // 메모리에 있는 festivals 데이터를 기반으로 필터링
                const filteredFestivals = festivals.filter((festival) => {
                    const isActive = isFestivalActiveOnDate(festival, date);
                    console.log(`Festival ${festival.name || 'Unknown'} active on ${dateStr}: ${isActive}`);
                    return isActive;
                });

                console.log("로컬 필터링 결과:", filteredFestivals.length);
                setSelectedDateFestivals(filteredFestivals);
            } else {
                // Firebase에서 받아온 데이터 사용
                setSelectedDateFestivals(dateSpecificFestivals);
            }
        } catch (error) {
            console.error("날짜별 축제 정보를 가져오는데 실패했습니다:", error);

            // 오류 발생 시 로컬 필터링 사용
            console.log("오류로 인해 로컬 필터링 사용");
            const filteredFestivals = festivals.filter((festival) => {
                const isActive = isFestivalActiveOnDate(festival, date);
                console.log(`Festival ${festival.name || 'Unknown'} active on ${dateStr}: ${isActive}`);
                return isActive;
            });

            setSelectedDateFestivals(filteredFestivals);
        } finally {
            setIsLoading(false);
        }
    };

    // 달력에 이벤트가 있는 날짜에 콘텐츠 표시
    const tileContent = ({ date, view }) => {
        if (view !== "month") return null;

        const dateStr = format(date, "yyyy-MM-dd");
        const events = calendarEvents[dateStr];

        if (events) {
            const items =
                viewType === "artist" ? events.artists : events.schools;
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
        if (isLoading) {
            return <p>데이터를 불러오는 중...</p>;
        }

        // 날짜가 선택되지 않은 경우 (초기 로딩 시) - 모든 아티스트를 표시
        if (!selectedDate) {
            // 모든 축제의 아티스트 정보 수집
            const allArtists = selectedDateFestivals
                .flatMap((festival) => {
                    if (!festival.artists || !Array.isArray(festival.artists))
                        return [];

                    return festival.artists.map((artist) => {
                        if (!artist || typeof artist !== "object") return null;

                        return {
                            name: artist.name || "이름 없음",
                            festivalId: festival.id,
                            festivalName: festival.name || "축제",
                            schoolName:
                                festival.university?.name ||
                                festival.universityName ||
                                festival.school ||
                                "학교",
                            time: artist.time || "시간 미정",
                            // 축제 날짜 정보 포함
                            festivalStartDate: festival.startDate,
                            festivalEndDate: festival.endDate,
                        };
                    });
                })
                .filter((artist) => artist !== null); // null 값 제거

            // 중복 제거: 같은 이름의 아티스트는 한 번만 표시
            const artistMap = new Map();
            allArtists.forEach((artist) => {
                if (!artistMap.has(artist.name)) {
                    artistMap.set(artist.name, artist);
                }
            });

            // 중복이 제거된 아티스트 목록
            const uniqueArtistList = Array.from(artistMap.values());

            if (uniqueArtistList.length === 0) {
                return <p>등록된 아티스트 정보가 없습니다.</p>;
            }

            return (
                <div className="selected-date-events">
                    <h3>모든 공연 아티스트</h3>
                    <ul className="event-list">
                        {uniqueArtistList.map((artist, index) => (
                            <li key={index} className="event-item">
                                <div className="event-name">{artist.name}</div>
                                <div className="event-details">
                                    <span>
                                        {artist.schoolName} -{" "}
                                        {artist.festivalName}
                                    </span>
                                    <span className="event-time">
                                        {typeof artist.time === "string" &&
                                        artist.time.includes(" ")
                                            ? artist.time.split(" ")[1] ||
                                              "시간 미정"
                                            : artist.time || "시간 미정"}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        // 특정 날짜가 선택된 경우
        const dateStr = format(value, "yyyy-MM-dd");

        // 선택된 날짜의 축제 데이터에서 아티스트 추출
        const allArtists = selectedDateFestivals
            .flatMap((festival) => {
                if (!festival.artists || !Array.isArray(festival.artists))
                    return [];

                return festival.artists.map((artist) => {
                    if (!artist || typeof artist !== "object") return null;

                    return {
                        name: artist.name || "이름 없음",
                        festivalId: festival.id,
                        festivalName: festival.name || "축제",
                        schoolName:
                            festival.university?.name ||
                            festival.universityName ||
                            festival.school ||
                            "학교",
                        time: artist.time || "시간 미정",
                    };
                });
            })
            .filter((artist) => artist !== null); // null 값 제거

        // 중복 제거
        const artistMap = new Map();
        allArtists.forEach((artist) => {
            if (!artistMap.has(artist.name)) {
                artistMap.set(artist.name, artist);
            }
        });

        const uniqueArtistList = Array.from(artistMap.values());

        if (uniqueArtistList.length === 0) {
            // 기존 캐시된 데이터도 확인 (백업)
            const cachedEvents = calendarEvents[dateStr];
            if (
                cachedEvents &&
                cachedEvents.artists &&
                cachedEvents.artists.length > 0
            ) {
                // 캐시된 데이터도 중복 제거
                const cachedArtistMap = new Map();
                cachedEvents.artists.forEach((artist) => {
                    if (!cachedArtistMap.has(artist.name)) {
                        cachedArtistMap.set(artist.name, artist);
                    }
                });

                const uniqueCachedArtists = Array.from(
                    cachedArtistMap.values()
                );

                return (
                    <div className="selected-date-events">
                        <h3>
                            {format(value, "yyyy년 MM월 dd일")} 공연 아티스트
                        </h3>
                        <ul className="event-list">
                            {uniqueCachedArtists.map((artist, index) => (
                                <li key={index} className="event-item">
                                    <div className="event-name">
                                        {artist.name}
                                    </div>
                                    <div className="event-details">
                                        <span>
                                            {artist.schoolName} -{" "}
                                            {artist.festivalName}
                                        </span>
                                        <span className="event-time">
                                            {typeof artist.time === "string" &&
                                            artist.time.includes(" ")
                                                ? artist.time.split(" ")[1] ||
                                                  "시간 미정"
                                                : artist.time || "시간 미정"}
                                        </span>
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
                                <span>
                                    {artist.schoolName} - {artist.festivalName}
                                </span>
                                <span className="event-time">
                                    {typeof artist.time === "string" &&
                                    artist.time.includes(" ")
                                        ? artist.time.split(" ")[1] ||
                                          "시간 미정"
                                        : artist.time || "시간 미정"}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    // 선택한 날짜의 학교 이벤트 표시
    const renderSchoolEvents = () => {
        if (isLoading) {
            return <p>데이터를 불러오는 중...</p>;
        }

        // 날짜가 선택되지 않은 경우 (초기 로딩 시) - 모든 학교를 표시
        if (!selectedDate) {
            let schoolSet = new Set();

            selectedDateFestivals.forEach((festival) => {
                const schoolName =
                    festival.university?.name ||
                    festival.universityName ||
                    festival.school ||
                    "";
                if (
                    schoolName &&
                    schoolName !== "학교 이름 없음" &&
                    schoolName !== ""
                ) {
                    schoolSet.add(schoolName);
                }
            });

            // 중복이 제거된 학교 목록
            const uniqueSchoolList = Array.from(schoolSet);

            if (uniqueSchoolList.length === 0) {
                return <p>등록된 학교 정보가 없습니다.</p>;
            }

            return (
                <div className="selected-date-events">
                    <h3>모든 페스티벌 학교</h3>
                    <ul className="event-list">
                        {uniqueSchoolList.map((school, index) => (
                            <li key={index} className="event-item">
                                <div className="event-name">{school}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        // 특정 날짜가 선택된 경우
        const dateStr = format(value, "yyyy-MM-dd");

        // 선택된 날짜의 축제에서 학교 정보 추출
        let schoolSet = new Set();

        selectedDateFestivals.forEach((festival) => {
            const schoolName =
                festival.university?.name ||
                festival.universityName ||
                festival.school ||
                "";
            if (
                schoolName &&
                schoolName !== "학교 이름 없음" &&
                schoolName !== ""
            ) {
                schoolSet.add(schoolName);
            }
        });

        // 중복이 제거된 학교 목록
        const uniqueSchoolList = Array.from(schoolSet);

        if (uniqueSchoolList.length === 0) {
            // 기존 캐시된 데이터도 확인 (백업)
            const cachedEvents = calendarEvents[dateStr];
            if (
                cachedEvents &&
                cachedEvents.schools &&
                cachedEvents.schools.length > 0
            ) {
                // 캐시된 데이터도 중복 제거
                const uniqueCachedSchools = [
                    ...new Set(cachedEvents.schools),
                ].filter((school) => school);

                return (
                    <div className="selected-date-events">
                        <h3>
                            {format(value, "yyyy년 MM월 dd일")} 페스티벌 학교
                        </h3>
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
                        onClickDay={handleDateChange}
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
