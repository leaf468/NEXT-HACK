import React, { useContext, useState } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { formatDateTime } from "../../utils/dateUtils";
import { FaTimes, FaBell, FaCheck, FaRegBell } from "react-icons/fa";
import DeleteConfirmModal from "../festival/DeleteConfirmModal";
import "../../styles/components/notification.css";

const NotificationList = () => {
    const { notifications, removeNotification, markAllAsRead } =
        useContext(NotificationContext);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState(null);

    // 날짜 포맷 헬퍼 함수
    const formatNotificationTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffMinutes < 1) {
            return "방금 전";
        } else if (diffMinutes < 60) {
            return `${diffMinutes}분 전`;
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60);
            return `${hours}시간 전`;
        } else {
            return formatDateTime(date);
        }
    };

    const openDeleteModal = (id, e) => {
        e.stopPropagation();
        setNotificationToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setNotificationToDelete(null);
    };

    const handleRemoveNotification = () => {
        if (!notificationToDelete) return;

        removeNotification(notificationToDelete);
        closeDeleteModal();
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    if (notifications.length === 0) {
        return (
            <div className="notification-list empty">
                <div className="notification-header">
                    <h3>알림</h3>
                </div>
                <div className="empty-notifications">
                    <FaRegBell className="empty-icon" />
                    <p>알림이 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="notification-list">
                <div className="notification-header">
                    <h3>알림</h3>
                    <button
                        className="mark-all-read-button"
                        onClick={handleMarkAllAsRead}
                    >
                        <FaCheck className="icon" />
                        <span>모두 읽음</span>
                    </button>
                </div>

                <div className="notifications-container">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${
                                notification.read ? "read" : "unread"
                            }`}
                        >
                            <div className="notification-content">
                                <h4 className="notification-title">
                                    {notification.title}
                                </h4>
                                <p className="notification-message">
                                    {notification.message}
                                </p>
                                <span className="notification-time">
                                    {formatNotificationTime(notification.timestamp)}
                                </span>
                            </div>
                            <button
                                className="notification-close"
                                onClick={(e) => openDeleteModal(notification.id, e)}
                                aria-label="알림 삭제"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleRemoveNotification}
                itemType="알림"
            />
        </>
    );
};

export default NotificationList;
