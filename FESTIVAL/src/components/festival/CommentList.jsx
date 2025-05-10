import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { fetchCommentsByFestivalId, deleteComment } from '../../services/commentService';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const CommentList = ({ festivalId, refreshKey, onCommentDeleted }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useContext(UserContext);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        console.log('Fetching comments for festival:', festivalId, 'refreshKey:', refreshKey);
        const fetchedComments = await fetchCommentsByFestivalId(festivalId);
        console.log('Fetched comments:', fetchedComments);
        setComments(fetchedComments);
        setError(null);
      } catch (err) {
        console.error('댓글을 불러오는데 실패했습니다:', err);
        setError('댓글을 불러오는데 실패했습니다. 나중에 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [festivalId, refreshKey]);

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      try {
        await deleteComment(commentId);
        setComments(comments.filter(comment => comment.id !== commentId));
        if (onCommentDeleted) {
          onCommentDeleted();
        }
      } catch (err) {
        console.error('댓글 삭제에 실패했습니다:', err);
        alert('댓글 삭제에 실패했습니다. 나중에 다시 시도해주세요.');
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko });
    } catch (error) {
      console.error('날짜 형식 변환 오류:', error);
      return '날짜 정보 없음';
    }
  };

  if (loading) return (
    <div className="comment-loading">
      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <svg className="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p className="text-blue-600 font-medium mb-1">댓글을 불러오는 중...</p>
      <p className="text-gray-500 text-sm">잠시만 기다려주세요</p>
    </div>
  );

  if (error) return (
    <div className="comment-error">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p className="text-red-600 font-medium mb-1">오류가 발생했습니다</p>
      <p className="text-gray-700">{error}</p>
    </div>
  );

  if (comments.length === 0) return (
    <div className="comment-empty">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 hover:scale-110 hover:bg-blue-50">
        <svg className="w-10 h-10 text-gray-400 hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </div>
      <p className="text-gray-700 font-medium mb-2">아직 댓글이 없습니다</p>
      <p className="text-gray-500 mb-4">첫 번째 카더라 코멘트를 작성해보세요!</p>
      <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto"></div>
    </div>
  );

  return (
    <div className="comment-list-container">
      <h3 className="comment-list-title">카더라 게시판 ({comments.length})</h3>
      <div className="comment-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <div className="comment-user-info flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3 flex-shrink-0">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="comment-username">{comment.userName}</div>
                  <div className="comment-date flex items-center">
                    <svg className="w-3 h-3 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                    </svg>
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
              {currentUser && currentUser.id === comment.userId && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="comment-delete-btn flex items-center"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  삭제
                </button>
              )}
            </div>
            <div className="comment-content relative pl-11">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-50"></div>
              {comment.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentList;