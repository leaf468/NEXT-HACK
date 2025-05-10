import React, { useContext, useState, useEffect } from "react";
import { FestivalContext } from "../contexts/FestivalContext";
import { NotificationContext } from "../contexts/NotificationContext";
import SearchBar from "../components/common/SearchBar";
import ArtistList from "../components/artist/ArtistList";
import FestivalList from "../components/festival/FestivalList";
import artists from "../data/artists";

const ArtistSearchPage = () => {
    const { updateFilters, clearFilters, filteredFestivals, loading, error } =
        useContext(FestivalContext);
    const { displayNotification } = useContext(NotificationContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredArtists, setFilteredArtists] = useState(artists);
    const [selectedArtist, setSelectedArtist] = useState(null);

    // 검색어에 따라 아티스트 필터링
    useEffect(() => {
        if (!searchTerm) {
            setFilteredArtists(artists);
            return;
        }

        const filtered = artists.filter((artist) =>
            artist.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredArtists(filtered);
    }, [searchTerm]);

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
        updateFilters({ artist: artistName, school: "" });

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
                <h2>아티스트 목록</h2>
                <ArtistList
                    artists={filteredArtists}
                    onArtistSelect={handleArtistSelect}
                />
            </section>

            <section id="festivals-section" className="festivals-section">
                <div className="festivals-header">
                    <h2>
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
