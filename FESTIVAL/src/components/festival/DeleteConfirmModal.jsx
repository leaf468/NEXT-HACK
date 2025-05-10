import React, { useEffect } from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemType = '댓글' }) => {
  if (!isOpen) return null;

  // Close modal with ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);

    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'visible';
    };
  }, [isOpen, onClose]);

  const handleClickOutside = (e) => {
    if (e.target.className === 'delete-modal-overlay') {
      onClose();
    }
  };

  const postfix = itemType === '댓글' ? '을' : '을';

  return (
    <div className="delete-modal-overlay" onClick={handleClickOutside}>
      <div className="delete-modal-content" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <div className="delete-modal-icon">
          <span>❗</span>
        </div>

        <h3 className="delete-modal-title" id="delete-modal-title">삭제 확인</h3>

        <p className="delete-modal-message">
          정말 이 {itemType}{postfix} 삭제하시겠습니까?
        </p>

        <div className="delete-modal-buttons">
          <button
            onClick={onClose}
            className="delete-modal-cancel-btn"
            aria-label="취소"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="delete-modal-confirm-btn"
            aria-label={`${itemType} 삭제 확인`}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;