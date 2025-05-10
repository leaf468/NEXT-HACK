import Comment from '../models/Comment';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  deleteDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

// 특정 축제의 모든 댓글 가져오기
export const fetchCommentsByFestivalId = async (festivalId) => {
  try {
    console.log('Fetching comments for festival ID:', festivalId);

    // 유효성 검사
    if (!festivalId) {
      console.error('Invalid festivalId:', festivalId);
      return [];
    }

    // Firebase 인덱스 에러 해결:
    // 먼저 festivalId로만 쿼리하고, 클라이언트 측에서 정렬을 수행
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef,
      where("festivalId", "==", festivalId)
    );
    const commentSnapshot = await getDocs(q);

    console.log(`Found ${commentSnapshot.docs.length} comments for festival ${festivalId}`);

    // 데이터를 Comment 모델로 변환
    const comments = commentSnapshot.docs.map(doc => {
      const comment = Comment.fromFirestore(doc);
      console.log('Converted comment:', comment);
      return comment;
    });

    // 클라이언트 측에서 createdAt 기준 내림차순 정렬
    comments.sort((a, b) => {
      // createdAt이 Date 객체인지 확인하고 비교
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);

      return dateB - dateA; // 내림차순 정렬
    });

    return comments;
  } catch (error) {
    console.error("댓글 데이터를 가져오는데 실패했습니다:", error);
    throw error;
  }
};

// 새 댓글 추가
export const addComment = async (festivalId, userId, userName, content) => {
  try {
    console.log('댓글 추가 시작:', { festivalId, userId, userName, content });

    if (!festivalId) {
      throw new Error('축제 ID가 필요합니다');
    }

    if (!userId) {
      throw new Error('사용자 ID가 필요합니다');
    }

    if (!userName) {
      throw new Error('사용자 이름이 필요합니다');
    }

    if (!content) {
      throw new Error('댓글 내용이 필요합니다');
    }

    // 새로운 Comment 객체 생성
    const newComment = new Comment(null, {
      festivalId,
      userId,
      userName,
      content,
      createdAt: new Date()
    });

    console.log('생성된 Comment 객체:', newComment);

    // Firestore에 데이터 추가
    const commentsRef = collection(db, "comments");
    const docRef = await addDoc(commentsRef, newComment.toFirestore());

    console.log('댓글이 Firestore에 추가됨, ID:', docRef.id);

    // 추가된 댓글 ID를 포함한 Comment 객체 반환
    return new Comment(docRef.id, {
      ...newComment.toFirestore()
    });
  } catch (error) {
    console.error("댓글 추가에 실패했습니다:", error);
    throw error;
  }
};

// 댓글 수정
export const updateComment = async (commentId, newContent) => {
  try {
    const commentRef = doc(db, "comments", commentId);
    
    // 기존 댓글 가져오기
    const commentSnap = await getDoc(commentRef);
    if (!commentSnap.exists()) {
      throw new Error(`댓글 ID ${commentId}를 찾을 수 없습니다.`);
    }
    
    // 댓글 내용 업데이트
    await updateDoc(commentRef, {
      content: newContent
    });
    
    // 업데이트된 댓글 객체 반환
    const updatedCommentSnap = await getDoc(commentRef);
    return Comment.fromFirestore(updatedCommentSnap);
  } catch (error) {
    console.error("댓글 수정에 실패했습니다:", error);
    throw error;
  }
};

// 댓글 삭제
export const deleteComment = async (commentId) => {
  try {
    const commentRef = doc(db, "comments", commentId);
    
    // 기존 댓글 가져오기
    const commentSnap = await getDoc(commentRef);
    if (!commentSnap.exists()) {
      throw new Error(`댓글 ID ${commentId}를 찾을 수 없습니다.`);
    }
    
    // 댓글 삭제
    await deleteDoc(commentRef);
    
    return true;
  } catch (error) {
    console.error("댓글 삭제에 실패했습니다:", error);
    throw error;
  }
};

// 특정 사용자의 모든 댓글 가져오기
export const fetchCommentsByUserId = async (userId) => {
  try {
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const commentSnapshot = await getDocs(q);
    
    // 데이터를 Comment 모델로 변환
    const comments = commentSnapshot.docs.map(doc => 
      Comment.fromFirestore(doc)
    );
    
    return comments;
  } catch (error) {
    console.error("사용자 댓글 데이터를 가져오는데 실패했습니다:", error);
    throw error;
  }
};