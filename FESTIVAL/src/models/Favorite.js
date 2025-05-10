/**
 * Favorite 모델 클래스
 * Firestore의 favorites 컬렉션과 매핑되는 데이터 모델
 */
class Favorite {
  constructor(id, data) {
    this.id = id;
    this.userId = data.userId || '';
    this.festivalId = data.festivalId || '';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Firestore 데이터에서 Favorite 객체로 변환
   * @param {Object} doc - Firestore 문서 스냅샷
   * @returns {Favorite} - Favorite 객체
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new Favorite(doc.id, {
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    });
  }

  /**
   * Favorite 객체를 Firestore에 저장 가능한 형태로 변환
   * @returns {Object} - Firestore 문서 데이터
   */
  toFirestore() {
    return {
      userId: this.userId,
      festivalId: this.festivalId,
      createdAt: this.createdAt
    };
  }
}

export default Favorite;