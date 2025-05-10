import React, { useContext, useState, useEffect } from "react";
import { FestivalContext } from "../contexts/FestivalContext";
import { NotificationContext } from "../contexts/NotificationContext";
import SearchBar from "../components/common/SearchBar";
import FestivalList from "../components/festival/FestivalList";
import { getAllUniversities, getImageUrlWithCacheBusting } from "../lib/firebase";

// School logo component to handle image loading
const SchoolLogo = ({ school, getImageUrl }) => {
    const [logoUrl, setLogoUrl] = useState(school.logoUrl || "");
    const [loading, setLoading] = useState(!school.logoUrl);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchLogo = async () => {
            // Check if we have direct logo URL in the school object (might be from Firebase 'logo' field)
            if (school.logo) {
                console.log(`Using direct logo URL for ${school.name}: ${school.logo}`);
                setLogoUrl(school.logo);
                setLoading(false);
                return;
            }

            // Check if we have cached logoUrl
            if (school.logoUrl) {
                setLogoUrl(school.logoUrl);
                return;
            }

            // Check if we have a logoPath to fetch
            if (!school.logoPath) return;

            try {
                setLoading(true);
                setError(false);
                const url = await getImageUrl(school.logoPath);
                console.log(`Fetched logo URL for ${school.name}: ${url}`);
                setLogoUrl(url);
            } catch (err) {
                console.error(`Failed to fetch logo for ${school.name}:`, err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchLogo();
    }, [school.logoPath, school.logoUrl, school.logo, school.name, getImageUrl]);

    if (loading) {
        return <div className="logo-loading">로딩 중...</div>;
    }

    if (error || !logoUrl) {
        return <span>{school.shortName?.charAt(0) || school.name?.charAt(0) || "?"}</span>;
    }

    return (
        <img
            src={logoUrl}
            alt={`${school.name} 로고`}
            onError={(e) => {
                e.target.onerror = null;
                console.log(`로고 로딩 실패: ${school.name}`);
                setError(true);
            }}
        />
    );
};

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
                console.log("학교 목록 가져오기 시작");

                // 우선 DB에서 모든 학교 정보 가져오기 시도
                console.log("getAllUniversities 함수 호출 중...");
                const dbSchools = await getAllUniversities();
                console.log(`getAllUniversities 결과: ${dbSchools?.length || 0}개 학교 데이터 수신됨`);

                if (dbSchools && dbSchools.length > 0) {
                    console.log("DB에서 학교 데이터 성공적으로 수신");
                    // DB에서 가져온 학교 정보를 화면에 맞게 변환
                    const formattedSchools = await Promise.all(dbSchools.map(async school => {
                        // 로고 URL 가져오기 시도
                        let logoUrl = '';
                        if (school.logoPath) {
                            try {
                                logoUrl = await getImageUrlWithCacheBusting(school.logoPath);
                                console.log(`학교 ${school.name} 로고 URL 가져옴: ${logoUrl}`);
                            } catch (error) {
                                console.error(`학교 ${school.name} 로고 URL 가져오기 실패:`, error);
                            }
                        }

                        return {
                            id: school.id,
                            name: school.name || '이름 없음',
                            shortName: school.shortName || (school.name ? school.name.replace('대학교', '대').replace('학교', '') : '이름 없음'),
                            location: {
                                address: school.address || '',
                                region: school.location || '지역 정보 없음',
                                coordinates: school.coordinates || { latitude: 0, longitude: 0 }
                            },
                            website: school.website || '',
                            logoPath: school.logoPath || '',  // Preserve the logo path from Firebase
                            logoUrl: logoUrl,  // Store fetched URL if successful
                            logo: school.logo || '',  // Add direct logo URL field from Firebase
                            posterUrl: school.posterUrl || '' // Add poster URL field from Firebase
                        };
                    }));

                    console.log(`학교 데이터 포맷 완료: ${formattedSchools.length}개`);
                    setSchools(formattedSchools);
                    setFilteredSchools(formattedSchools);
                    console.log("학교 목록 상태 업데이트 완료");
                } else {
                    console.log("DB에서 학교 데이터를 찾지 못함, 축제 데이터에서 추출 시작");
                    // DB에 학교 데이터가 없는 경우, 축제 데이터에서 학교 정보 추출
                    const festivalSchools = new Map();

                    if (festivals && festivals.length > 0) {
                        console.log(`축제 데이터에서 학교 정보 추출 중: ${festivals.length}개 축제 확인`);
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
                                    },
                                    posterUrl: festival.university?.posterUrl || ''
                                });
                            }
                        });

                        const extractedSchools = Array.from(festivalSchools.values());
                        console.log(`축제 데이터에서 ${extractedSchools.length}개 학교 추출 완료`);
                        // Sort schools alphabetically by name
                        const sortedSchools = extractedSchools.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
                        setSchools(sortedSchools);
                        setFilteredSchools(sortedSchools);
                        console.log("학교 목록 상태 업데이트 완료 (축제 데이터에서 추출)");
                    } else {
                        console.log("축제 데이터도 없음, 빈 학교 목록 설정");
                        setSchools([]);
                        setFilteredSchools([]);
                    }
                }
            } catch (error) {
                console.error("학교 데이터를 가져오는데 실패했습니다:", error);

                // 축제 데이터에서 학교 정보 추출 (백업 메커니즘)
                console.log("오류 발생, 백업 메커니즘으로 축제 데이터에서 학교 정보 추출 시도");
                const uniqueSchools = new Map();

                if (festivals && festivals.length > 0) {
                    console.log(`백업: 축제 데이터에서 학교 정보 추출 중: ${festivals.length}개 축제 확인`);
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
                                },
                                posterUrl: festival.university?.posterUrl || ''
                            });
                        }
                    });

                    const extractedSchools = Array.from(uniqueSchools.values());
                    console.log(`백업: 축제 데이터에서 ${extractedSchools.length}개 학교 추출 완료`);
                    // Sort schools alphabetically by name
                    const sortedSchools = extractedSchools.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
                    setSchools(sortedSchools);
                    setFilteredSchools(sortedSchools);
                    console.log("백업: 학교 목록 상태 업데이트 완료");
                } else {
                    console.log("백업: 축제 데이터도 없음, 빈 학교 목록 설정");
                    setSchools([]);
                    setFilteredSchools([]);
                }
            } finally {
                setLoadingSchools(false);
                console.log("학교 데이터 로딩 상태 해제");
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
                                {(school.logoPath || school.logo) ? (
                                    <SchoolLogo
                                        school={school}
                                        getImageUrl={getImageUrlWithCacheBusting}
                                    />
                                ) : (
                                    <span>{school.shortName?.charAt(0) || school.name?.charAt(0) || "?"}</span>
                                )}
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
