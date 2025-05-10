import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBell, FaHeart, FaSearch } from "react-icons/fa";
import { NotificationContext } from "../../contexts/NotificationContext";
import NotificationList from "../user/NotificationList";

const Navbar = () => {
    const location = useLocation();
    const { getUnreadCount, showNotification, setShowNotification } =
        useContext(NotificationContext);

    // 현재 경로를 기준으로 활성화된 링크 확인
    const isActive = (path) => {
        if (path === "/") {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    // 알림 토글
    const toggleNotifications = () => {
        setShowNotification(!showNotification);
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="logo">
                    캠퍼스 페스티벌
                </Link>

                <div className="nav-links">
                    <Link
                        to="/"
                        className={`nav-link ${isActive("/") ? "active" : ""}`}
                    >
                        홈
                    </Link>

                    <Link
                        to="/search/school"
                        className={`nav-link ${
                            isActive("/search/school") ? "active" : ""
                        }`}
                    >
                        학교별
                    </Link>

                    <Link
                        to="/search/artist"
                        className={`nav-link ${
                            isActive("/search/artist") ? "active" : ""
                        }`}
                    >
                        아티스트별
                    </Link>

                    <Link
                        to="/favorites"
                        className={`nav-link ${
                            isActive("/favorites") ? "active" : ""
                        }`}
                    >
                        <FaHeart style={{ marginRight: "5px" }} />
                        즐겨찾기
                    </Link>

                    <button
                        onClick={toggleNotifications}
                        className="nav-link notification-button"
                    >
                        <FaBell style={{ marginRight: "5px" }} />
                        알림
                        {getUnreadCount() > 0 && (
                            <span className="notification-badge">
                                {getUnreadCount()}
                            </span>
                        )}
                    </button>
                </div>

                {/* 알림 드롭다운 */}
                {showNotification && (
                    <div className="notification-dropdown">
                        <NotificationList />
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
