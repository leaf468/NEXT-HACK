import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { fetchCommentsByFestivalId, deleteComment } from '../../services/commentService';
import DeleteConfirmModal from './DeleteConfirmModal';
import '../../styles/components/deleteModal.css';

const CommentList = ({ festivalId, refreshKey, onCommentDeleted }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
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

  const openDeleteModal = (commentId) => {
    setCommentToDelete(commentId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment(commentToDelete);
      setComments(comments.filter(comment => comment.id !== commentToDelete));
      if (onCommentDeleted) {
        onCommentDeleted();
      }
      closeDeleteModal();
    } catch (err) {
      console.error('댓글 삭제에 실패했습니다:', err);
      alert('댓글 삭제에 실패했습니다. 나중에 다시 시도해주세요.');
      closeDeleteModal();
    }
  };


  if (loading) return (
    <div className="comment-loading">
      <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <span className="text-blue-500 font-bold text-xl animate-pulse">로딩 중...</span>
      </div>
      <p className="text-blue-600 font-medium mb-1">댓글을 불러오는 중...</p>
      <p className="text-gray-500 text-sm">잠시만 기다려주세요</p>
    </div>
  );

  if (error) return (
    <div className="comment-error">
      <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-500 font-bold text-xl">오류</span>
      </div>
      <p className="text-red-600 font-medium mb-1">오류가 발생했습니다</p>
      <p className="text-gray-700">{error}</p>
    </div>
  );

  if (comments.length === 0) return (
    <div className="comment-empty bg-white p-8 rounded-lg border border-gray-100 shadow-sm mt-6">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 hover:scale-110 hover:bg-blue-50">
        <span className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-3xl">💬</span>
      </div>
      <p className="text-gray-700 font-medium mb-2 text-center">아직 댓글이 없습니다</p>
      <p className="text-gray-500 mb-4 text-center">첫 번째 카더라 코멘트를 작성해보세요!</p>
      <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto"></div>
    </div>
  );

  return (
    <div className="comment-list-container mt-8">
      <h3 className="comment-list-title text-lg font-semibold mb-4 text-blue-600">
        카더라 게시판 ({comments.length})
      </h3>
      <div className="comment-list space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="comment-header flex justify-between items-start mb-3 pb-2 border-b border-gray-100">
              <div className="comment-user-info flex items-center">
                <div>
                  <div className="comment-username font-medium text-gray-800">{comment.userName}</div>
                  <div className="comment-timestamp text-xs text-gray-500">
                    {(comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt)).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>
              {currentUser && currentUser.id === comment.userId && (
                <button
                  onClick={() => openDeleteModal(comment.id)}
                  className="comment-delete-btn flex items-center text-sm text-red-500 hover:text-red-600 px-3 py-1.5 rounded hover:bg-red-50 transition-colors duration-200 border border-red-200 font-medium"
                >
                  <span className="mr-1.5 text-lg">×</span>
                  삭제
                </button>
              )}
            </div>
            <div className="comment-content py-1 text-gray-700 whitespace-pre-line">
              {comment.content}
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteComment}
        itemType="댓글"
      />
    </div>
  );
};

export default CommentList;