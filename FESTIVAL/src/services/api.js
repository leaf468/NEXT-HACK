// Firebase 관련 임포트
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';

// Firestore 컬렉션 경로
const COLLECTIONS = {
  FESTIVALS: 'festivals',
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
  FAVORITES: 'favorites'
};

/**
 * 문서 가져오기
 * @param {string} collectionPath - 컬렉션 경로
 * @param {string} docId - 문서 ID
 * @returns {Promise<Object>} - 문서 데이터
 */
export const getDocument = async (collectionPath, docId) => {
  try {
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('문서를 찾을 수 없습니다');
    }
  } catch (error) {
    console.error('Firestore 문서 가져오기 에러:', error);
    throw error;
  }
};

/**
 * 컬렉션의 모든 문서 가져오기
 * @param {string} collectionPath - 컬렉션 경로
 * @param {Object} [options] - 쿼리 옵션
 * @returns {Promise<Array>} - 문서 배열
 */
export const getCollection = async (collectionPath, options = {}) => {
  try {
    const { filters = [], orderByField, orderDirection = 'desc', limitCount } = options;
    
    let q = collection(db, collectionPath);
    
    // 필터 적용
    if (filters.length > 0) {
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
    }
    
    // 정렬 적용
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    // 결과 제한 적용
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Firestore 컬렉션 가져오기 에러:', error);
    throw error;
  }
};

/**
 * 문서 추가하기
 * @param {string} collectionPath - 컬렉션 경로
 * @param {Object} data - 추가할 데이터
 * @returns {Promise<string>} - 생성된 문서 ID
 */
export const addDocument = async (collectionPath, data) => {
  try {
    // 타임스탬프 추가
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, collectionPath), dataWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Firestore 문서 추가 에러:', error);
    throw error;
  }
};

/**
 * 문서 업데이트하기
 * @param {string} collectionPath - 컬렉션 경로
 * @param {string} docId - 문서 ID
 * @param {Object} data - 업데이트할 데이터
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionPath, docId, data) => {
  try {
    // 타임스탬프 업데이트
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    const docRef = doc(db, collectionPath, docId);
    await updateDoc(docRef, dataWithTimestamp);
  } catch (error) {
    console.error('Firestore 문서 업데이트 에러:', error);
    throw error;
  }
};

/**
 * 문서 삭제하기
 * @param {string} collectionPath - 컬렉션 경로
 * @param {string} docId - 문서 ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionPath, docId) => {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Firestore 문서 삭제 에러:', error);
    throw error;
  }
};

/**
 * 현재 인증된 사용자 가져오기
 * @returns {Object|null} - 현재 사용자 정보 또는 null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * 인증 토큰 가져오기
 * @returns {Promise<string|null>} - 인증 토큰 또는 null
 */
export const getAuthToken = async () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('인증 토큰 가져오기 에러:', error);
    return null;
  }
};

export { COLLECTIONS };