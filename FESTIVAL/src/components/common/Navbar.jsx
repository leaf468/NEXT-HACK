import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBell, FaHeart, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { NotificationContext } from "../../contexts/NotificationContext";
import NotificationList from "../user/NotificationList";

const Navbar = () => {
    const location = useLocation();
    const { getUnreadCount, showNotification, setShowNotification } =
        useContext(NotificationContext);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    // 모바일 메뉴 토글
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // 링크 클릭 시 모바일 메뉴 닫기
    const handleLinkClick = () => {
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="logo" onClick={handleLinkClick}>
                    캠퍼스 페스티벌
                </Link>

                <button
                    className="mobile-menu-toggle"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link
                        to="/"
                        className={`nav-link ${isActive("/") ? "active" : ""}`}
                        onClick={handleLinkClick}
                    >
                        홈
                    </Link>

                    <Link
                        to="/search/school"
                        className={`nav-link ${
                            isActive("/search/school") ? "active" : ""
                        }`}
                        onClick={handleLinkClick}
                    >
                        학교별
                    </Link>

                    <Link
                        to="/search/artist"
                        className={`nav-link ${
                            isActive("/search/artist") ? "active" : ""
                        }`}
                        onClick={handleLinkClick}
                    >
                        아티스트별
                    </Link>

                    <Link
                        to="/favorites"
                        className={`nav-link ${
                            isActive("/favorites") ? "active" : ""
                        }`}
                        onClick={handleLinkClick}
                    >
                        <FaHeart style={{ marginRight: "5px" }} />
                        즐겨찾기
                    </Link>

                    <button
                        onClick={(e) => {
                            toggleNotifications();
                            handleLinkClick();
                        }}
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
