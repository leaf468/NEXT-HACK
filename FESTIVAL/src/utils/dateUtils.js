import { format, isWithinInterval, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

// 한국어 날짜 형식을 ISO 형식으로 변환
export const convertKoreanDateToISO = (koreanDate) => {
    if (!koreanDate || typeof koreanDate !== "string") return null;

    // 이미 ISO 형식인지 확인 (YYYY-MM-DD)
    const isoPattern = /^\d{4}-\d{1,2}-\d{1,2}$/;
    if (isoPattern.test(koreanDate)) {
        // ISO 형식이지만 월과 일이 한 자리인 경우도 처리
        const [year, month, day] = koreanDate.split('-');
        const formattedMonth = month.padStart(2, '0');
        const formattedDay = day.padStart(2, '0');
        const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;

        console.log(`ISO 형식 정규화: ${koreanDate} => ${formattedDate}`);
        return formattedDate;
    }

    // "2025년 5월 16일" 형식 확인 (공백이 여러 개 있을 수 있음)
    const koreanPattern = /(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일/;
    const match = koreanDate.match(koreanPattern);

    if (match) {
        const year = match[1];
        // 한 자리 월/일을 두 자리로 변환 (1 -> 01)
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        console.log(`한국어 형식 변환: ${koreanDate} => ${formattedDate}`);
        return formattedDate;
    }

    // 공백이 없는 한국어 형식도 처리 "2025년5월16일"
    const noSpacePattern = /(\d{4})년(\d{1,2})월(\d{1,2})일/;
    const noSpaceMatch = koreanDate.match(noSpacePattern);

    if (noSpaceMatch) {
        const year = noSpaceMatch[1];
        const month = noSpaceMatch[2].padStart(2, '0');
        const day = noSpaceMatch[3].padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        console.log(`공백 없는 한국어 형식 변환: ${koreanDate} => ${formattedDate}`);
        return formattedDate;
    }

    // 변환할 수 없는 경우
    console.log("변환할 수 없는 날짜 형식:", koreanDate);
    return null;
};

// 날짜 포맷팅 (Timestamp 또는 YYYY-MM-DD -> YYYY년 MM월 DD일)
export const formatDate = (dateValue) => {
    if (!dateValue) return "날짜 정보 없음";

    try {
        let date;
        // 타임스탬프 객체인 경우 (Firestore Timestamp가 toDate 메서드를 가짐)
        if (dateValue && typeof dateValue.toDate === 'function') {
            date = dateValue.toDate();
        }
        // Date 객체인 경우
        else if (dateValue instanceof Date) {
            date = dateValue;
        }
        // 문자열인 경우
        else if (typeof dateValue === "string") {
            // 한국어 날짜 형식인지 확인 및 변환
            const isoDate = convertKoreanDateToISO(dateValue);
            if (isoDate) {
                date = parseISO(isoDate);
            } else {
                date = parseISO(dateValue);
            }
        }
        // 그 외의 경우
        else {
            date = dateValue;
        }

        // 유효한 날짜인지 확인
        if (isNaN(date.getTime())) {
            console.warn("유효하지 않은 날짜:", dateValue);
            if (typeof dateValue === "string") {
                return dateValue; // 원본 문자열 반환
            }
            return "날짜 정보 오류";
        }

        return format(date, "yyyy년 MM월 dd일", { locale: ko });
    } catch (error) {
        console.error("날짜 포맷팅 오류:", error, dateValue);
        // 문자열 형태로 반환할 수 있으면 원본 값 그대로 반환
        if (typeof dateValue === "string") {
            return dateValue;
        }
        // 그 외에는 오류 메시지
        return "날짜 형식 오류";
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

// 날짜 간격 체크 (축제 날짜가 선택된 필터 날짜 범위에 포함되는지)
export const isDateInRange = (
    festivalStart,
    festivalEnd,
    filterDate
) => {
    // 축제 날짜가 없는 경우 모든 필터링에서 제외
    if (!festivalStart) return true;

    // 필터 데이터가 없는 경우 모든 축제 포함
    if (!filterDate) return true;

    // 필터 날짜가 빈 객체이거나 시작 날짜가 없는 경우 모든 축제 포함
    if (
        (typeof filterDate === 'object' && Object.keys(filterDate).length === 0) ||
        (filterDate.startDate === "")
    ) {
        return true;
    }

    try {
        console.log("isDateInRange checking with filterDate:", filterDate);

        // 축제 시작 날짜 변환
        let fStart;
        if (typeof festivalStart === "string") {
            // 한국어 날짜 형식인지 확인
            const isoDate = convertKoreanDateToISO(festivalStart);
            if (isoDate) {
                fStart = parseISO(isoDate);
            } else {
                fStart = parseISO(festivalStart);
            }
        } else if (festivalStart && typeof festivalStart.toDate === 'function') {
            fStart = festivalStart.toDate();
        } else if (festivalStart instanceof Date) {
            fStart = festivalStart;
        } else {
            console.warn("Unknown festivalStart format:", festivalStart);
            return true; // 알 수 없는 형식인 경우 일단 포함시킴
        }

        // 축제 종료 날짜 변환 (없으면 시작일과 같다고 가정)
        let fEnd;
        if (!festivalEnd) {
            fEnd = new Date(fStart);
        } else if (typeof festivalEnd === "string") {
            // 한국어 날짜 형식인지 확인
            const isoDate = convertKoreanDateToISO(festivalEnd);
            if (isoDate) {
                fEnd = parseISO(isoDate);
            } else {
                fEnd = parseISO(festivalEnd);
            }
        } else if (festivalEnd && typeof festivalEnd.toDate === 'function') {
            fEnd = festivalEnd.toDate();
        } else if (festivalEnd instanceof Date) {
            fEnd = festivalEnd;
        } else {
            fEnd = new Date(fStart);
        }

        // 날짜가 유효한지 확인
        if (isNaN(fStart.getTime()) || isNaN(fEnd.getTime())) {
            console.warn("Invalid festival date in range check:", { fStart, fEnd });
            return true; // 유효하지 않은 날짜는 일단 포함시킴
        }

        // 날짜 비교를 위해 시간 정보 표준화
        fStart.setHours(0, 0, 0, 0);
        fEnd.setHours(23, 59, 59, 999); // 종료일은 하루의 끝으로 설정

        // 필터 날짜 처리
        if (typeof filterDate === "string") {
            // 한국어 날짜 형식 확인
            let singleDateStr = filterDate;
            const isoDate = convertKoreanDateToISO(filterDate);
            if (isoDate) {
                singleDateStr = isoDate;
            }

            // 단일 날짜 필터링
            const singleDate = parseISO(singleDateStr);
            const endOfDay = new Date(singleDate);

            singleDate.setHours(0, 0, 0, 0);
            endOfDay.setHours(23, 59, 59, 999);

            // 유효하지 않은 날짜인 경우 모든 축제 포함
            if (isNaN(singleDate.getTime())) {
                console.warn("Invalid filter date:", filterDate);
                return true;
            }

            // 선택한 날짜가 축제 기간에 포함되는지 확인
            return (
                (fStart <= endOfDay && fEnd >= singleDate) // 축제 기간과 선택 날짜가 겹치는지
            );
        }

        // 필터에 날짜 범위가 있는 경우
        if (filterDate.startDate) {
            // 한국어 날짜 형식 확인 (시작일)
            let startDateStr = filterDate.startDate;
            const isoStartDate = convertKoreanDateToISO(filterDate.startDate);
            if (isoStartDate) {
                startDateStr = isoStartDate;
            }

            const filterStartDate = parseISO(startDateStr);
            filterStartDate.setHours(0, 0, 0, 0);

            // 시작일만 있고 종료일이 없거나 같은 경우 (단일 날짜 선택)
            if (!filterDate.endDate || filterDate.endDate === filterDate.startDate) {
                const endOfFilterDay = new Date(filterStartDate);
                endOfFilterDay.setHours(23, 59, 59, 999);

                return (
                    (fStart <= endOfFilterDay && fEnd >= filterStartDate) // 축제 기간과 선택 날짜가 겹치는지
                );
            }

            // 한국어 날짜 형식 확인 (종료일)
            let endDateStr = filterDate.endDate;
            const isoEndDate = convertKoreanDateToISO(filterDate.endDate);
            if (isoEndDate) {
                endDateStr = isoEndDate;
            }

            // 날짜 범위 필터링
            const filterEndDate = parseISO(endDateStr);
            filterEndDate.setHours(23, 59, 59, 999); // 종료일은 하루의 끝으로 설정

            // 유효하지 않은 날짜인 경우 모든 축제 포함
            if (isNaN(filterStartDate.getTime()) || isNaN(filterEndDate.getTime())) {
                console.warn("Invalid date range in filter:", {
                    start: filterDate.startDate,
                    end: filterDate.endDate
                });
                return true;
            }

            // 축제가 필터 날짜 범위와 겹치는지 확인
            return (
                // 축제가 필터 범위에 완전히 포함되거나, 일부 겹치는 경우 표시
                (fStart <= filterEndDate && fEnd >= filterStartDate)
            );
        }

        return true; // 기본적으로 모든 축제 포함
    } catch (error) {
        console.error("날짜 범위 확인 오류:", error, { filterDate, festivalStart, festivalEnd });
        return true; // 오류 발생 시 기본적으로 표시
    }
};

// 남은 일수 계산 (D-day)
export const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;

    try {
        let target;
        // 타임스탬프 객체인 경우 (Firestore Timestamp가 toDate 메서드를 가짐)
        if (targetDate && typeof targetDate.toDate === 'function') {
            target = targetDate.toDate();
        }
        // 문자열인 경우
        else if (typeof targetDate === "string") {
            // 한국어 날짜 형식인지 확인
            const isoDate = convertKoreanDateToISO(targetDate);
            if (isoDate) {
                target = parseISO(isoDate);
            } else {
                target = parseISO(targetDate);
            }
        }
        // Date 객체인 경우
        else {
            target = targetDate;
        }

        // 유효한 날짜인지 확인
        if (isNaN(target.getTime())) {
            console.warn("유효하지 않은 날짜 (getDaysRemaining):", targetDate);
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘 날짜의 자정으로 설정

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    } catch (error) {
        console.error("남은 일수 계산 오류:", error, targetDate);
        return null;
    }
};

// 축제 상태 가져오기 (예정, 진행 중, 종료)
export const getFestivalStatus = (startDate, endDate) => {
    if (!startDate || !endDate)
        return { status: "unknown", label: "정보 없음" };

    try {
        let start;
        // 타임스탬프 객체인 경우 (Firestore Timestamp가 toDate 메서드를 가짐)
        if (startDate && typeof startDate.toDate === 'function') {
            start = startDate.toDate();
        }
        // 문자열인 경우
        else if (typeof startDate === "string") {
            // 한국어 날짜 형식인지 확인
            const isoDate = convertKoreanDateToISO(startDate);
            if (isoDate) {
                start = parseISO(isoDate);
            } else {
                start = parseISO(startDate);
            }
        }
        // Date 객체인 경우
        else {
            start = startDate;
        }

        let end;
        // 타임스탬프 객체인 경우 (Firestore Timestamp가 toDate 메서드를 가짐)
        if (endDate && typeof endDate.toDate === 'function') {
            end = endDate.toDate();
        }
        // 문자열인 경우
        else if (typeof endDate === "string") {
            // 한국어 날짜 형식인지 확인
            const isoDate = convertKoreanDateToISO(endDate);
            if (isoDate) {
                end = parseISO(isoDate);
            } else {
                end = parseISO(endDate);
            }
        }
        // Date 객체인 경우
        else {
            end = endDate;
        }

        // 유효한 날짜인지 확인
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.warn("유효하지 않은 날짜 (getFestivalStatus):", { startDate, endDate });
            return { status: "unknown", label: "정보 없음" };
        }

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
        console.error("축제 상태 확인 오류:", error, startDate, endDate);
        return { status: "unknown", label: "정보 없음" };
    }
};
