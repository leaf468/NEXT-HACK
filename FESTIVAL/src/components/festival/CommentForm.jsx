import React, { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { addComment } from '../../services/commentService';

const CommentForm = ({ festivalId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useContext(UserContext);

  // Check user object in console for debugging
  React.useEffect(() => {
    console.log('Current user in CommentForm:', currentUser);
  }, [currentUser]);

  const MAX_COMMENT_LENGTH = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return;
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      setError(`댓글은 ${MAX_COMMENT_LENGTH}자를 초과할 수 없습니다.`);
      return;
    }

    if (!currentUser) {
      setError('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('등록 시도:', {
        festivalId,
        userId: currentUser.id,
        userName: currentUser.name,
        content
      });

      await addComment(
        festivalId,
        currentUser.id,
        currentUser.name,
        content
      );

      setContent('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      console.error('댓글 작성에 실패했습니다:', err);
      setError(`댓글 작성에 실패했습니다: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
        <h3 className="comment-list-title text-xl font-semibold mb-5 text-blue-600">
          카더라 코멘트 작성
        </h3>
        <div className="py-8 bg-gradient-to-br from-blue-50/60 to-white rounded-xl border border-dashed border-blue-100">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md hover:bg-blue-100/80">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <p className="text-blue-700 mb-2 font-medium text-center">카더라 코멘트를 작성하려면 로그인이 필요합니다.</p>
          <p className="text-gray-500 mb-5 text-sm text-center">로그인하고 축제에 대한 의견을 공유해보세요!</p>
          <div className="text-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('show-login'))}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
                transform hover:-translate-y-1 active:translate-y-0
                transition-all duration-300 flex items-center shadow-md mx-auto hover:shadow-lg
                bg-gradient-to-r from-blue-600 to-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-blue-50 hover:shadow-lg transition-all duration-300">
      <h3 className="comment-list-title text-xl font-semibold mb-6 text-blue-600">
        카더라 코멘트 작성
      </h3>
      <form onSubmit={handleSubmit} className="relative">
        {currentUser && (
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-2">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
          </div>
        )}
        <div className="mb-4 group">
          <textarea
            className={`w-full p-4 border ${
              content.length > MAX_COMMENT_LENGTH
                ? 'border-red-300 focus:ring-red-200'
                : 'border-blue-200 focus:ring-blue-300'
            } rounded-lg resize-none focus:outline-none focus:ring-2 shadow-sm hover:shadow-md transition-all duration-300
            ${content ? 'bg-white' : 'bg-gradient-to-r from-blue-50/40 to-blue-50/20'}
            placeholder:text-blue-400/70 text-gray-700 leading-relaxed`}
            rows="4"
            placeholder="이 축제에 대한 카더라 코멘트를 남겨보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            maxLength={MAX_COMMENT_LENGTH + 10}
            style={{
              backgroundImage: content ? 'none' : 'linear-gradient(rgba(239, 246, 255, 0.4), rgba(239, 246, 255, 0.2))',
              boxShadow: content ? '0 4px 6px rgba(37, 99, 235, 0.06)' : '0 2px 4px rgba(0, 0, 0, 0.03)'
            }}
          ></textarea>
          <div className={`flex justify-between items-center mt-2 text-xs
            ${content.length > MAX_COMMENT_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
            <div className="text-gray-400 italic">
              {content ? '' : '웃고 즐기는 댓글 문화를 만들어요 :)'}
            </div>
            <div className={`font-medium transition-all duration-300 ${
              content.length > MAX_COMMENT_LENGTH * 0.8
                ? content.length > MAX_COMMENT_LENGTH
                  ? 'text-red-500'
                  : 'text-amber-500'
                : 'text-gray-400'
            }`}>
              {content.length}/{MAX_COMMENT_LENGTH}자
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm animate-pulse">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              {error}
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
              transform hover:-translate-y-1 active:translate-y-0
              transition-all duration-300 flex items-center shadow-md
              bg-gradient-to-r from-blue-600 to-blue-500 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:from-blue-500 hover:to-blue-600'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                등록 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                코멘트 등록
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;