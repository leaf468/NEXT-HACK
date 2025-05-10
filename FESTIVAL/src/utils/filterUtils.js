import { isDateInRange } from "./dateUtils";

// 축제 데이터 필터링 (여러 필터 조건으로)
export const filterFestivals = (festivals, filters) => {
    if (!festivals || !festivals.length) return [];

    return festivals.filter((festival) => {
        // 학교 필터
        if (
            filters.school &&
            !festival.school
                .toLowerCase()
                .includes(filters.school.toLowerCase())
        ) {
            return false;
        }

        // 아티스트 필터
        if (
            filters.artist &&
            !festival.artists.some((artist) =>
                artist.name.toLowerCase().includes(filters.artist.toLowerCase())
            )
        ) {
            return false;
        }

        // 날짜 필터
        if (
            filters.startDate &&
            filters.endDate &&
            !isDateInRange(
                festival.startDate,
                festival.endDate,
                filters.startDate,
                filters.endDate
            )
        ) {
            return false;
        }

        // 지역 필터
        if (
            filters.region &&
            !festival.location.region
                .toLowerCase()
                .includes(filters.region.toLowerCase())
        ) {
            return false;
        }

        // 필터 조건을 모두 통과한 경우
        return true;
    });
};

// 축제 상태별 필터링 (예정, 진행 중, 종료)
export const filterFestivalsByStatus = (festivals, status) => {
    if (!festivals || !festivals.length) return [];
    if (!status || status === "all") return festivals;

    const today = new Date();

    return festivals.filter((festival) => {
        const startDate = new Date(festival.startDate);
        const endDate = new Date(festival.endDate);

        switch (status) {
            case "upcoming":
                return today < startDate;
            case "ongoing":
                return today >= startDate && today <= endDate;
            case "ended":
                return today > endDate;
            default:
                return true;
        }
    });
};

// 정렬 기능
export const sortFestivals = (festivals, sortBy = "date", order = "asc") => {
    if (!festivals || !festivals.length) return [];

    const sortedFestivals = [...festivals];

    switch (sortBy) {
        case "date":
            sortedFestivals.sort((a, b) => {
                const dateA = new Date(a.startDate);
                const dateB = new Date(b.startDate);
                return order === "asc" ? dateA - dateB : dateB - dateA;
            });
            break;

        case "school":
            sortedFestivals.sort((a, b) => {
                const schoolA = a.school.toLowerCase();
                const schoolB = b.school.toLowerCase();
                return order === "asc"
                    ? schoolA.localeCompare(schoolB, "ko")
                    : schoolB.localeCompare(schoolA, "ko");
            });
            break;

        case "name":
            sortedFestivals.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return order === "asc"
                    ? nameA.localeCompare(nameB, "ko")
                    : nameB.localeCompare(nameA, "ko");
            });
            break;
    }

    return sortedFestivals;
};

// 검색어로 축제 필터링
export const searchFestivals = (festivals, searchTerm) => {
    if (!festivals || !festivals.length || !searchTerm) return festivals;

    const term = searchTerm.toLowerCase().trim();

    return festivals.filter(
        (festival) =>
            // 축제 이름
            festival.name.toLowerCase().includes(term) ||
            // 학교 이름
            festival.school.toLowerCase().includes(term) ||
            // 아티스트 이름
            festival.artists.some((artist) =>
                artist.name.toLowerCase().includes(term)
            ) ||
            // 지역
            (festival.location &&
                festival.location.region &&
                festival.location.region.toLowerCase().includes(term))
    );
};
