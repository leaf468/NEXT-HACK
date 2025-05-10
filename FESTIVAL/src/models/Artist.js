/**
 * Artist 모델 클래스
 * Firestore의 artists 컬렉션과 매핑되는 데이터 모델
 */
class Artist {
  constructor(id, data) {
    this.id = id;
    this.name = data.name || '';
    this.festivalId = data.festivalId || null;
    this.performanceDate = data.performanceDate || data.time || null;
    this.stage = data.stage || '';
    this.imageUrl = data.imageUrl || data.image || '';
    this.genres = data.genres || [];
    this.description = data.description || '';
  }

  /**
   * Firestore 데이터에서 Artist 객체로 변환
   * @param {Object} doc - Firestore 문서 스냅샷
   * @returns {Artist} - Artist 객체
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new Artist(doc.id, {
      ...data,
      performanceDate: data.performanceDate?.toDate?.() || data.performanceDate
    });
  }

  /**
   * Artist 객체를 Firestore에 저장 가능한 형태로 변환
   * @returns {Object} - Firestore 문서 데이터
   */
  toFirestore() {
    return {
      name: this.name,
      festivalId: this.festivalId,
      performanceDate: this.performanceDate,
      stage: this.stage,
      imageUrl: this.imageUrl,
      genres: this.genres,
      description: this.description
    };
  }

  /**
   * Artist의 공연 시간을 포맷팅하여 반환
   * @returns {string} - 포맷팅된 공연 시간
   */
  getFormattedPerformanceTime() {
    if (!this.performanceDate) return '시간 미정';
    
    if (typeof this.performanceDate === 'string') {
      // performanceDate가 문자열인 경우 (모의 데이터)
      return this.performanceDate;
    }
    
    // Date 객체인 경우
    const date = new Date(this.performanceDate);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleString('ko-KR', options);
  }
}

export default Artist;