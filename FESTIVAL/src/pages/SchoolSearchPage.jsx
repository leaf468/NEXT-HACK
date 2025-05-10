import React, { useContext, useState, useEffect } from "react";
import { FestivalContext } from "../contexts/FestivalContext";
import { NotificationContext } from "../contexts/NotificationContext";
import SearchBar from "../components/common/SearchBar";
import FestivalList from "../components/festival/FestivalList";
import { getAllUniversities } from "../lib/firebase";

const SchoolSearchPage = () => {
    const { updateFilters, clearFilters, filteredFestivals, festivals, loading, error } =
        useContext(FestivalContext);
    const { displayNotification } = useContext(NotificationContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [schools, setSchools] = useState([]);
    const [filteredSchools, setFilteredSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [loadingSchools, setLoadingSchools] = useState(true);

    // 데이터베이스에서 학교 목록 가져오기
    useEffect(() => {
        const fetchSchools = async () => {
            try {
                setLoadingSchools(true);

                // 우선 DB에서 모든 학교 정보 가져오기 시도
                const dbSchools = await getAllUniversities();

                if (dbSchools && dbSchools.length > 0) {
                    // DB에서 가져온 학교 정보를 화면에 맞게 변환
                    const formattedSchools = dbSchools.map(school => ({
                        id: school.id,
                        name: school.name,
                        shortName: school.shortName || school.name.replace('대학교', '대').replace('학교', ''),
                        location: {
                            address: school.address || '',
                            region: school.location || '지역 정보 없음',
                            coordinates: school.coordinates || { latitude: 0, longitude: 0 }
                        },
                        website: school.website || ''
                    }));

                    setSchools(formattedSchools);
                    setFilteredSchools(formattedSchools);
                } else {
                    // DB에 학교 데이터가 없는 경우, 축제 데이터에서 학교 정보 추출
                    const festivalSchools = new Map();

                    festivals.forEach(festival => {
                        const schoolName = festival.universityName || festival.university?.name || festival.school || '';
                        if (schoolName && !festivalSchools.has(schoolName)) {
                            const shortName = schoolName.replace('대학교', '대').replace('학교', '');
                            const region = festival.university?.location || festival.location?.region || '';

                            festivalSchools.set(schoolName, {
                                id: festival.university?.id || `school-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                name: schoolName,
                                shortName: shortName,
                                location: {
                                    address: festival.university?.address || festival.location?.address || '',
                                    region: region || '지역 정보 없음',
                                    coordinates: festival.location?.coordinates || { latitude: 0, longitude: 0 }
                                }
                            });
                        }
                    });

                    const extractedSchools = Array.from(festivalSchools.values());
                    setSchools(extractedSchools);
                    setFilteredSchools(extractedSchools);
                }
            } catch (error) {
                console.error("학교 데이터를 가져오는데 실패했습니다:", error);

                // 축제 데이터에서 학교 정보 추출 (백업 메커니즘)
                const uniqueSchools = new Map();

                festivals.forEach(festival => {
                    const schoolName = festival.universityName || festival.university?.name || festival.school || '';
                    if (schoolName && !uniqueSchools.has(schoolName)) {
                        const shortName = schoolName.replace('대학교', '대').replace('학교', '');
                        const region = festival.university?.location || festival.location?.region || '';

                        uniqueSchools.set(schoolName, {
                            id: festival.university?.id || `school-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            name: schoolName,
                            shortName: shortName,
                            location: {
                                address: festival.university?.address || festival.location?.address || '',
                                region: region || '지역 정보 없음',
                                coordinates: festival.location?.coordinates || { latitude: 0, longitude: 0 }
                            }
                        });
                    }
                });

                const extractedSchools = Array.from(uniqueSchools.values());
                setSchools(extractedSchools);
                setFilteredSchools(extractedSchools);
            } finally {
                setLoadingSchools(false);
            }
        };

        fetchSchools();
    }, [festivals]);

    // 검색어에 따라 학교 필터링
    useEffect(() => {
        if (!searchTerm || schools.length === 0) {
            setFilteredSchools(schools);
            return;
        }

        const filtered = schools.filter(
            (school) =>
                school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (school.shortName && school.shortName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
        );

        setFilteredSchools(filtered);
    }, [searchTerm, schools]);

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
                <h2>
                    <i className="fa fa-university" style={{ color: 'var(--primary-color)' }}></i>
                    학교 목록
                </h2>
                {loadingSchools ? (
                    <div className="loading-spinner">학교 정보를 불러오는 중...</div>
                ) : filteredSchools.length > 0 ? (
                    <div className="school-grid">
                        {filteredSchools.map((school) => (
                            <div
                                key={school.id}
                                className="school-card"
                                onClick={() => handleSchoolSelect(school.name)}
                            >
                                <div className="school-logo">
                                    <span>{school.shortName?.charAt(0) || school.name.charAt(0)}</span>
                                </div>
                                <div className="school-info">
                                    <h3>{school.name}</h3>
                                    <p>
                                        <i className="fa fa-map-marker" style={{ marginRight: '5px', color: '#666' }}></i>
                                        {school.location?.region || '지역 정보 없음'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-schools">
                        <p>표시할 학교 정보가 없습니다.</p>
                    </div>
                )}
            </section>

            <section id="festivals-section" className="festivals-section">
                <div className="festivals-header">
                    <h2>
                        <i className="fa fa-calendar" style={{ color: 'var(--primary-color)' }}></i>
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
