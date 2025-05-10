import React, { useState, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { addComment } from "../../services/commentService";

const CommentForm = ({ festivalId, onCommentAdded }) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { user: currentUser } = useContext(UserContext);

    // Check user object in console for debugging
    React.useEffect(() => {
        console.log("Current user in CommentForm:", currentUser);
    }, [currentUser]);

    const MAX_COMMENT_LENGTH = 500;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            setError("댓글 내용을 입력해주세요.");
            return;
        }

        if (content.length > MAX_COMMENT_LENGTH) {
            setError(`댓글은 ${MAX_COMMENT_LENGTH}자를 초과할 수 없습니다.`);
            return;
        }

        if (!currentUser) {
            setError("댓글을 작성하려면 로그인이 필요합니다.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            console.log("등록 시도:", {
                festivalId,
                userId: currentUser.id,
                userName: currentUser.name,
                content,
            });

            await addComment(
                festivalId,
                currentUser.id,
                currentUser.name,
                content
            );

            setContent("");
            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (err) {
            console.error("댓글 작성에 실패했습니다:", err);
            setError(`댓글 작성에 실패했습니다: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="mt-5 bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <h3 className="comment-list-title text-lg font-semibold mb-4 text-blue-600">
                    카더라 코멘트 작성
                </h3>
                <div className="py-8 bg-gradient-to-br from-blue-50/60 to-white rounded-xl border border-dashed border-blue-100">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 transform transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md hover:bg-blue-100/80">
                            <span className="text-blue-400 font-bold text-xl">로그인</span>
                        </div>
                        <div className="text-center px-4">
                            <p className="text-blue-700 mb-2 font-medium">
                                카더라 코멘트를 작성하려면 로그인이 필요합니다.
                            </p>
                            <p className="text-gray-500 mb-5 text-sm">
                                로그인하고 축제에 대한 의견을 공유해보세요!
                            </p>
                        </div>
                        <button
                            onClick={() =>
                                window.dispatchEvent(
                                    new CustomEvent("show-login")
                                )
                            }
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1
                transform hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-300 flex items-center shadow-sm hover:shadow-md
                bg-gradient-to-r from-blue-600 to-blue-500"
                        >
                            <span className="mr-1.5">→</span>
                            로그인하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-5 bg-white p-5 rounded-lg shadow-sm border border-blue-50 hover:shadow-md transition-all duration-300">
            <h3 className="comment-list-title text-lg font-semibold mb-4 text-blue-600">
                카더라 코멘트 작성
            </h3>
            <form onSubmit={handleSubmit} className="relative">
                {currentUser && (
                    <div className="flex items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">
                            {currentUser.name}
                        </span>
                    </div>
                )}
                <div className="mb-4 group">
                    <textarea
                        className={`w-full p-4 border ${
                            content.length > MAX_COMMENT_LENGTH
                                ? "border-red-300 focus:ring-red-200"
                                : "border-blue-200 focus:ring-blue-300"
                        } rounded-lg resize-none focus:outline-none focus:ring-2 shadow-sm transition-all duration-300
            ${
                content
                    ? "bg-white"
                    : "bg-gradient-to-r from-blue-50/40 to-blue-50/20"
            }
            placeholder:text-blue-400/70 text-gray-700 leading-relaxed`}
                        rows="4"
                        placeholder="이 축제에 대한 카더라 코멘트를 남겨보세요..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={MAX_COMMENT_LENGTH + 10}
                    ></textarea>

                    <div className="flex justify-between items-center mt-2 text-xs">
                        <div className="text-gray-400 italic">
                            {content
                                ? ""
                                : "웃고 즐기는 댓글 문화를 만들어요 :)"}
                        </div>
                        <div
                            className={`font-medium transition-all duration-300 ${
                                content.length > MAX_COMMENT_LENGTH * 0.8
                                    ? content.length > MAX_COMMENT_LENGTH
                                        ? "text-red-500"
                                        : "text-amber-500"
                                    : "text-gray-400"
                            }`}
                        >
                            {content.length}/{MAX_COMMENT_LENGTH}자
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-2.5 rounded-md mb-4 text-sm border border-red-100">
                        <div className="flex items-center">
                            <span className="mr-1.5 text-xs">!</span>
                            <span className="text-xs">{error}</span>
                        </div>
                    </div>
                )}

                <div className="flex justify-end mt-4">
                    <button
                        type="submit"
                        className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2
          transition-all duration-300 flex items-center shadow-md
          ${
              isSubmitting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700 hover:shadow-lg"
          }`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-pulse mr-2">•••</span>
                                등록 중...
                            </>
                        ) : (
                            <>
                                <span className="mr-1.5">↗</span>
                                등록
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommentForm;
