import React, { createContext, useState, useEffect, useCallback } from "react";
import {
    fetchFestivals,
    searchFestivalsBySchool,
    searchFestivalsByArtist,
    searchFestivalsByDate,
} from "../services/festivalService";

export const FestivalContext = createContext();

export const FestivalProvider = ({ children }) => {
    const [festivals, setFestivals] = useState([]);
    const [filteredFestivals, setFilteredFestivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        school: "",
        artist: "",
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
            setLoading(true);
            let results = [...festivals];

            // 날짜 필터
            if (filters.startDate && filters.endDate) {
                results = await searchFestivalsByDate(
                    filters.startDate,
                    filters.endDate,
                    results
                );
            }

            // 학교 필터
            if (filters.school) {
                results = await searchFestivalsBySchool(
                    filters.school,
                    results
                );
            }

            // 아티스트 필터
            if (filters.artist) {
                results = await searchFestivalsByArtist(
                    filters.artist,
                    results
                );
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
            startDate: null,
            endDate: null,
            school: "",
            artist: "",
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
            }}
        >
            {children}
        </FestivalContext.Provider>
    );
};
