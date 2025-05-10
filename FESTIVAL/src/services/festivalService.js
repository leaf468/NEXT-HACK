import { Festival, Artist } from '../models';
import { formatDate, isDateInRange } from "../utils/dateUtils";
import {
  getAllFestivals,
  getFestivalById,
  getFestivalsByDate,
  searchFestivalsByUniversity,
  searchFestivalsByArtist as fetchFestivalsByArtist,
  filterFestivalsByLocation
} from '../lib/firebase';

// 모든 축제 데이터 가져오기
export const fetchFestivals = async () => {
  try {
    // Firestore에서 festivals 컬렉션의 모든 문서 가져오기
    const festivalsData = await getAllFestivals();

    // 데이터를 Festival 모델로 변환
    const festivals = festivalsData.map(festival =>
      new Festival(festival.id, {
        ...festival,
        universityName: festival.university?.name || '',
        location: { region: festival.university?.location || '' },
        artists: festival.artists || []
      })
    );

    return festivals;
  } catch (error) {
    console.error("축제 데이터를 가져오는데 실패했습니다:", error);
    throw error;
  }
};

// 특정 축제 데이터 가져오기
export const fetchFestivalById = async (festivalId) => {
  try {
    // Firestore에서 특정 ID의 festival 문서 가져오기
    const festivalData = await getFestivalById(festivalId);
    
    if (!festivalData) {
      throw new Error(`축제 ID ${festivalId}를 찾을 수 없습니다.`);
    }

    // 데이터를 Festival 모델로 변환
    const festival = new Festival(festivalData.id, {
      ...festivalData,
      universityName: festivalData.university?.name || '',
      location: { region: festivalData.university?.location || '' },
      artists: festivalData.artists || []
    });

    return festival;
  } catch (error) {
    console.error(
      `축제 ID ${festivalId}에 대한 데이터를 가져오는데 실패했습니다:`,
      error
    );
    throw error;
  }
};

// 학교로 축제 검색
export const searchFestivalsBySchool = async (schoolName, festivals = null) => {
  // 이미 전체 데이터가 있는 경우 로컬에서 필터링
  if (festivals) {
    const filtered = festivals.filter((festival) => {
      const schoolField = festival.universityName || festival.school || '';
      return schoolField.toLowerCase().includes(schoolName.toLowerCase());
    });
    return filtered;
  }

  try {
    // Firestore에서 학교명으로 필터링하여 가져오기
    const filteredFestivalsData = await searchFestivalsByUniversity(schoolName);

    // 데이터를 Festival 모델로 변환
    const filteredFestivals = filteredFestivalsData.map(festival =>
      new Festival(festival.id, {
        ...festival,
        universityName: festival.university?.name || '',
        location: { region: festival.university?.location || '' },
        artists: festival.artists || []
      })
    );

    return filteredFestivals;
  } catch (error) {
    console.error("학교별 축제 검색에 실패했습니다:", error);
    throw error;
  }
};

// 아티스트로 축제 검색
export const searchFestivalsByArtist = async (artistName, festivals = null) => {
  // 이미 전체 데이터가 있는 경우 로컬에서 필터링
  if (festivals) {
    return festivals.filter((festival) =>
      festival.artists.some((artist) =>
        artist.name.toLowerCase().includes(artistName.toLowerCase())
      )
    );
  }

  try {
    // Firestore에서 아티스트 이름으로 검색
    const filteredFestivalsData = await fetchFestivalsByArtist(artistName);

    // 데이터를 Festival 모델로 변환
    const filteredFestivals = filteredFestivalsData.map(festival =>
      new Festival(festival.id, {
        ...festival,
        universityName: festival.university?.name || '',
        location: { region: festival.university?.location || '' },
        artists: festival.artists || []
      })
    );

    return filteredFestivals;
  } catch (error) {
    console.error("아티스트별 축제 검색에 실패했습니다:", error);
    throw error;
  }
};

// 날짜로 축제 검색
export const searchFestivalsByDate = async (
  dateFilter,
  festivals = null
) => {
  // 이미 전체 데이터가 있는 경우 로컬에서 필터링
  if (festivals) {
    console.log("Filtering festivals by date locally:", dateFilter);

    // isDateInRange 유틸리티 함수 사용하여 날짜 범위 필터링
    return festivals.filter((festival) => {
      return isDateInRange(festival.startDate, festival.endDate, dateFilter);
    });
  }

  try {
    // 모든 케이스를 단일 날짜 문자열로 변환 (서버 호출용)
    let filterDate;

    // dateFilter가 객체인 경우 처리
    if (typeof dateFilter === 'object') {
      // 시작 날짜와 종료 날짜 중 하나만 있는 경우
      if (dateFilter.startDate && !dateFilter.endDate) {
        filterDate = dateFilter.startDate;
      } else if (!dateFilter.startDate && dateFilter.endDate) {
        filterDate = dateFilter.endDate;
      } else if (dateFilter.startDate && dateFilter.endDate) {
        // 시작일과 종료일이 모두 있는 경우, 시작일로 검색 (후처리로 정확하게 필터링)
        filterDate = dateFilter.startDate;
      } else {
        // 모든 필드가 비어있는 경우
        return festivals || [];
      }
    } else if (typeof dateFilter === 'string') {
      // 단일 날짜 문자열인 경우 (이전 버전 호환)
      filterDate = dateFilter;
    } else {
      // 다른 모든 경우 (null, undefined 등)
      return festivals || [];
    }

    // Firestore에서 날짜로 검색 (단일 날짜 기준으로)
    const filteredFestivalsData = await getFestivalsByDate(filterDate);

    // 데이터를 Festival 모델로 변환
    const filteredFestivals = filteredFestivalsData.map(festival =>
      new Festival(festival.id, {
        ...festival,
        universityName: festival.university?.name || '',
        location: { region: festival.university?.location || '' },
        artists: festival.artists || []
      })
    );

    // 날짜 범위가 지정된 경우 클라이언트 측에서 추가 필터링
    if (typeof dateFilter === 'object' && dateFilter.startDate && dateFilter.endDate) {
      return filteredFestivals.filter(festival =>
        isDateInRange(festival.startDate, festival.endDate, dateFilter)
      );
    }

    return filteredFestivals;
  } catch (error) {
    console.error("날짜별 축제 검색에 실패했습니다:", error);
    throw error;
  }
};

// 지역별 축제 검색
export const searchFestivalsByRegion = async (region, festivals = null) => {
  // 이미 전체 데이터가 있는 경우 로컬에서 필터링
  if (festivals) {
    return festivals.filter((festival) => {
      const location = festival.location?.region || '';
      return location.toLowerCase().includes(region.toLowerCase());
    });
  }

  try {
    // Firestore에서 지역으로 검색
    const filteredFestivalsData = await filterFestivalsByLocation(region);

    // 데이터를 Festival 모델로 변환
    const filteredFestivals = filteredFestivalsData.map(festival =>
      new Festival(festival.id, {
        ...festival,
        universityName: festival.university?.name || '',
        location: { region: festival.university?.location || '' },
        artists: festival.artists || []
      })
    );
    
    return filteredFestivals;
  } catch (error) {
    console.error("지역별 축제 검색에 실패했습니다:", error);
    throw error;
  }
};