import {
  loginUser as firebaseLoginUser,
  getUserById as firebaseGetUserById,
  addFavorite as addFirebaseFavorite,
  removeFavorite as removeFirebaseFavorite,
  getFavorites,
  db
} from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// 사용자 로그인 (간단한 방식)
export const loginUser = async (username) => {
  try {
    // 새로운 로그인 방식: 이름+숫자 형식으로 간단히 로그인
    const user = await firebaseLoginUser(username);

    // 브라우저에 사용자 정보 저장 (festivalUser 키를 사용하도록 수정)
    localStorage.setItem('festivalUser', JSON.stringify({
      id: user.id,
      name: user.name,
      faves: user.faves || [],
      lastLogin: user.lastLogin || new Date(),
      createdAt: user.createdAt || new Date()
    }));

    // 즐겨찾기 정보를 포함한 전체 데이터 로드
    if (user.faves && user.faves.length > 0) {
      // 즐겨찾기 데이터 미리 로드
      await getUserFavorites(user.id);
    }

    console.log("로그인 성공, 사용자 정보:", user);
    return user;
  } catch (error) {
    console.error("로그인에 실패했습니다:", error);
    throw error;
  }
};

// 로그아웃
export const logoutUser = async () => {
  try {
    localStorage.removeItem('festivalUser');
    return true;
  } catch (error) {
    console.error("로그아웃에 실패했습니다:", error);
    throw error;
  }
};

// 현재 로그인한 사용자 가져오기
export const getCurrentUser = () => {
  const userString = localStorage.getItem('festivalUser');
  return userString ? JSON.parse(userString) : null;
};

// 로컬 스토리지와 Firebase 간의 데이터 동기화
export const syncUserData = async () => {
  try {
    // 로컬 스토리지에서 현재 사용자 정보 가져오기
    const localUser = getCurrentUser();

    // 로그인한 사용자가 없으면 동기화할 필요 없음
    if (!localUser || !localUser.id) {
      console.log("로그인된 사용자 없음, 동기화 건너뜀");
      return null;
    }

    console.log("동기화 시작: 로컬 사용자 데이터", localUser);

    try {
      // Firebase에서 최신 사용자 정보 가져오기
      const remoteUser = await firebaseGetUserById(localUser.id);
      console.log("Firebase에서 받은 사용자 데이터:", remoteUser);

      if (!remoteUser) {
        console.log("Firebase에 사용자 정보가 없습니다. Firebase에 새로 사용자를 생성합니다.");
        // firebase에 사용자가 없는 경우 새로 만들기
        const createdUser = await firebaseLoginUser(localUser.name);
        console.log("Firebase에 새 사용자 생성됨:", createdUser);

        // 성공적으로 생성되었다면 동기화된 사용자 데이터 반환
        if (createdUser) {
          const syncedUser = {
            ...localUser,
            id: createdUser.id, // Firebase ID로 업데이트
            faves: createdUser.faves || [],
            lastLogin: createdUser.lastLogin || new Date()
          };

          // 로컬 스토리지 업데이트
          localStorage.setItem('festivalUser', JSON.stringify(syncedUser));
          return syncedUser;
        }
        return null;
      }

      // 데이터 통합 (Firebase 데이터 우선)
      const syncedUser = {
        ...localUser,
        faves: remoteUser.faves || [],
        lastLogin: remoteUser.lastLogin || localUser.lastLogin || new Date()
      };

      console.log("동기화된 사용자 데이터:", syncedUser);

      // 로컬 스토리지 업데이트
      localStorage.setItem('festivalUser', JSON.stringify(syncedUser));

      // 필요한 경우 Firebase 업데이트 (예: 로컬 스토리지에 존재하지만 Firebase에 없는 즐겨찾기)
      const localFaves = localUser.faves || [];
      const remoteFaves = remoteUser.faves || [];

      // 로컬에는 있지만 원격에는 없는 즐겨찾기가 있는지 확인
      const favesDiff = localFaves.filter(fave => !remoteFaves.includes(fave));

      if (favesDiff.length > 0) {
        // Firebase로 동기화
        const userRef = doc(db, "users", localUser.id);
        const updatedFaves = [...new Set([...remoteFaves, ...favesDiff])]; // 중복 제거

        await updateDoc(userRef, {
          faves: updatedFaves,
          lastSync: new Date()
        });

        console.log("Firebase에 즐겨찾기 동기화됨", updatedFaves);
      }

      return syncedUser;
    } catch (firebaseError) {
      console.error("Firebase 데이터 조회 오류:", firebaseError);

      // Firebase 접근 오류 시 로컬 데이터만 사용
      console.log("로컬 데이터만 사용합니다.");
      return localUser;
    }
  } catch (error) {
    console.error("사용자 데이터 동기화 중 오류 발생:", error);
    const localUser = getCurrentUser();
    console.log("오류로 인해 로컬 데이터만 사용:", localUser);
    return localUser; // 오류 발생 시 로컬 데이터 반환
  }
};

