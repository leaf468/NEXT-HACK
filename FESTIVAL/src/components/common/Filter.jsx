import React, { useState } from "react";
import { FaFilter, FaCalendarAlt, FaUniversity, FaMusic, FaMapMarkerAlt } from "react-icons/fa";

const Filter = ({
    onDateFilter,
    onSchoolFilter,
    onArtistFilter,
    onRegionFilter,
    onClearFilters,
    startDate,
    endDate,
    school,
    artist,
    region,
}) => {
    const [localStartDate, setLocalStartDate] = useState(startDate || "");
    const [localEndDate, setLocalEndDate] = useState(endDate || "");
    const [localSchool, setLocalSchool] = useState(school || "");
    const [localArtist, setLocalArtist] = useState(artist || "");
    const [localRegion, setLocalRegion] = useState(region || "");
    const [isExpanded, setIsExpanded] = useState(false);

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
        // 날짜 필터 적용
        if (localStartDate && localEndDate) {
            onDateFilter(new Date(localStartDate), new Date(localEndDate));
        }

        // 학교 필터 적용
        if (localSchool && onSchoolFilter) {
            onSchoolFilter(localSchool);
        }

        // 아티스트 필터 적용
        if (localArtist && onArtistFilter) {
            onArtistFilter(localArtist);
        }

        // 지역 필터 적용
        if (localRegion && onRegionFilter) {
            onRegionFilter(localRegion);
        }
    };

    const handleClearFilters = () => {
        setLocalStartDate("");
        setLocalEndDate("");
        setLocalSchool("");
        setLocalArtist("");
        setLocalRegion("");
        onClearFilters();
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // 현재 날짜 가져오기
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    };

    // 현재 날짜 기준으로 한 달 후 날짜 가져오기
    const getOneMonthLaterDate = () => {
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);
        return oneMonthLater.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    };

    return (
        <div className="filter-section">
            <div className="filter-header" onClick={toggleExpand}>
                <FaFilter style={{ marginRight: "8px" }} />
                <h3>필터</h3>
                <button className="toggle-button">
                    {isExpanded ? "접기" : "펼치기"}
                </button>
            </div>

            {isExpanded && (
                <>
                    <div className="filter-row">
                        <div className="filter-item">
                            <label className="filter-label" htmlFor="startDate">
                                <FaCalendarAlt style={{ marginRight: "5px" }} />
                                시작일
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                className="filter-input"
                                value={localStartDate}
                                onChange={(e) => setLocalStartDate(e.target.value)}
                                min={getCurrentDate()}
                            />
                        </div>

                        <div className="filter-item">
                            <label className="filter-label" htmlFor="endDate">
                                <FaCalendarAlt style={{ marginRight: "5px" }} />
                                종료일
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                className="filter-input"
                                value={localEndDate}
                                onChange={(e) => setLocalEndDate(e.target.value)}
                                min={localStartDate || getCurrentDate()}
                            />
                        </div>
                    </div>

                    <div className="filter-row">
                        <div className="filter-item">
                            <label className="filter-label" htmlFor="region">
                                <FaMapMarkerAlt style={{ marginRight: "5px" }} />
                                지역
                            </label>
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

                        {onSchoolFilter && (
                            <div className="filter-item">
                                <label className="filter-label" htmlFor="school">
                                    <FaUniversity style={{ marginRight: "5px" }} />
                                    학교
                                </label>
                                <input
                                    type="text"
                                    id="school"
                                    className="filter-input"
                                    placeholder="학교명 입력"
                                    value={localSchool}
                                    onChange={(e) => setLocalSchool(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {onArtistFilter && (
                        <div className="filter-row">
                            <div className="filter-item">
                                <label className="filter-label" htmlFor="artist">
                                    <FaMusic style={{ marginRight: "5px" }} />
                                    아티스트
                                </label>
                                <input
                                    type="text"
                                    id="artist"
                                    className="filter-input"
                                    placeholder="아티스트명 입력"
                                    value={localArtist}
                                    onChange={(e) => setLocalArtist(e.target.value)}
                                />
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
                </>
            )}
        </div>
    );
};

export default Filter;
