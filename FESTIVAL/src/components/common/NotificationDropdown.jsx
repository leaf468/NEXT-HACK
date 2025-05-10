// src/components/common/NotificationDropdown.jsx
import React, { useContext } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import { formatDateTime } from "../../utils/dateUtils";
import { FaTimes, FaBell, FaCheck, FaRegBell } from "react-icons/fa";
import "../../styles/components/notification.css";

const NotificationDropdown = () => {
    const {
        notifications,
        showNotification,
        markAllAsRead,
        removeNotification,
    } = useContext(NotificationContext);

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

    if (notifications.length === 0 && showNotification) {
        return (
            <div className={`notification-list${showNotification ? " show" : ""}`}>
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
        <div className={`notification-list${showNotification ? " show" : ""}`}>
            {showNotification && (
                <>
                    <div className="notification-header">
                        <h3>알림</h3>
                        <button
                            className="mark-all-read-button"
                            onClick={markAllAsRead}
                        >
                            <FaCheck className="icon" /> 모두 읽음
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
                                    onClick={() => removeNotification(notification.id)}
                                    aria-label="알림 삭제"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
