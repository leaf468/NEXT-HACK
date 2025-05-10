import React, { useState } from "react";
import { FaFilter, FaCalendarAlt, FaUniversity, FaMusic } from "react-icons/fa";

const Filter = ({
    onDateFilter,
    onSchoolFilter,
    onArtistFilter,
    onClearFilters,
    startDate,
    endDate,
    school,
    artist,
}) => {
    const [localStartDate, setLocalStartDate] = useState(startDate || "");
    const [localEndDate, setLocalEndDate] = useState(endDate || "");
    const [localSchool, setLocalSchool] = useState(school || "");
    const [localArtist, setLocalArtist] = useState(artist || "");
    const [isExpanded, setIsExpanded] = useState(false);

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
    };

    const handleClearFilters = () => {
        setLocalStartDate("");
        setLocalEndDate("");
        setLocalSchool("");
        setLocalArtist("");
        onClearFilters();
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
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
                                onChange={(e) =>
                                    setLocalStartDate(e.target.value)
                                }
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
                                onChange={(e) =>
                                    setLocalEndDate(e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {onSchoolFilter && (
                        <div className="filter-row">
                            <div className="filter-item">
                                <label
                                    className="filter-label"
                                    htmlFor="school"
                                >
                                    <FaUniversity
                                        style={{ marginRight: "5px" }}
                                    />
                                    학교
                                </label>
                                <input
                                    type="text"
                                    id="school"
                                    className="filter-input"
                                    placeholder="학교명 입력"
                                    value={localSchool}
                                    onChange={(e) =>
                                        setLocalSchool(e.target.value)
                                    }
                                />
                            </div>

                            {onArtistFilter && (
                                <div className="filter-item">
                                    <label
                                        className="filter-label"
                                        htmlFor="artist"
                                    >
                                        <FaMusic
                                            style={{ marginRight: "5px" }}
                                        />
                                        아티스트
                                    </label>
                                    <input
                                        type="text"
                                        id="artist"
                                        className="filter-input"
                                        placeholder="아티스트명 입력"
                                        value={localArtist}
                                        onChange={(e) =>
                                            setLocalArtist(e.target.value)
                                        }
                                    />
                                </div>
                            )}
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
