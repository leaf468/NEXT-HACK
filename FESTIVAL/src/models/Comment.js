/**
 * Comment 모델 클래스
 * Firestore의 comments 컬렉션과 매핑되는 데이터 모델
 * 축제 '카더라' 게시판의 댓글을 표현합니다.
 */
class Comment {
  constructor(id, data) {
    this.id = id;
    this.festivalId = data.festivalId || '';
    this.userId = data.userId || '';
    this.userName = data.userName || '';
    this.content = data.content || '';
    
    // 타임스탬프 처리 로직
    if (data.createdAt) {
      if (typeof data.createdAt === 'string') {
        this.createdAt = new Date(data.createdAt);
        if (isNaN(this.createdAt.getTime())) {
          console.warn(`Invalid createdAt string: ${data.createdAt}`);
          this.createdAt = data.createdAt;
        }
      } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        this.createdAt = data.createdAt.toDate();
      } else if (data.createdAt instanceof Date) {
        this.createdAt = data.createdAt;
      } else {
        console.warn(`Unknown createdAt format:`, data.createdAt);
        this.createdAt = data.createdAt;
      }
    } else {
      this.createdAt = new Date();
    }
  }

  /**
   * Firestore 데이터에서 Comment 객체로 변환
   * @param {Object} doc - Firestore 문서 스냅샷
   * @returns {Comment} - Comment 객체
   */
  static fromFirestore(doc) {
    const data = doc.data();
    return new Comment(doc.id, {
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt
    });
  }

  /**
   * Comment 객체를 Firestore에 저장 가능한 형태로 변환
   * @returns {Object} - Firestore 문서 데이터
   */
  toFirestore() {
    const data = {
      festivalId: this.festivalId,
      userId: this.userId,
      userName: this.userName,
      content: this.content,
      createdAt: this.createdAt
    };

    console.log('Comment.toFirestore() 데이터:', data);
    return data;
  }
}

export default Comment;