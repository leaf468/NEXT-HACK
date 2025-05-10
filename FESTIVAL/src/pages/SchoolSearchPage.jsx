import React, { useContext, useState, useEffect } from "react";
import { FestivalContext } from "../contexts/FestivalContext";
import { NotificationContext } from "../contexts/NotificationContext";
import SearchBar from "../components/common/SearchBar";
import FestivalList from "../components/festival/FestivalList";
import schools from "../data/schools";

const SchoolSearchPage = () => {
    const { updateFilters, clearFilters, filteredFestivals, loading, error } =
        useContext(FestivalContext);
    const { displayNotification } = useContext(NotificationContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSchools, setFilteredSchools] = useState(schools);
    const [selectedSchool, setSelectedSchool] = useState(null);

    // 검색어에 따라 학교 필터링
    useEffect(() => {
        if (!searchTerm) {
            setFilteredSchools(schools);
            return;
        }

        const filtered = schools.filter(
            (school) =>
                school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                school.shortName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );

        setFilteredSchools(filtered);
    }, [searchTerm]);

    // 학교 검색 핸들러
    const handleSearch = (query) => {
        setSearchTerm(query);

        if (query) {
            displayNotification(
                "학교 검색",
                `'${query}'에 대한 학교 검색 결과입니다.`,
                "info"
            );
        }
    };

    // 학교 선택 핸들러
    const handleSchoolSelect = (schoolName) => {
        setSelectedSchool(schoolName);
        updateFilters({ school: schoolName, artist: "" });

        displayNotification(
            "학교 선택",
            `'${schoolName}'의 축제 정보를 보여드립니다.`,
            "info"
        );

        // 페이지 스크롤 이동
        document
            .getElementById("festivals-section")
            .scrollIntoView({ behavior: "smooth" });
    };

    // 필터 초기화 핸들러
    const handleClearFilters = () => {
        clearFilters();
        setSelectedSchool(null);
        setSearchTerm("");

        displayNotification(
            "필터 초기화",
            "모든 필터가 초기화되었습니다.",
            "info"
        );
    };

    return (
        <div className="school-search-page">
            <section className="search-section">
                <h1>학교별 검색</h1>
                <SearchBar
                    onSearch={handleSearch}
                    placeholder="학교 이름으로 검색"
                />
            </section>

            <section className="schools-section">
                <h2>학교 목록</h2>
                <div className="school-grid">
                    {filteredSchools.map((school) => (
                        <div
                            key={school.id}
                            className="school-card"
                            onClick={() => handleSchoolSelect(school.name)}
                        >
                            <div className="school-logo">
                                <span>{school.shortName.charAt(0)}</span>
                            </div>
                            <div className="school-info">
                                <h3>{school.name}</h3>
                                <p>{school.location.region}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="festivals-section" className="festivals-section">
                <div className="festivals-header">
                    <h2>
                        {selectedSchool
                            ? `'${selectedSchool}'의 축제`
                            : "모든 축제"}
                    </h2>
                    {selectedSchool && (
                        <button
                            className="clear-filter-btn"
                            onClick={handleClearFilters}
                        >
                            필터 초기화
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="loading-spinner">로딩 중...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : filteredFestivals.length > 0 ? (
                    <FestivalList festivals={filteredFestivals} />
                ) : (
                    <div className="no-festivals">
                        <p>
                            {selectedSchool
                                ? `'${selectedSchool}'의 축제 정보가 없습니다.`
                                : "표시할 축제 정보가 없습니다."}
                        </p>
                        {selectedSchool && (
                            <button
                                onClick={handleClearFilters}
                                className="clear-filters-btn"
                            >
                                필터 초기화
                            </button>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default SchoolSearchPage;
