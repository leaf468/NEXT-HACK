import {
  loginUser as firebaseLoginUser,
  getUserById as firebaseGetUserById,
  addFavorite as addFirebaseFavorite,
  removeFavorite as removeFirebaseFavorite,
  getFavorites
} from '../lib/firebase';

// 사용자 로그인 (간단한 방식)
export const loginUser = async (username) => {
  try {
    // 새로운 로그인 방식: 이름+숫자 형식으로 간단히 로그인
    const user = await firebaseLoginUser(username);
    
    // 브라우저에 사용자 정보 저장 (나중에 사용할 수 있게)
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      name: user.name,
      faves: user.faves || []
    }));
    
    return user;
  } catch (error) {
    console.error("로그인에 실패했습니다:", error);
    throw error;
  }
};

// 로그아웃
export const logoutUser = async () => {
  try {
    localStorage.removeItem('currentUser');
    return true;
  } catch (error) {
    console.error("로그아웃에 실패했습니다:", error);
    throw error;
  }
};

// 현재 로그인한 사용자 가져오기
export const getCurrentUser = () => {
  const userString = localStorage.getItem('currentUser');
  return userString ? JSON.parse(userString) : null;
};

// 사용자 ID로 사용자 데이터 가져오기
export const getUserById = async (userId) => {
  try {
    return await firebaseGetUserById(userId);
  } catch (error) {
    console.error(`사용자 ID ${userId}의 데이터를 가져오는데 실패했습니다:`, error);
    throw error;
  }
};

// 사용자 즐겨찾기 가져오기
export const getUserFavorites = async (userId) => {
  try {
    const favorites = await getFavorites(userId);
    return favorites;
  } catch (error) {
    console.error("즐겨찾기 데이터를 가져오는데 실패했습니다:", error);
    throw error;
  }
};

// 즐겨찾기 추가
export const addFavorite = async (userId, festivalId) => {
  try {
    await addFirebaseFavorite(userId, festivalId);
    
    // 로컬 스토리지 업데이트
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      const user = JSON.parse(userString);
      if (!user.faves.includes(festivalId)) {
        user.faves.push(festivalId);
        localStorage.setItem('currentUser', JSON.stringify(user));
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
    await removeFirebaseFavorite(userId, festivalId);

    // 로컬 스토리지 업데이트
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      const user = JSON.parse(userString);
      user.faves = user.faves.filter(id => id !== festivalId);
      localStorage.setItem('currentUser', JSON.stringify(user));
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

    // 브라우저에 사용자 정보 저장
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      name: user.name,
      faves: user.faves || []
    }));

    return user;
  } catch (error) {
    console.error("회원가입에 실패했습니다:", error);
    throw error;
  }
};