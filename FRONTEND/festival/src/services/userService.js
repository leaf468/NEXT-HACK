import { 
  getDocument, 
  getCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument, 
  COLLECTIONS 
} from './api';
import { auth } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

// API 서버가 없는 경우를 위한 모의 데이터 사용 플래그
const USE_MOCK_DATA = true;

// 사용자 등록
export const registerUser = async (email, password, displayName) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userId = `mock-user-${Date.now()}`;
        localStorage.setItem('currentUser', JSON.stringify({
          id: userId,
          email,
          displayName
        }));
        resolve({ id: userId, email, displayName });
      }, 300);
    });
  }

  try {
    // Firebase Authentication으로 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 사용자 프로필 업데이트
    await updateProfile(user, { displayName });

    // Firestore에 사용자 데이터 저장
    await addDocument(COLLECTIONS.USERS, {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL: user.photoURL || null,
      createdAt: new Date().toISOString()
    });

    return {
      id: user.uid,
      email: user.email,
      displayName
    };
  } catch (error) {
    console.error("사용자 등록에 실패했습니다:", error);
    throw error;
  }
};

// 로그인
export const loginUser = async (email, password) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const userId = `mock-user-123`;
          const user = {
            id: userId,
            email,
            displayName: email.split('@')[0]
          };
          localStorage.setItem('currentUser', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('이메일과 비밀번호가 필요합니다.'));
        }
      }, 300);
    });
  }

  try {
    // Firebase Authentication으로 로그인
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    return {
      id: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  } catch (error) {
    console.error("로그인에 실패했습니다:", error);
    throw error;
  }
};

// 로그아웃
export const logoutUser = async () => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('currentUser');
        resolve(true);
      }, 300);
    });
  }

  try {
    // Firebase Authentication에서 로그아웃
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("로그아웃에 실패했습니다:", error);
    throw error;
  }
};

// 현재 로그인한 사용자 가져오기
export const getCurrentUser = () => {
  if (USE_MOCK_DATA) {
    const userString = localStorage.getItem('currentUser');
    return userString ? JSON.parse(userString) : null;
  }

  return auth.currentUser ? {
    id: auth.currentUser.uid,
    email: auth.currentUser.email,
    displayName: auth.currentUser.displayName
  } : null;
};

// 사용자 즐겨찾기 가져오기
export const getUserFavorites = async (userId) => {
  if (USE_MOCK_DATA) {
    // 로컬 스토리지에서 즐겨찾기 가져오기
    return new Promise((resolve) => {
      setTimeout(() => {
        const favorites = JSON.parse(
          localStorage.getItem("favorites") || "[]"
        );
        resolve(favorites);
      }, 300);
    });
  }

  try {
    // Firestore에서 사용자 즐겨찾기 가져오기
    const favorites = await getCollection(COLLECTIONS.FAVORITES, {
      filters: [
        { field: 'userId', operator: '==', value: userId }
      ],
      orderByField: 'createdAt',
      orderDirection: 'desc'
    });
    
    // festivalId만 추출하여 반환
    return favorites.map(favorite => favorite.festivalId);
  } catch (error) {
    console.error("즐겨찾기 데이터를 가져오는데 실패했습니다:", error);
    throw error;
  }
};

// 즐겨찾기 추가
export const addFavorite = async (userId, festivalId) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const favorites = JSON.parse(
          localStorage.getItem("favorites") || "[]"
        );
        if (!favorites.includes(festivalId)) {
          favorites.push(festivalId);
          localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
          );
        }
        resolve(favorites);
      }, 300);
    });
  }

  try {
    // 이미 즐겨찾기에 있는지 확인
    const existingFavorites = await getCollection(COLLECTIONS.FAVORITES, {
      filters: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'festivalId', operator: '==', value: festivalId }
      ]
    });

    // 이미 존재하지 않는 경우에만 추가
    if (existingFavorites.length === 0) {
      await addDocument(COLLECTIONS.FAVORITES, {
        userId,
        festivalId,
        createdAt: new Date().toISOString()
      });
    }

    // 업데이트된 즐겨찾기 목록 반환
    return await getUserFavorites(userId);
  } catch (error) {
    console.error("즐겨찾기 추가에 실패했습니다:", error);
    throw error;
  }
};

// 즐겨찾기 제거
export const removeFavorite = async (userId, festivalId) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const favorites = JSON.parse(
          localStorage.getItem("favorites") || "[]"
        );
        const updatedFavorites = favorites.filter(
          (id) => id !== festivalId
        );
        localStorage.setItem(
          "favorites",
          JSON.stringify(updatedFavorites)
        );
        resolve(updatedFavorites);
      }, 300);
    });
  }

  try {
    // 해당 즐겨찾기 항목 찾기
    const existingFavorites = await getCollection(COLLECTIONS.FAVORITES, {
      filters: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'festivalId', operator: '==', value: festivalId }
      ]
    });

    // 존재하는 경우 삭제
    if (existingFavorites.length > 0) {
      await deleteDocument(COLLECTIONS.FAVORITES, existingFavorites[0].id);
    }

    // 업데이트된 즐겨찾기 목록 반환
    return await getUserFavorites(userId);
  } catch (error) {
    console.error("즐겨찾기 제거에 실패했습니다:", error);
    throw error;
  }
};

// 사용자 알림 설정 가져오기
export const getUserNotificationSettings = async (userId) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const settings = JSON.parse(
          localStorage.getItem("notificationSettings") ||
            JSON.stringify({
              enabled: true,
              festivalUpdates: true,
              artistUpdates: true,
              newFestivals: true,
            })
        );
        resolve(settings);
      }, 300);
    });
  }

  try {
    // Firestore에서 사용자 문서 가져오기
    const user = await getDocument(COLLECTIONS.USERS, userId);
    
    // 알림 설정이 없는 경우 기본값 반환
    if (!user.notificationSettings) {
      return {
        enabled: true,
        festivalUpdates: true,
        artistUpdates: true,
        newFestivals: true
      };
    }
    
    return user.notificationSettings;
  } catch (error) {
    console.error("알림 설정을 가져오는데 실패했습니다:", error);
    throw error;
  }
};

// 사용자 알림 설정 업데이트
export const updateUserNotificationSettings = async (userId, settings) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(
          "notificationSettings",
          JSON.stringify(settings)
        );
        resolve(settings);
      }, 300);
    });
  }

  try {
    // Firestore 사용자 문서 업데이트
    await updateDocument(COLLECTIONS.USERS, userId, {
      notificationSettings: settings
    });
    
    return settings;
  } catch (error) {
    console.error("알림 설정 업데이트에 실패했습니다:", error);
    throw error;
  }
};