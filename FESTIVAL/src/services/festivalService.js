import { Festival, Artist } from '../models';
import { formatDate, isDateInRange } from "../utils/dateUtils";
import {
  getAllFestivals,
  getFestivalById,
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
  console.log("searchFestivalsByDate called with:", dateFilter);

  // 빈 필터 또는 필터가 없는 경우 처리
  if (!dateFilter ||
     (typeof dateFilter === 'object' &&
      (!dateFilter.startDate && !dateFilter.endDate))) {
    console.log("Empty date filter, returning all festivals");
    return festivals || [];
  }

  // 이미 전체 데이터가 있는 경우 로컬에서 필터링 (클라이언트 측)
  if (festivals) {
    console.log("Filtering festivals by date locally:", dateFilter);

    // isDateInRange 유틸리티 함수 사용하여 날짜 범위 필터링
    return festivals.filter((festival) => {
      const result = isDateInRange(festival.startDate, festival.endDate, dateFilter);
      console.log(`Festival ${festival.id} date range check:`, result);
      return result;
    });
  }

  // 서버에서 데이터를 가져오는 경우 (API 호출)
  try {
    // 모든 축제를 가져와서 클라이언트에서 필터링하는 방식으로 변경
    const allFestivalsData = await getAllFestivals();

    // 데이터를 Festival 모델로 변환
    const allFestivals = allFestivalsData.map(festival =>
      new Festival(festival.id, {
        ...festival,
        universityName: festival.university?.name || '',
        location: { region: festival.university?.location || '' },
        artists: festival.artists || []
      })
    );

    // 날짜 필터 적용
    return allFestivals.filter(festival =>
      isDateInRange(festival.startDate, festival.endDate, dateFilter)
    );
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