import React, { useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { formatDateTime } from "../../utils/dateUtils";
import { FaTimes, FaBell, FaCheck } from "react-icons/fa";

const NotificationList = () => {
    const { notifications, removeNotification, markAllAsRead } =
        useContext(NotificationContext);

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

    const handleRemoveNotification = (id, e) => {
        e.stopPropagation();
        removeNotification(id);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    if (notifications.length === 0) {
        return (
            <div className="notification-list empty">
                <div className="empty-notifications">
                    <FaBell className="empty-icon" />
                    <p>알림이 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-list">
            <div className="notification-header">
                <h3>알림</h3>
                <button
                    className="mark-all-read-button"
                    onClick={handleMarkAllAsRead}
                >
                    <FaCheck className="icon" />
                    <span>모두 읽음 처리</span>
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
                            onClick={(e) =>
                                handleRemoveNotification(notification.id, e)
                            }
                            aria-label="알림 삭제"
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationList;
