/**
 * Festival 모델 클래스
 * Firestore의 festivals 컬렉션과 매핑되는 데이터 모델
 */
class Festival {
  constructor(id, data) {
    this.id = id;
    this.name = data.name || '';
    this.universityName = data.universityName || data.school || '';
    this.description = data.description || '';
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.time = data.time || '';
    this.imageUrl = data.imageUrl || data.image || '';
    this.location = data.location || {
      address: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      },
      region: ''
    };
    this.ticketInfo = data.ticketInfo || '';
    this.ticketLink = data.ticketLink || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.artists = data.artists || [];
  }

  /**
   * Firestore 데이터에서 Festival 객체로 변환
   * @param {Object} doc - Firestore 문서 스냅샷
   * @returns {Festival} - Festival 객체
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new Festival(doc.id, {
      ...data,
      startDate: data.startDate?.toDate?.() || data.startDate,
      endDate: data.endDate?.toDate?.() || data.endDate,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    });
  }

  /**
   * Festival 객체를 Firestore에 저장 가능한 형태로 변환
   * @returns {Object} - Firestore 문서 데이터
   */
  toFirestore() {
    return {
      name: this.name,
      universityName: this.universityName,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      time: this.time,
      imageUrl: this.imageUrl,
      location: this.location,
      ticketInfo: this.ticketInfo,
      ticketLink: this.ticketLink,
      createdAt: this.createdAt
      // artists는 별도의 컬렉션으로 관리하므로 제외
    };
  }

  /**
   * Festival의 상태 확인 (예정, 진행중, 종료)
   * @returns {string} - 축제 상태
   */
  getStatus() {
    const now = new Date();
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);

    if (now < startDate) {
      return 'upcoming';
    } else if (now > endDate) {
      return 'ended';
    } else {
      return 'ongoing';
    }
  }
}

export default Festival;