// 사용자 ID로 사용자 데이터 가져오기
export const getUserById = async (userId) => {
  try {
    const userData = await firebaseGetUserById(userId);

    if (userData) {
      // 로컬 스토리지 업데이트 (최신 정보 유지)
      localStorage.setItem('festivalUser', JSON.stringify({
        id: userData.id,
        name: userData.name,
        faves: userData.faves || [],
        lastLogin: userData.lastLogin || new Date(),
        createdAt: userData.createdAt || new Date()
      }));
    }

    return userData;
  } catch (error) {
    console.error(`사용자 ID ${userId}의 데이터를 가져오는데 실패했습니다:`, error);
    throw error;
  }
};

// 사용자 즐겨찾기 가져오기
export const getUserFavorites = async (userId) => {
  try {
    // Firebase에서 즐겨찾기 가져오기
    const favorites = await getFavorites(userId);

    // 로컬 스토리지 업데이트 (즐겨찾기 정보만)
    const userString = localStorage.getItem('festivalUser');
    if (userString) {
      const userData = JSON.parse(userString);
      // 즐겨찾기 ID 목록만 추출
      const favoriteIds = favorites.map(festival => festival.id);
      userData.faves = favoriteIds;
      localStorage.setItem('festivalUser', JSON.stringify(userData));
    }

    return favorites;
  } catch (error) {
    console.error("즐겨찾기 데이터를 가져오는데 실패했습니다:", error);
    throw error;
  }
};

// 즐겨찾기 추가
export const addFavorite = async (userId, festivalId) => {
  try {
    console.log(`Firebase에 즐겨찾기 추가: userId=${userId}, festivalId=${festivalId}`);
    await addFirebaseFavorite(userId, festivalId);

    // 로컬 스토리지 업데이트
    const userString = localStorage.getItem('festivalUser');
    if (userString) {
      const user = JSON.parse(userString);
      if (!user.faves) user.faves = [];
      if (!user.faves.includes(festivalId)) {
        user.faves.push(festivalId);
        localStorage.setItem('festivalUser', JSON.stringify(user));
      }
    }

    return await getUserFavorites(userId);
  } catch (error) {
    console.error("즐겨찾기 추가에 실패했습니다:", error);
    throw error;
  }
};

// 즐겨찾기 제거
export const removeFavorite = async (userId, festivalId) => {
  try {
    console.log(`Firebase에서 즐겨찾기 제거: userId=${userId}, festivalId=${festivalId}`);
    await removeFirebaseFavorite(userId, festivalId);

    // 로컬 스토리지 업데이트
    const userString = localStorage.getItem('festivalUser');
    if (userString) {
      const user = JSON.parse(userString);
      if (user.faves) {
        user.faves = user.faves.filter(id => id !== festivalId);
        localStorage.setItem('festivalUser', JSON.stringify(user));
      }
    }

    return await getUserFavorites(userId);
  } catch (error) {
    console.error("즐겨찾기 제거에 실패했습니다:", error);
    throw error;
  }
};

// 사용자 회원가입
export const registerUser = async (email, password, displayName) => {
  try {
    // 이 프로젝트는 email/password 회원가입이 아닌 username 기반 로그인만 하므로,
    // loginUser 함수를 기반으로 간단하게 구현합니다. (실제로는 같은 기능을 수행함)
    const user = await firebaseLoginUser(displayName);

    // 브라우저에 사용자 정보 저장 (festivalUser 키를 사용하도록 수정)
    localStorage.setItem('festivalUser', JSON.stringify({
      id: user.id,
      name: user.name,
      faves: user.faves || [],
      lastLogin: user.lastLogin || new Date(),
      createdAt: user.createdAt || new Date()
    }));

    console.log("회원가입 성공, 사용자 정보:", user);
    return user;
  } catch (error) {
    console.error("회원가입에 실패했습니다:", error);
    throw error;
  }
};