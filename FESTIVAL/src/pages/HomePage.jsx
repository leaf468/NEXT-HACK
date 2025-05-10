import React, { useContext, useState } from "react";
import { FestivalContext } from "../contexts/FestivalContext";
import { NotificationContext } from "../contexts/NotificationContext";
import SearchBar from "../components/common/SearchBar";
import Filter from "../components/common/Filter";
import FestivalList from "../components/festival/FestivalList";
import { formatDate } from "../utils/dateUtils";

const HomePage = () => {
    const {
        festivals,
        filteredFestivals,
        loading,
        error,
        filters,
        updateFilters,
        clearFilters,
    } = useContext(FestivalContext);
    const { displayNotification } = useContext(NotificationContext);
    const [searchType, setSearchType] = useState("school"); // 'school', 'artist', 'region'

    // 검색 타입 변경 핸들러
    const handleSearchTypeChange = (type) => {
        setSearchType(type);
    };

    // 검색 핸들러
    const handleSearch = (query) => {
        if (searchType === "school") {
            updateFilters({ school: query, artist: "", region: "" });
            if (query) {
                displayNotification(
                    "학교 검색",
                    `'${query}'에 대한 검색 결과입니다.`,
                    "info"
                );
            }
        } else if (searchType === "artist") {
            updateFilters({ artist: query, school: "", region: "" });
            if (query) {
                displayNotification(
                    "아티스트 검색",
                    `'${query}'에 대한 검색 결과입니다.`,
                    "info"
                );
            }
        } else if (searchType === "region") {
            updateFilters({ region: query, school: "", artist: "" });
            if (query) {
                displayNotification(
                    "지역 검색",
                    `'${query}'에 대한 검색 결과입니다.`,
                    "info"
                );
            }
        }
    };

    // 날짜 필터 핸들러
    const handleDateFilter = (dateRange) => {
        updateFilters({ date: dateRange });
        if (dateRange.startDate && dateRange.endDate) {
            displayNotification(
                "날짜 필터",
                `${formatDate(dateRange.startDate)} ~ ${formatDate(
                    dateRange.endDate
                )} 기간의 축제를 필터링합니다.`,
                "info"
            );
        }
    };

    // 지역 필터 핸들러
    const handleRegionFilter = (region) => {
        updateFilters({ region });
        if (region) {
            displayNotification(
                "지역 필터",
                `'${region}' 지역의 축제를 필터링합니다.`,
                "info"
            );
        }
    };

    // 학교 필터 핸들러
    const handleSchoolFilter = (school) => {
        updateFilters({ school });
        if (school) {
            displayNotification(
                "학교 필터",
                `'${school}' 학교의 축제를 필터링합니다.`,
                "info"
            );
        }
    };

    // 아티스트 필터 핸들러
    const handleArtistFilter = (artist) => {
        updateFilters({ artist });
        if (artist) {
            displayNotification(
                "아티스트 필터",
                `'${artist}' 아티스트가 참여하는 축제를 필터링합니다.`,
                "info"
            );
        }
    };

    // 필터 초기화 핸들러
    const handleClearFilters = () => {
        clearFilters();
        displayNotification(
            "필터 초기화",
            "모든 필터가 초기화되었습니다.",
            "info"
        );
    };

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>캠퍼스 페스티벌</h1>
                    <p>전국 대학교 축제 정보를 한눈에 확인하세요</p>

                    <div className="search-container">
                        <div className="search-types">
                            <button
                                className={`search-type-btn ${
                                    searchType === "school" ? "active" : ""
                                }`}
                                onClick={() => handleSearchTypeChange("school")}
                            >
                                학교 검색
                            </button>
                            <button
                                className={`search-type-btn ${
                                    searchType === "artist" ? "active" : ""
                                }`}
                                onClick={() => handleSearchTypeChange("artist")}
                            >
                                아티스트 검색
                            </button>
                            <button
                                className={`search-type-btn ${
                                    searchType === "region" ? "active" : ""
                                }`}
                                onClick={() => handleSearchTypeChange("region")}
                            >
                                지역 검색
                            </button>
                        </div>

                        <SearchBar
                            onSearch={handleSearch}
                            placeholder={
                                searchType === "school"
                                    ? "학교명으로 검색 (예: 서울대, 고려대...)"
                                    : searchType === "artist"
                                    ? "아티스트명으로 검색"
                                    : "지역으로 검색 (예: 서울, 경기...)"
                            }
                        />
                    </div>
                </div>
            </section>

            <section className="filters-section">
                <Filter
                    onDateFilter={handleDateFilter}
                    onSchoolFilter={handleSchoolFilter}
                    onArtistFilter={handleArtistFilter}
                    onRegionFilter={handleRegionFilter}
                    onClearFilters={handleClearFilters}
                    date={filters.date}
                    school={filters.school}
                    artist={filters.artist}
                    region={filters.region}
                />

                <div className="active-filters">
                    {filters.school && (
                        <div className="filter-tag">
                            학교: {filters.school}
                            <button
                                onClick={() => updateFilters({ school: "" })}
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {filters.artist && (
                        <div className="filter-tag">
                            아티스트: {filters.artist}
                            <button
                                onClick={() => updateFilters({ artist: "" })}
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {filters.region && (
                        <div className="filter-tag">
                            지역: {filters.region}
                            <button
                                onClick={() => updateFilters({ region: "" })}
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {filters.date && filters.date.startDate && filters.date.endDate && (
                        <div className="filter-tag">
                            날짜: {formatDate(filters.date.startDate)} ~{" "}
                            {formatDate(filters.date.endDate)}
                            <button
                                onClick={() =>
                                    updateFilters({
                                        date: { startDate: "", endDate: "" },
                                    })
                                }
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section className="festivals-section">
                {loading ? (
                    <div className="loading-spinner">로딩 중...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : filteredFestivals.length > 0 ? (
                    <FestivalList festivals={filteredFestivals} />
                ) : (
                    <div className="no-festivals">
                        <p>검색 조건에 맞는 축제가 없습니다.</p>
                        <button
                            onClick={handleClearFilters}
                            className="clear-filters-btn"
                        >
                            필터 초기화
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;
