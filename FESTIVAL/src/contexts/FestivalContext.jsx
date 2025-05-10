import React, { createContext, useState, useEffect, useCallback } from "react";
import {
    fetchFestivals,
    searchFestivalsBySchool,
    searchFestivalsByArtist,
    searchFestivalsByDate,
    searchFestivalsByRegion,
} from "../services/festivalService";

export const FestivalContext = createContext();

export const FestivalProvider = ({ children }) => {
    const [festivals, setFestivals] = useState([]);
    const [filteredFestivals, setFilteredFestivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        date: { startDate: "", endDate: "" },
        school: "",
        artist: "",
        region: "",
    });

    // 모든 축제 데이터 불러오기
    useEffect(() => {
        const loadFestivals = async () => {
            try {
                setLoading(true);
                const data = await fetchFestivals();
                setFestivals(data);
                setFilteredFestivals(data);
            } catch (err) {
                setError("축제 정보를 불러오는데 실패했습니다.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadFestivals();
    }, []);

    // 필터 적용
    const applyFilters = useCallback(async () => {
        try {
            // 이전 상태와 동일한 필터인 경우 불필요한 상태 업데이트 방지
            if (festivals.length === 0) {
                setFilteredFestivals([]);
                return;
            }

            setLoading(true);
            let results = [...festivals];

            // 날짜 필터
            if (filters.date && (filters.date.startDate || filters.date.endDate)) {
                results = await searchFestivalsByDate(
                    filters.date,
                    results
                );
            }

            // 학교 필터 - 빈 문자열인 경우도 적절히 처리
            if (filters.school !== null && filters.school !== undefined) {
                if (filters.school === "") {
                    // 학교 필터가 비워졌을 때 (빈 문자열로 설정됨)
                    // 모든 축제를 보여주기
                    results = [...festivals];
                } else {
                    results = await searchFestivalsBySchool(
                        filters.school,
                        results
                    );
                }
            }

            // 아티스트 필터 - 빈 문자열인 경우도 적절히 처리
            if (filters.artist !== null && filters.artist !== undefined) {
                if (filters.artist === "") {
                    // 아티스트 필터가 비워졌을 때 (빈 문자열로 설정됨)
                    // 이미 적용된 다른 필터가 있을 수 있으므로 results는 변경하지 않음
                } else {
                    results = await searchFestivalsByArtist(
                        filters.artist,
                        results
                    );
                }
            }

            // 지역 필터 - 빈 문자열인 경우도 적절히 처리
            if (filters.region !== null && filters.region !== undefined) {
                if (filters.region === "") {
                    // 지역 필터가 비워졌을 때 (빈 문자열로 설정됨)
                    // 이미 적용된 다른 필터가 있을 수 있으므로 results는 변경하지 않음
                } else {
                    results = await searchFestivalsByRegion(
                        filters.region,
                        results
                    );
                }
            }

            setFilteredFestivals(results);
        } catch (err) {
            setError("검색 중 오류가 발생했습니다.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [festivals, filters]);

    // 필터가 변경될 때마다 적용
    useEffect(() => {
        applyFilters();
    }, [filters, applyFilters]);

    // 필터 값 업데이트
    const updateFilters = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    // 필터 초기화
    const clearFilters = () => {
        setFilters({
            date: { startDate: "", endDate: "" },
            school: "",
            artist: "",
            region: "",
        });
        setFilteredFestivals(festivals);
    };

    // 특정 축제 ID로 찾기
    const getFestivalById = (id) => {
        return festivals.find((festival) => festival.id === id) || null;
    };

    // 특정 학교의 축제 찾기
    const getFestivalsBySchool = (schoolName) => {
        return festivals.filter((festival) =>
            festival.school.toLowerCase().includes(schoolName.toLowerCase())
        );
    };

    // 특정 아티스트가 출연하는 축제 찾기
    const getFestivalsByArtist = (artistName) => {
        return festivals.filter((festival) =>
            festival.artists.some((artist) =>
                artist.name.toLowerCase().includes(artistName.toLowerCase())
            )
        );
    };

    // 특정 지역의 축제 찾기
    const getFestivalsByRegion = (regionName) => {
        return festivals.filter((festival) => {
            const festivalRegion = festival.location?.region || "";
            return festivalRegion.toLowerCase().includes(regionName.toLowerCase());
        });
    };

    return (
        <FestivalContext.Provider
            value={{
                festivals,
                filteredFestivals,
                loading,
                error,
                filters,
                updateFilters,
                clearFilters,
                getFestivalById,
                getFestivalsBySchool,
                getFestivalsByArtist,
                getFestivalsByRegion,
            }}
        >
            {children}
        </FestivalContext.Provider>
    );
};
