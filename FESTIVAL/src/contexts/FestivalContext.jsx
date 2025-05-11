import React, { createContext, useState, useEffect, useCallback } from "react";
import {
    fetchFestivals,
    searchFestivalsBySchool,
    searchFestivalsByArtist,
    searchFestivalsByDate,
    searchFestivalsByRegion,
    filterFestivalsByStatus,
} from "../services/festivalService";
import { getFestivalStatus, getDaysRemaining } from "../utils/dateUtils";

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
        showOnlyActive: true,
    });

    // 축제 데이터에 상태 및 D-day 정보 추가
    const processFestivalData = (festivals) => {
        return festivals.map(festival => {
            const festivalStatus = getFestivalStatus(festival.startDate, festival.endDate);
            const dDays = festival.startDate ? getDaysRemaining(festival.startDate) : null;

            return {
                ...festival,
                status: festivalStatus.status,
                statusLabel: festivalStatus.label,
                dDays: dDays,
                festivalStatus: festivalStatus
            };
        });
    };

    // 모든 축제 데이터 불러오기
    useEffect(() => {
        const loadFestivals = async () => {
            try {
                setLoading(true);
                const data = await fetchFestivals();
                // 축제 데이터에 상태 및 D-day 정보 추가
                const processedData = processFestivalData(data);
                setFestivals(processedData);
                setFilteredFestivals(processedData);
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
            console.log("Applying filters:", filters);

            // 필터 적용 최적화: 최소 결과가 나오는 필터부터 적용

            // 아티스트 필터와 학교 필터가 모두 있는 경우 특별 처리
            if (filters.artist && filters.school) {
                console.log("아티스트와 학교 필터 모두 적용 중:", filters.artist, filters.school);

                // 먼저 아티스트로 필터링
                const artistFiltered = await searchFestivalsByArtist(filters.artist, results);
                // 그 다음 학교로 필터링
                results = await searchFestivalsBySchool(filters.school, artistFiltered);

                console.log("아티스트와 학교 필터 적용 후:", results.length);
            } else {
                // 단일 필터 적용

                // 학교 필터 적용
                if (filters.school) {
                    results = await searchFestivalsBySchool(filters.school, results);
                    console.log("학교 필터 적용 후:", results.length);
                }

                // 아티스트 필터 적용
                if (filters.artist) {
                    results = await searchFestivalsByArtist(filters.artist, results);
                    console.log("아티스트 필터 적용 후:", results.length);
                }
            }

            // 지역 필터 적용
            if (filters.region) {
                results = await searchFestivalsByRegion(filters.region, results);
                console.log("지역 필터 적용 후:", results.length);
            }

            // 날짜 필터를 마지막에 적용
            if (filters.date && (filters.date.startDate || filters.date.endDate)) {
                console.log("날짜 필터 적용 중:", filters.date);

                // 날짜 필터링 전에 유효성 검사 및 로깅
                if (typeof filters.date === 'string') {
                    console.log("문자열 형식 날짜 필터:", filters.date);
                } else if (typeof filters.date === 'object') {
                    if (filters.date.startDate) {
                        console.log("시작일:", filters.date.startDate);
                        // 한국어 날짜 확인 가능
                        if (filters.date.startDate.includes('년')) {
                            console.log("시작일에 한국어 날짜 형식 감지됨");
                        }
                    }
                    if (filters.date.endDate) {
                        console.log("종료일:", filters.date.endDate);
                        // 한국어 날짜 확인 가능
                        if (filters.date.endDate.includes('년')) {
                            console.log("종료일에 한국어 날짜 형식 감지됨");
                        }
                    }
                }

                results = await searchFestivalsByDate(filters.date, results);
                console.log("날짜 필터 적용 후:", results.length);
            }

            // 축제 상태(진행 중/종료) 필터 적용
            results = filterFestivalsByStatus(results, filters.showOnlyActive);
            console.log("상태 필터 적용 후 (showOnlyActive:", filters.showOnlyActive, "):", results.length);

            // 축제 데이터에 상태와 D-day 정보 추가
            results = processFestivalData(results);

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
            showOnlyActive: true,
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
