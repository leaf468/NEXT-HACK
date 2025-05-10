import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  setDoc
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Helper function to get URLs with cache-busting parameter to avoid CORS issues
export const getImageUrlWithCacheBusting = async (path) => {
  try {
    const imageRef = ref(storage, path);
    const url = await getDownloadURL(imageRef);
    // Add timestamp to URL to bypass cache and prevent CORS issues
    return `${url}&t=${Date.now()}`;
  } catch (error) {
    console.warn(`Could not fetch image from path: ${path}`, error);
    return ''; // Return empty string if unable to fetch
  }
};

// Festival API functions
export const getAllFestivals = async () => {
  try {
    const festivalsRef = collection(db, "festivals");
    const festivalSnapshot = await getDocs(festivalsRef);
    const festivals = [];
    
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();
      
      // Get university data
      const universityRef = doc(db, "universities", festivalData.university_id);
      const universitySnap = await getDoc(universityRef);
      
      // Get artists data
      const artistsData = [];
      for (const artistId of festivalData.artist_ids) {
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          artistsData.push({ id: artistId, ...artistSnap.data() });
        }
      }
      
      festivals.push({
        id: festivalDoc.id,
        ...festivalData,
        university: universitySnap.exists() ? { id: universitySnap.id, ...universitySnap.data() } : null,
        artists: artistsData
      });
    }
    
    return festivals;
  } catch (error) {
    console.error("Error getting festivals:", error);
    throw error;
  }
};

export const getFestivalById = async (festivalId) => {
  try {
    const festivalRef = doc(db, "festivals", festivalId);
    const festivalSnap = await getDoc(festivalRef);
    
    if (!festivalSnap.exists()) {
      return null;
    }
    
    const festivalData = festivalSnap.data();
    
    // Get university data
    const universityRef = doc(db, "universities", festivalData.university_id);
    const universitySnap = await getDoc(universityRef);
    
    // Get artists data
    const artistsData = [];
    for (const artistId of festivalData.artist_ids) {
      const artistRef = doc(db, "artists", artistId);
      const artistSnap = await getDoc(artistRef);
      if (artistSnap.exists()) {
        artistsData.push({ id: artistId, ...artistSnap.data() });
      }
    }
    
    return {
      id: festivalSnap.id,
      ...festivalData,
      university: universitySnap.exists() ? { id: universitySnap.id, ...universitySnap.data() } : null,
      artists: artistsData
    };
  } catch (error) {
    console.error("Error getting festival:", error);
    throw error;
  }
};

