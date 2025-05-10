/**
 * User 모델 클래스
 * Firestore의 users 컬렉션과 매핑되는 데이터 모델
 */
class User {
  constructor(id, data) {
    this.id = id;
    this.email = data.email || '';
    this.displayName = data.displayName || '';
    this.photoURL = data.photoURL || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.notificationSettings = data.notificationSettings || {
      enabled: true,
      festivalUpdates: true,
      artistUpdates: true,
      newFestivals: true
    };
  }

  /**
   * Firestore 데이터에서 User 객체로 변환
   * @param {Object} doc - Firestore 문서 스냅샷
   * @returns {User} - User 객체
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new User(doc.id, {
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    });
  }

  /**
   * Firebase Authentication 사용자 데이터에서 User 객체로 변환
   * @param {Object} authUser - Firebase Authentication 사용자 객체
   * @returns {User} - User 객체
   */
  static fromAuthUser(authUser) {
    return new User(authUser.uid, {
      email: authUser.email,
      displayName: authUser.displayName || '',
      photoURL: authUser.photoURL || null,
      createdAt: new Date().toISOString()
    });
  }

  /**
   * User 객체를 Firestore에 저장 가능한 형태로 변환
   * @returns {Object} - Firestore 문서 데이터
   */
  toFirestore() {
    return {
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      createdAt: this.createdAt,
      notificationSettings: this.notificationSettings
    };
  }
}

export default User;