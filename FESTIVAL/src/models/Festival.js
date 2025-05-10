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

    // 날짜 처리 로직
    if (data.startDate) {
      if (typeof data.startDate === 'string') {
        // 문자열로 저장된 날짜는 Date 객체로 변환
        this.startDate = new Date(data.startDate);
        // 유효하지 않은 날짜인 경우 원본 값 유지
        if (isNaN(this.startDate.getTime())) {
          console.warn(`Invalid startDate string: ${data.startDate}`);
          this.startDate = data.startDate;
        }
      } else if (data.startDate && typeof data.startDate.toDate === 'function') {
        // Firestore Timestamp는 Date 객체로 변환
        this.startDate = data.startDate.toDate();
      } else if (data.startDate instanceof Date) {
        // 이미 Date 객체인 경우 그대로 사용
        this.startDate = data.startDate;
      } else {
        // 그 외의 경우
        console.warn(`Unknown startDate format:`, data.startDate);
        this.startDate = data.startDate;
      }
    } else {
      this.startDate = null;
    }

    if (data.endDate) {
      if (typeof data.endDate === 'string') {
        // 문자열로 저장된 날짜는 Date 객체로 변환
        this.endDate = new Date(data.endDate);
        // 유효하지 않은 날짜인 경우 원본 값 유지
        if (isNaN(this.endDate.getTime())) {
          console.warn(`Invalid endDate string: ${data.endDate}`);
          this.endDate = data.endDate;
        }
      } else if (data.endDate && typeof data.endDate.toDate === 'function') {
        // Firestore Timestamp는 Date 객체로 변환
        this.endDate = data.endDate.toDate();
      } else if (data.endDate instanceof Date) {
        // 이미 Date 객체인 경우 그대로 사용
        this.endDate = data.endDate;
      } else {
        // 그 외의 경우
        console.warn(`Unknown endDate format:`, data.endDate);
        this.endDate = data.endDate;
      }
    } else {
      this.endDate = null;
    }

    // 이전 방식 지원 (단일 date 필드)
    if (data.date && !this.startDate) {
      this.startDate = data.date;
      this.endDate = data.date;
    }

    this.time = data.time || '';
    this.imageUrl = data.imageUrl || data.image || (data.university && data.university.posterUrl) || '';
    this.location = data.location || {
      address: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      },
      region: ''
    };
    this.university = data.university || null;
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