export const getFestivalsByDate = async (date) => {
  try {
    const festivalsRef = collection(db, "festivals");
    // 타임스탬프로 검색하기 위해 날짜 시작과 끝을 계산
    const searchDate = new Date(date);

    // 날짜가 유효한지 확인
    if (isNaN(searchDate.getTime())) {
      console.error("Invalid date format:", date);
      return [];
    }

    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Searching for festivals on date: ${date}, searchDate: ${searchDate.toISOString()}`);

    // startDate <= endOfDay && endDate >= startOfDay 조건으로 날짜 범위 내 축제 검색
    // 참고: 이 방식은 Firebase의 where 조건이 복잡한 날짜 범위 쿼리를 효과적으로 지원하지 않아
    // 모든 축제를 가져온 후 클라이언트에서 필터링합니다.
    const festivalSnapshot = await getDocs(festivalsRef);

    const festivals = [];
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();

      // 로깅을 통한 디버깅
      console.log(`Checking festival "${festivalData.name || 'Unknown'}" (ID: ${festivalDoc.id})`);

      // 날짜 범위 내에 있는지 확인 (타임스탬프 필드 기준)
      // 만약 타임스탬프로 저장되어 있지 않으면 원래 방식도 유지
      let isInDateRange = false;

      // 타임스탬프 방식 확인
      if (festivalData.startDate && festivalData.endDate) {
        let festivalStartDate, festivalEndDate;

        // 타임스탬프 객체인 경우
        if (festivalData.startDate && typeof festivalData.startDate.toDate === 'function') {
          festivalStartDate = festivalData.startDate.toDate();
          console.log(`Festival start date (timestamp): ${festivalStartDate}`);
        } else if (typeof festivalData.startDate === 'string') {
          festivalStartDate = new Date(festivalData.startDate);
          console.log(`Festival start date (string): ${festivalStartDate}`);
        } else if (festivalData.startDate instanceof Date) {
          festivalStartDate = festivalData.startDate;
          console.log(`Festival start date (Date object): ${festivalStartDate}`);
        } else {
          console.warn(`Unknown startDate format: ${typeof festivalData.startDate}`);
          festivalStartDate = new Date(festivalData.startDate);
        }

        if (festivalData.endDate && typeof festivalData.endDate.toDate === 'function') {
          festivalEndDate = festivalData.endDate.toDate();
          console.log(`Festival end date (timestamp): ${festivalEndDate}`);
        } else if (typeof festivalData.endDate === 'string') {
          festivalEndDate = new Date(festivalData.endDate);
          console.log(`Festival end date (string): ${festivalEndDate}`);
        } else if (festivalData.endDate instanceof Date) {
          festivalEndDate = festivalData.endDate;
          console.log(`Festival end date (Date object): ${festivalEndDate}`);
        } else {
          console.warn(`Unknown endDate format: ${typeof festivalData.endDate}`);
          festivalEndDate = new Date(festivalData.endDate);
        }

        // 유효한 날짜인지 확인
        if (isNaN(festivalStartDate.getTime()) || isNaN(festivalEndDate.getTime())) {
          console.warn(`Invalid date for festival ${festivalData.name || 'Unknown'}:`, {
            startDate: festivalStartDate,
            endDate: festivalEndDate
          });
          continue; // 유효하지 않은 날짜는 건너뜀
        }

        // 날짜 비교를 위해 시간 정보 제거
        const startWithoutTime = new Date(festivalStartDate);
        startWithoutTime.setHours(0, 0, 0, 0);
        const endWithoutTime = new Date(festivalEndDate);
        endWithoutTime.setHours(23, 59, 59, 999);

        // 검색 날짜가 축제 기간 내에 있는지 확인
        isInDateRange = searchDate >= startWithoutTime && searchDate <= endWithoutTime;

        console.log(`Date range check for ${festivalData.name || 'Unknown'}:
          - Search date: ${searchDate.toISOString()}
          - Festival start: ${startWithoutTime.toISOString()}
          - Festival end: ${endWithoutTime.toISOString()}
          - Is in range: ${isInDateRange}`);
      }
      // 예전 방식 지원 (date 필드가 있는 경우)
      else if (festivalData.date) {
        // date 필드 형식이 문자열인지 확인 후 비교
        if (typeof festivalData.date === 'string') {
          // YYYY-MM-DD 형식의 날짜 비교
          isInDateRange = festivalData.date === date;
          console.log(`Legacy date check (string comparison): ${festivalData.date} === ${date}, result: ${isInDateRange}`);
        } else if (festivalData.date instanceof Date) {
          // Date 객체인 경우 날짜만 비교
          const festivalDateStr = festivalData.date.toISOString().split('T')[0];
          isInDateRange = festivalDateStr === date;
          console.log(`Legacy date check (Date object): ${festivalDateStr} === ${date}, result: ${isInDateRange}`);
        } else if (festivalData.date && typeof festivalData.date.toDate === 'function') {
          // Firestore Timestamp인 경우
          const festivalDateObj = festivalData.date.toDate();
          const festivalDateStr = festivalDateObj.toISOString().split('T')[0];
          isInDateRange = festivalDateStr === date;
          console.log(`Legacy date check (Timestamp): ${festivalDateStr} === ${date}, result: ${isInDateRange}`);
        }
      }

      if (!isInDateRange) {
        console.log(`Festival "${festivalData.name || 'Unknown'}" is not in date range. Skipping.`);
        continue; // 날짜 범위에 없으면 건너뜀
      }

      // Get university data
      const universityRef = doc(db, "universities", festivalData.university_id);
      const universitySnap = await getDoc(universityRef);

      // Get artists data
      const artistsData = [];
      for (const artistId of festivalData.artist_ids) {
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          artistsData.push({ id: artistId, ...artistSnap.data() });
        }
      }

      festivals.push({
        id: festivalDoc.id,
        ...festivalData,
        university: universitySnap.exists() ? { id: universitySnap.id, ...universitySnap.data() } : null,
        artists: artistsData
      });
    }

    return festivals;
  } catch (error) {
    console.error("Error getting festivals by date:", error);
    throw error;
  }
};

// User API functions
export const loginUser = async (username) => {
  try {
    // Check if user already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("name", "==", username));
    const userSnapshot = await getDocs(q);

    // If user exists, update last login and return user data
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      // Update lastLogin timestamp
      await updateDoc(doc(db, "users", userDoc.id), {
        lastLogin: new Date()
      });

      return { id: userDoc.id, ...userData, lastLogin: new Date() };
    }

    // Create new user if not exists
    const newUserData = {
      name: username,
      faves: [],  // 새 사용자는 빈 즐겨찾기 배열로 초기화
      createdAt: new Date(),
      lastLogin: new Date()
    };

    // 실제로 Firestore에 사용자 데이터 저장
    const userCollectionRef = collection(db, "users");
    const newUserRef = await addDoc(userCollectionRef, newUserData);
    console.log("New user created with ID: ", newUserRef.id);

    return { id: newUserRef.id, ...newUserData };
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    // Get user data
    const userData = userSnap.data();

    // Get and load favorite festivals if any
    let favoritesFull = [];
    if (userData.faves && userData.faves.length > 0) {
      // Optionally load the full festival details
      const favoritePromises = userData.faves.map(festivalId =>
        getFestivalById(festivalId)
      );
      favoritesFull = await Promise.all(favoritePromises);
      // Filter out any null values (festivals that may have been deleted)
      favoritesFull = favoritesFull.filter(Boolean);
    }

    return {
      id: userSnap.id,
      ...userData,
      favoritesFull // Include full festival details
    };
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// Favorites API functions
export const addFavorite = async (userId, festivalId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      faves: arrayUnion(festivalId)
    });
    
    return true;
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

export const removeFavorite = async (userId, festivalId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      faves: arrayRemove(festivalId)
    });
    
    return true;
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

export const getFavorites = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }
    
    const userData = userSnap.data();
    const favoriteIds = userData.faves || [];
    
    // Get festival data for each favorite
    const favorites = [];
    for (const festivalId of favoriteIds) {
      const festival = await getFestivalById(festivalId);
      if (festival) {
        favorites.push(festival);
      }
    }
    
    return favorites;
  } catch (error) {
    console.error("Error getting favorites:", error);
    throw error;
  }
};

// University and Artist helper functions
export const getAllUniversities = async () => {
  try {
    console.log("시작: 모든 대학교 데이터 가져오기");
    const universitiesRef = collection(db, "universities");
    const universitySnapshot = await getDocs(universitiesRef);

    console.log(`대학교 데이터 스냅샷 가져옴: ${universitySnapshot.docs.length}개 문서 발견`);

    // Process universities - don't fetch logo URLs, only use text data
    const universities = [];

    for (const universityDoc of universitySnapshot.docs) {
      try {
        const universityData = universityDoc.data();
        console.log(`대학교 처리 중: ${universityData.name || universityDoc.id}`);

        universities.push({
          id: universityDoc.id,
          ...universityData,
          // Preserve logo field from Firebase
          logo: universityData.logo || undefined,
          logoUrl: undefined
        });
      } catch (docError) {
        console.error(`대학교 데이터 처리 중 오류 발생 (ID: ${universityDoc.id}):`, docError);
        // Continue processing other universities despite this error
      }
    }

    console.log(`총 ${universities.length}개 대학교 데이터 처리 완료`);

    // 아직 대학교 데이터가 없으면 대체 데이터 반환
    if (universities.length === 0) {
      console.log("대학교 데이터가 없어 기본 데이터 생성");
      return [
        {
          id: 'default-snu',
          name: '서울대학교',
          shortName: '서울대',
          location: '서울특별시',
          address: '서울특별시 관악구 관악로 1'
        },
        {
          id: 'default-yonsei',
          name: '연세대학교',
          shortName: '연세대',
          location: '서울특별시',
          address: '서울특별시 서대문구 연세로 50'
        },
        {
          id: 'default-korea',
          name: '고려대학교',
          shortName: '고려대',
          location: '서울특별시',
          address: '서울특별시 성북구 안암로 145'
        },
        {
          id: 'default-kaist',
          name: '한국과학기술원',
          shortName: 'KAIST',
          location: '대전광역시',
          address: '대전광역시 유성구 대학로 291'
        },
        {
          id: 'default-suwon',
          name: '수원대학교',
          shortName: '수원대',
          location: '경기도',
          address: '경기도 화성시 봉담읍 와우안길 17'
        }
      ];
    }

    return universities;
  } catch (error) {
    console.error("대학교 데이터 가져오기 실패:", error);
    console.log("오류 발생으로 인해 기본 대학교 데이터 반환");

    // 에러 발생 시 기본 데이터 반환 (앱이 크래시되지 않도록)
    return [
      {
        id: 'default-snu',
        name: '서울대학교',
        shortName: '서울대',
        location: '서울특별시',
        address: '서울특별시 관악구 관악로 1'
      },
      {
        id: 'default-yonsei',
        name: '연세대학교',
        shortName: '연세대',
        location: '서울특별시',
        address: '서울특별시 서대문구 연세로 50'
      },
      {
        id: 'default-korea',
        name: '고려대학교',
        shortName: '고려대',
        location: '서울특별시',
        address: '서울특별시 성북구 안암로 145'
      },
      {
        id: 'default-kaist',
        name: '한국과학기술원',
        shortName: 'KAIST',
        location: '대전광역시',
        address: '대전광역시 유성구 대학로 291'
      },
      {
        id: 'default-suwon',
        name: '수원대학교',
        shortName: '수원대',
        location: '경기도',
        address: '경기도 화성시 봉담읍 와우안길 17'
      }
    ];
  }
};

export const getAllArtists = async () => {
  try {
    const artistsRef = collection(db, "artists");
    const artistSnapshot = await getDocs(artistsRef);
    
    return artistSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting artists:", error);
    throw error;
  }
};

// Search and filter functions
export const searchFestivalsByUniversity = async (universityName) => {
  try {
    // First get the university ID
    const universitiesRef = collection(db, "universities");
    const q = query(universitiesRef, where("name", "==", universityName));
    const universitySnapshot = await getDocs(q);
    
    if (universitySnapshot.empty) {
      return [];
    }
    
    const universityId = universitySnapshot.docs[0].id;
    
    // Then get festivals with that university ID
    const festivalsRef = collection(db, "festivals");
    const festivalQuery = query(festivalsRef, where("university_id", "==", universityId));
    const festivalSnapshot = await getDocs(festivalQuery);
    
    // Process festivals same as getAllFestivals
    const festivals = [];
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();
      
      // Get university data (we already have it)
      const universityData = universitySnapshot.docs[0].data();
      
      // Get artists data
      const artistsData = [];
      for (const artistId of festivalData.artist_ids) {
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          artistsData.push({ id: artistId, ...artistSnap.data() });
        }
      }
      
      festivals.push({
        id: festivalDoc.id,
        ...festivalData,
        university: { id: universitySnapshot.docs[0].id, ...universityData },
        artists: artistsData
      });
    }
    
    return festivals;
  } catch (error) {
    console.error("Error searching festivals by university:", error);
    throw error;
  }
};

export const searchFestivalsByArtist = async (artistName) => {
  try {
    // First get the artist ID
    const artistsRef = collection(db, "artists");
    const q = query(artistsRef, where("name", "==", artistName));
    const artistSnapshot = await getDocs(q);
    
    if (artistSnapshot.empty) {
      return [];
    }
    
    const artistId = artistSnapshot.docs[0].id;
    
    // Then get festivals with that artist ID in artist_ids array
    const festivalsRef = collection(db, "festivals");
    const festivalQuery = query(festivalsRef, where("artist_ids", "array-contains", artistId));
    const festivalSnapshot = await getDocs(festivalQuery);
    
    // Process festivals
    const festivals = [];
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();
      
      // Get university data
      const universityRef = doc(db, "universities", festivalData.university_id);
      const universitySnap = await getDoc(universityRef);
      
      // Get artists data
      const artistsData = [];
      for (const festArtistId of festivalData.artist_ids) {
        if (festArtistId === artistId) {
          // We already have this artist data
          artistsData.push({ id: artistId, ...artistSnapshot.docs[0].data() });
        } else {
          const artistRef = doc(db, "artists", festArtistId);
          const artistSnap = await getDoc(artistRef);
          if (artistSnap.exists()) {
            artistsData.push({ id: festArtistId, ...artistSnap.data() });
          }
        }
      }
      
      festivals.push({
        id: festivalDoc.id,
        ...festivalData,
        university: universitySnap.exists() ? { id: universitySnap.id, ...universitySnap.data() } : null,
        artists: artistsData
      });
    }
    
    return festivals;
  } catch (error) {
    console.error("Error searching festivals by artist:", error);
    throw error;
  }
};

export const filterFestivalsByLocation = async (location) => {
  try {
    // First get universities in this location
    const universitiesRef = collection(db, "universities");
    const q = query(universitiesRef, where("location", "==", location));
    const universitySnapshot = await getDocs(q);
    
    if (universitySnapshot.empty) {
      return [];
    }
    
    // Get university IDs
    const universityIds = universitySnapshot.docs.map(doc => doc.id);
    
    // Get all festivals
    const festivalsRef = collection(db, "festivals");
    const festivalSnapshot = await getDocs(festivalsRef);
    
    // Filter festivals manually (Firestore doesn't support OR queries easily)
    const festivals = [];
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();
      
      if (universityIds.includes(festivalData.university_id)) {
        // Get university data
        const universityDoc = universitySnapshot.docs.find(doc => doc.id === festivalData.university_id);
        
        // Get artists data
        const artistsData = [];
        for (const artistId of festivalData.artist_ids) {
          const artistRef = doc(db, "artists", artistId);
          const artistSnap = await getDoc(artistRef);
          if (artistSnap.exists()) {
            artistsData.push({ id: artistId, ...artistSnap.data() });
          }
        }
        
        festivals.push({
          id: festivalDoc.id,
          ...festivalData,
          university: { id: universityDoc.id, ...universityDoc.data() },
          artists: artistsData
        });
      }
    }
    
    return festivals;
  } catch (error) {
    console.error("Error filtering festivals by location:", error);
    throw error;
  }
};