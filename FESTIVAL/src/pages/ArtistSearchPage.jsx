import React, { useContext, useState, useEffect } from "react";
import { FestivalContext } from "../contexts/FestivalContext";
import { NotificationContext } from "../contexts/NotificationContext";
import SearchBar from "../components/common/SearchBar";
import ArtistList from "../components/artist/ArtistList";
import FestivalList from "../components/festival/FestivalList";
import { getAllArtists } from "../lib/firebase";
import { getFestivalStatus } from "../utils/dateUtils";

const ArtistSearchPage = () => {
    const { updateFilters, clearFilters, filteredFestivals, festivals, loading, error } =
        useContext(FestivalContext);
    const { displayNotification } = useContext(NotificationContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [artists, setArtists] = useState([]);
    const [filteredArtists, setFilteredArtists] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [loadingArtists, setLoadingArtists] = useState(true);

    // 데이터베이스에서 실제 아티스트 목록 가져오기
    useEffect(() => {
        const fetchArtists = async () => {
            try {
                setLoadingArtists(true);

                // 우선 DB에서 모든 아티스트 가져오기 시도
                const dbArtists = await getAllArtists();

                if (dbArtists && dbArtists.length > 0) {
                    setArtists(dbArtists);
                    setFilteredArtists(dbArtists);
                } else {
                    // DB에 아티스트 데이터가 없는 경우, 축제 데이터에서 추출
                    // festivals 컨텍스트에서 축제 데이터 가져오기
                    const festivalArtists = new Map();

                    festivals.forEach(festival => {
                        if (festival.artists && festival.artists.length > 0) {
                            festival.artists.forEach(artist => {
                                if (!festivalArtists.has(artist.id || artist.name)) {
                                    festivalArtists.set(artist.id || artist.name, {
                                        id: artist.id || `artist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                        name: artist.name,
                                        image: artist.image || '',
                                        genres: artist.genres || [],
                                        description: artist.description || `${artist.name}은(는) 여러 대학 축제에 출연하는 아티스트입니다.`,
                                        festivals: [festival.id]
                                    });
                                } else {
                                    // 이미 존재하는 아티스트면 출연 축제 리스트에 추가
                                    const existingArtist = festivalArtists.get(artist.id || artist.name);
                                    if (!existingArtist.festivals.includes(festival.id)) {
                                        existingArtist.festivals.push(festival.id);
                                    }
                                }
                            });
                        }
                    });

                    const extractedArtists = Array.from(festivalArtists.values());
                    // Sort artists alphabetically by name
                    const sortedArtists = extractedArtists.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
                    setArtists(sortedArtists);
                    setFilteredArtists(sortedArtists);
                }
            } catch (error) {
                console.error("아티스트 데이터를 가져오는데 실패했습니다:", error);
                // 축제 데이터에서 아티스트 정보 추출 (백업 메커니즘)
                const uniqueArtists = new Set();
                const extractedArtists = [];

                festivals.forEach(festival => {
                    if (festival.artists && festival.artists.length > 0) {
                        festival.artists.forEach(artist => {
                            if (!uniqueArtists.has(artist.name)) {
                                uniqueArtists.add(artist.name);
                                extractedArtists.push({
                                    id: artist.id || `artist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                    name: artist.name,
                                    image: artist.image || '',
                                    description: `${artist.name}은(는) ${festival.universityName || festival.university?.name || '여러 대학'} 축제에 출연하는 아티스트입니다.`,
                                });
                            }
                        });
                    }
                });

                // Sort artists alphabetically by name
                const sortedArtists = extractedArtists.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
                setArtists(sortedArtists);
                setFilteredArtists(sortedArtists);
            } finally {
                setLoadingArtists(false);
            }
        };

        fetchArtists();
    }, [festivals]);

    // 검색어에 따라 아티스트 필터링
    useEffect(() => {
        if (!searchTerm || artists.length === 0) {
            setFilteredArtists(artists);
            return;
        }

        const filtered = artists.filter((artist) =>
            artist.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredArtists(filtered);
    }, [searchTerm, artists]);

    // 아티스트 검색 핸들러
    const handleSearch = (query) => {
        setSearchTerm(query);

        if (query) {
            displayNotification(
                "아티스트 검색",
                `'${query}'에 대한 아티스트 검색 결과입니다.`,
                "info"
            );
        }
    };

    // 아티스트 선택 핸들러
    const handleArtistSelect = (artistName) => {
        setSelectedArtist(artistName);

        // 필터 초기화 후 아티스트 필터만 설정 (검색 충돌 방지)
        clearFilters(); // 기존 필터 모두 초기화
        updateFilters({ artist: artistName }); // 아티스트 필터만 설정

        displayNotification(
            "아티스트 선택",
            `'${artistName}'의 출연 축제 정보를 보여드립니다.`,
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
        setSelectedArtist(null);
        setSearchTerm("");

        displayNotification(
            "필터 초기화",
            "모든 필터가 초기화되었습니다.",
            "info"
        );
    };

    return (
        <div className="artist-search-page">
            <section className="search-section">
                <h1>아티스트별 검색</h1>
                <SearchBar
                    onSearch={handleSearch}
                    placeholder="아티스트 이름으로 검색"
                />
            </section>

            <section className="artists-section">
                <h2>
                    <i className="fa fa-music" style={{ color: 'var(--primary-color)' }}></i>
                    아티스트 목록
                </h2>
                {loadingArtists ? (
                    <div className="loading-spinner">아티스트 정보를 불러오는 중...</div>
                ) : filteredArtists.length > 0 ? (
                    <ArtistList
                        artists={filteredArtists}
                        onArtistSelect={handleArtistSelect}
                    />
                ) : (
                    <div className="no-artists">
                        <p>표시할 아티스트 정보가 없습니다.</p>
                    </div>
                )}
            </section>

            <section id="festivals-section" className="festivals-section">
                <div className="festivals-header">
                    <h2>
                        <i className="fa fa-calendar" style={{ color: 'var(--primary-color)' }}></i>
                        {selectedArtist
                            ? `'${selectedArtist}'의 출연 축제`
                            : "모든 축제"}
                    </h2>
                    {selectedArtist && (
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
                            {selectedArtist
                                ? `'${selectedArtist}'의 출연 축제 정보가 없습니다.`
                                : "표시할 축제 정보가 없습니다."}
                        </p>
                        {selectedArtist && (
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

export default ArtistSearchPage;
