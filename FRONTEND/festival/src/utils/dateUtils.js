import { format, isWithinInterval, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

// 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
export const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
        const date =
            typeof dateString === "string" ? parseISO(dateString) : dateString;
        return format(date, "yyyy년 MM월 dd일", { locale: ko });
    } catch (error) {
        console.error("날짜 포맷팅 오류:", error);
        return dateString;
    }
};

// 시간 포맷팅 (HH:MM -> 오전/오후 HH시 MM분)
export const formatTime = (timeString) => {
    if (!timeString) return "";

    try {
        // timeString이 'HH:MM' 형식이라고 가정
        const [hours, minutes] = timeString.split(":").map(Number);
        const isPM = hours >= 12;
        const formattedHours = isPM
            ? hours === 12
                ? 12
                : hours - 12
            : hours === 0
            ? 12
            : hours;
        return `${isPM ? "오후" : "오전"} ${formattedHours}시 ${minutes}분`;
    } catch (error) {
        console.error("시간 포맷팅 오류:", error);
        return timeString;
    }
};

// 날짜와 시간 포맷팅 (YYYY-MM-DDTHH:MM -> YYYY년 MM월 DD일 오전/오후 HH시 MM분)
export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";

    try {
        const date =
            typeof dateTimeString === "string"
                ? parseISO(dateTimeString)
                : dateTimeString;
        return format(date, "yyyy년 MM월 dd일 eeee a h시 mm분", { locale: ko });
    } catch (error) {
        console.error("날짜 및 시간 포맷팅 오류:", error);
        return dateTimeString;
    }
};

// 날짜 간격 체크 (축제 날짜가 선택된 날짜 범위 내에 있는지)
export const isDateInRange = (
    festivalStart,
    festivalEnd,
    filterStart,
    filterEnd
) => {
    if (!festivalStart || !festivalEnd || !filterStart || !filterEnd)
        return true;

    try {
        const fStart =
            typeof festivalStart === "string"
                ? parseISO(festivalStart)
                : festivalStart;
        const fEnd =
            typeof festivalEnd === "string"
                ? parseISO(festivalEnd)
                : festivalEnd;
        const start =
            typeof filterStart === "string"
                ? parseISO(filterStart)
                : filterStart;
        const end =
            typeof filterEnd === "string" ? parseISO(filterEnd) : filterEnd;

        // 축제 기간과 필터 기간이 겹치는지 확인
        return (
            // 축제 시작일이 필터 기간 내에 있거나
            isWithinInterval(fStart, { start, end }) ||
            // 축제 종료일이 필터 기간 내에 있거나
            isWithinInterval(fEnd, { start, end }) ||
            // 필터 시작일이 축제 기간 내에 있거나
            isWithinInterval(start, { start: fStart, end: fEnd }) ||
            // 필터 종료일이 축제 기간 내에 있는 경우
            isWithinInterval(end, { start: fStart, end: fEnd })
        );
    } catch (error) {
        console.error("날짜 범위 확인 오류:", error);
        return true; // 오류 발생 시 기본적으로 표시
    }
};

// 남은 일수 계산 (D-day)
export const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;

    try {
        const target =
            typeof targetDate === "string" ? parseISO(targetDate) : targetDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘 날짜의 자정으로 설정

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    } catch (error) {
        console.error("남은 일수 계산 오류:", error);
        return null;
    }
};

// 축제 상태 가져오기 (예정, 진행 중, 종료)
export const getFestivalStatus = (startDate, endDate) => {
    if (!startDate || !endDate)
        return { status: "unknown", label: "정보 없음" };

    try {
        const start =
            typeof startDate === "string" ? parseISO(startDate) : startDate;
        const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
        const today = new Date();

        if (today < start) {
            const daysRemaining = getDaysRemaining(start);
            return {
                status: "upcoming",
                label: `D-${daysRemaining}`,
            };
        } else if (today >= start && today <= end) {
            return {
                status: "ongoing",
                label: "진행중",
            };
        } else {
            return {
                status: "ended",
                label: "종료",
            };
        }
    } catch (error) {
        console.error("축제 상태 확인 오류:", error);
        return { status: "unknown", label: "정보 없음" };
    }
};
