import { 
  getCollection, 
  getDocument, 
  addDocument, 
  updateDocument, 
  COLLECTIONS 
} from './api';
import { formatDate, isDateInRange } from "../utils/dateUtils";
import mockFestivals from "../data/festivals";

// API 서버가 없는 경우를 위한 모의 데이터 사용 플래그
const USE_MOCK_DATA = true;

// 모든 축제 데이터 가져오기
export const fetchFestivals = async () => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockFestivals);
      }, 500); // 실제 API 호출처럼 약간의 지연 추가
    });
  }

  try {
    // Firestore에서 festivals 컬렉션의 모든 문서 가져오기
    const festivals = await getCollection(COLLECTIONS.FESTIVALS, {
      orderByField: 'startDate',
      orderDirection: 'asc'
    });
    return festivals;
  } catch (error) {
    console.error("축제 데이터를 가져오는데 실패했습니다:", error);
    throw error;
  }
};

// 특정 축제 데이터 가져오기
export const fetchFestivalById = async (festivalId) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const festival = mockFestivals.find((f) => f.id === festivalId);
        if (festival) {
          resolve(festival);
        } else {
          reject(
            new Error(`축제 ID ${festivalId}를 찾을 수 없습니다.`)
          );
        }
      }, 300);
    });
  }

  try {
    // Firestore에서 특정 ID의 festival 문서 가져오기
    const festival = await getDocument(COLLECTIONS.FESTIVALS, festivalId);
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
  if (USE_MOCK_DATA || festivals) {
    // 로컬 필터링 (이미 전체 데이터가 있는 경우)
    const dataToFilter = festivals || mockFestivals;
    return dataToFilter.filter((festival) =>
      festival.school.toLowerCase().includes(schoolName.toLowerCase())
    );
  }

  try {
    // Firestore에서 학교명으로 필터링하여 가져오기
    const filteredFestivals = await getCollection(COLLECTIONS.FESTIVALS, {
      filters: [
        {
          field: 'school',
          operator: '>=',
          value: schoolName.toLowerCase()
        },
        {
          field: 'school',
          operator: '<=',
          value: schoolName.toLowerCase() + '\uf8ff'
        }
      ],
      orderByField: 'school'
    });
    return filteredFestivals;
  } catch (error) {
    console.error("학교별 축제 검색에 실패했습니다:", error);
    throw error;
  }
};

// 아티스트로 축제 검색
export const searchFestivalsByArtist = async (artistName, festivals = null) => {
  if (USE_MOCK_DATA || festivals) {
    // 로컬 필터링 (이미 전체 데이터가 있는 경우)
    const dataToFilter = festivals || mockFestivals;
    return dataToFilter.filter((festival) =>
      festival.artists.some((artist) =>
        artist.name.toLowerCase().includes(artistName.toLowerCase())
      )
    );
  }

  try {
    // Firestore에서 아티스트 배열 필드 검색은 복잡하므로, 
    // 모든 축제를 가져와서 클라이언트에서 필터링
    const allFestivals = await getCollection(COLLECTIONS.FESTIVALS);
    return allFestivals.filter(festival => 
      festival.artists.some(artist => 
        artist.name.toLowerCase().includes(artistName.toLowerCase())
      )
    );
  } catch (error) {
    console.error("아티스트별 축제 검색에 실패했습니다:", error);
    throw error;
  }
};

// 날짜로 축제 검색
export const searchFestivalsByDate = async (
  startDate,
  endDate,
  festivals = null
) => {
  if (USE_MOCK_DATA || festivals) {
    // 로컬 필터링 (이미 전체 데이터가 있는 경우)
    const dataToFilter = festivals || mockFestivals;
    return dataToFilter.filter((festival) =>
      isDateInRange(
        festival.startDate,
        festival.endDate,
        startDate,
        endDate
      )
    );
  }

  try {
    // Firestore에서 날짜 범위로 검색
    const filteredFestivals = await getCollection(COLLECTIONS.FESTIVALS, {
      filters: [
        {
          field: 'startDate',
          operator: '<=',
          value: formatDate(endDate)
        },
        {
          field: 'endDate',
          operator: '>=',
          value: formatDate(startDate)
        }
      ],
      orderByField: 'startDate'
    });
    return filteredFestivals;
  } catch (error) {
    console.error("날짜별 축제 검색에 실패했습니다:", error);
    throw error;
  }
};

// 지역별 축제 검색
export const searchFestivalsByRegion = async (region, festivals = null) => {
  if (USE_MOCK_DATA || festivals) {
    // 로컬 필터링 (이미 전체 데이터가 있는 경우)
    const dataToFilter = festivals || mockFestivals;
    return dataToFilter.filter((festival) =>
      festival.location.region
        .toLowerCase()
        .includes(region.toLowerCase())
    );
  }

  try {
    // Firestore에서 지역으로 검색
    const filteredFestivals = await getCollection(COLLECTIONS.FESTIVALS, {
      filters: [
        {
          field: 'location.region',
          operator: '>=',
          value: region.toLowerCase()
        },
        {
          field: 'location.region',
          operator: '<=',
          value: region.toLowerCase() + '\uf8ff'
        }
      ],
      orderByField: 'location.region'
    });
    return filteredFestivals;
  } catch (error) {
    console.error("지역별 축제 검색에 실패했습니다:", error);
    throw error;
  }
};

// 축제 추가
export const addFestival = async (festivalData) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFestival = {
          id: `mock-${Date.now()}`,
          ...festivalData
        };
        mockFestivals.push(newFestival);
        resolve(newFestival);
      }, 300);
    });
  }

  try {
    const festivalId = await addDocument(COLLECTIONS.FESTIVALS, festivalData);
    return {
      id: festivalId,
      ...festivalData
    };
  } catch (error) {
    console.error("축제 추가에 실패했습니다:", error);
    throw error;
  }
};

// 축제 업데이트
export const updateFestival = async (festivalId, festivalData) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockFestivals.findIndex(f => f.id === festivalId);
        if (index !== -1) {
          mockFestivals[index] = {
            ...mockFestivals[index],
            ...festivalData
          };
          resolve(mockFestivals[index]);
        } else {
          reject(new Error(`축제 ID ${festivalId}를 찾을 수 없습니다.`));
        }
      }, 300);
    });
  }

  try {
    await updateDocument(COLLECTIONS.FESTIVALS, festivalId, festivalData);
    return {
      id: festivalId,
      ...festivalData
    };
  } catch (error) {
    console.error(`축제 ID ${festivalId} 업데이트에 실패했습니다:`, error);
    throw error;
  }
};