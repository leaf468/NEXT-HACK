import React, { useState, useEffect } from "react";
import { FaFilter, FaCalendarAlt, FaUniversity, FaMusic, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";

const Filter = ({
    onDateFilter,
    onSchoolFilter,
    onArtistFilter,
    onRegionFilter,
    onClearFilters,
    date,
    school,
    artist,
    region,
}) => {
    // 초기 날짜 상태 설정 (객체 형태로 명확히 구성)
    const [localDate, setLocalDate] = useState(() => {
        if (!date) return { startDate: "", endDate: "" };
        if (typeof date === 'string') return { startDate: date, endDate: date };
        return {
            startDate: date.startDate || "",
            endDate: date.endDate || ""
        };
    });

    const [localSchool, setLocalSchool] = useState(school || "");
    const [localArtist, setLocalArtist] = useState(artist || "");
    const [localRegion, setLocalRegion] = useState(region || "");
    const [isExpanded, setIsExpanded] = useState(false);

    // props 변경시 상태 업데이트 - 주의: 불필요한 리렌더링을 막기 위해 deep comparison 추가
    useEffect(() => {
        // 날짜 형식이 문자열에서 객체로 변경되었으므로 변환 필요
        if (date) {
            let newDate;
            if (typeof date === 'string') {
                newDate = { startDate: date, endDate: date };
            } else {
                newDate = {
                    startDate: date.startDate || "",
                    endDate: date.endDate || ""
                };
            }

            // 이전 값과 동일한지 확인하여 불필요한 상태 업데이트 방지
            if (JSON.stringify(newDate) !== JSON.stringify(localDate)) {
                console.log("Updating localDate state:", newDate);
                setLocalDate(newDate);
            }
        } else if (localDate.startDate !== "" || localDate.endDate !== "") {
            setLocalDate({ startDate: "", endDate: "" });
        }

        // 이전 값과 다를 때만 상태 업데이트
        if (school !== localSchool) setLocalSchool(school || "");
        if (artist !== localArtist) setLocalArtist(artist || "");
        if (region !== localRegion) setLocalRegion(region || "");
    }, [date, school, artist, region]);

    // 지역 선택 옵션
    const regionOptions = [
        { value: "", label: "전체 지역" },
        { value: "서울", label: "서울" },
        { value: "경기", label: "경기" },
        { value: "인천", label: "인천" },
        { value: "대전", label: "대전" },
        { value: "대구", label: "대구" },
        { value: "부산", label: "부산" },
        { value: "광주", label: "광주" },
        { value: "울산", label: "울산" },
        { value: "강원", label: "강원" },
        { value: "충북", label: "충북" },
        { value: "충남", label: "충남" },
        { value: "전북", label: "전북" },
        { value: "전남", label: "전남" },
        { value: "경북", label: "경북" },
        { value: "경남", label: "경남" },
        { value: "제주", label: "제주" },
    ];

    const handleApplyFilters = () => {
        // 날짜 필터 적용 (날짜 범위로 변경)
        if (onDateFilter) {
            onDateFilter(localDate);
        }

        // 학교 필터 적용
        if (onSchoolFilter) {
            onSchoolFilter(localSchool);
        }

        // 아티스트 필터 적용
        if (onArtistFilter) {
            onArtistFilter(localArtist);
        }

        // 지역 필터 적용
        if (onRegionFilter) {
            onRegionFilter(localRegion);
        }

        // 필터 적용 후 필터 접기
        setIsExpanded(false);
    };

    const handleClearFilters = () => {
        // 로컬 필터 상태 초기화
        setLocalDate({ startDate: "", endDate: "" });
        setLocalSchool("");
        setLocalArtist("");
        setLocalRegion("");

        // 전역 필터 초기화 함수 호출
        onClearFilters();

        // 필터가 초기화됐음을 사용자에게 시각적으로 표시하기 위해 닫기
        setIsExpanded(false);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // 현재 날짜 가져오기
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    };

    // 필터가 적용되었는지 확인
    const hasActiveFilters = (localDate && (localDate.startDate || localDate.endDate)) || 
                            localSchool || localArtist || localRegion;

    return (
        <div className={`filter-section ${isExpanded ? 'expanded' : ''}`}>
            <div className="filter-header" onClick={toggleExpand}>
                <div className="filter-header-left">
                    <div className="filter-icon">
                        <FaFilter />
                    </div>
                    <h3>필터</h3>
                    {hasActiveFilters && <span className="filter-badge">•</span>}
                </div>
                <button className="toggle-button">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                </button>
            </div>

            {isExpanded && (
                <div className="filter-content">
                    <div className="filter-group">
                        <div className="filter-group-header">
                            <FaCalendarAlt />
                            <h4>날짜</h4>
                        </div>
                        <div className="filter-row">
                            <div className="filter-item">
                                <label className="filter-label" htmlFor="startDate">
                                    시작일
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="date"
                                        id="startDate"
                                        className="filter-input"
                                        value={localDate.startDate || ""}
                                        onChange={(e) => {
                                            const newStartDate = e.target.value;
                                            setLocalDate({
                                                ...localDate,
                                                startDate: newStartDate,
                                                // If end date is empty or before start date, set it to start date
                                                endDate: !localDate.endDate || newStartDate > localDate.endDate ? newStartDate : localDate.endDate
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="filter-item">
                                <label className="filter-label" htmlFor="endDate">
                                    종료일
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="date"
                                        id="endDate"
                                        className="filter-input"
                                        value={localDate.endDate || ""}
                                        min={localDate.startDate || ""}
                                        onChange={(e) => {
                                            const newEndDate = e.target.value;
                                            setLocalDate({
                                                ...localDate,
                                                endDate: newEndDate
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filter-group">
                        <div className="filter-group-header">
                            <FaMapMarkerAlt />
                            <h4>지역</h4>
                        </div>
                        <div className="filter-row">
                            <div className="filter-item full-width">
                                <div className="input-wrapper select-wrapper">
                                    <select
                                        id="region"
                                        className="filter-input"
                                        value={localRegion}
                                        onChange={(e) => setLocalRegion(e.target.value)}
                                    >
                                        {regionOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {onSchoolFilter && (
                        <div className="filter-group">
                            <div className="filter-group-header">
                                <FaUniversity />
                                <h4>학교</h4>
                            </div>
                            <div className="filter-row">
                                <div className="filter-item full-width">
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            id="school"
                                            className="filter-input"
                                            placeholder="학교명 입력"
                                            value={localSchool}
                                            onChange={(e) => setLocalSchool(e.target.value)}
                                        />
                                        <span className="input-icon">
                                            <FaSearch />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {onArtistFilter && (
                        <div className="filter-group">
                            <div className="filter-group-header">
                                <FaMusic />
                                <h4>아티스트</h4>
                            </div>
                            <div className="filter-row">
                                <div className="filter-item full-width">
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            id="artist"
                                            className="filter-input"
                                            placeholder="아티스트명 입력"
                                            value={localArtist}
                                            onChange={(e) => setLocalArtist(e.target.value)}
                                        />
                                        <span className="input-icon">
                                            <FaSearch />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="filter-buttons">
                        <button
                            className="clear-button"
                            onClick={handleClearFilters}
                        >
                            초기화
                        </button>
                        <button
                            className="apply-button"
                            onClick={handleApplyFilters}
                        >
                            적용하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Filter;