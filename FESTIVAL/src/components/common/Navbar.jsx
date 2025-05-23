import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaHeart, FaSearch, FaBars, FaTimes, FaUser } from "react-icons/fa";
import { NotificationContext } from "../../contexts/NotificationContext";
import { UserContext } from "../../contexts/UserContext";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getUnreadCount, showNotification, setShowNotification } =
        useContext(NotificationContext);
    const { isLoggedIn, user, setShowLoginPopup, logout } = useContext(UserContext);
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

    // 링크 클릭 시 모바일 메뉴 닫기, 페이지 이동 및 페이지 상단으로 스크롤
    const handleLinkClick = (path) => {
        if (mobileMenuOpen) {
            setMobileMenuOpen(false);
        }
        if (path) {
            navigate(path, { replace: false });
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <button className="logo" onClick={() => handleLinkClick("/")}>
                    <span className="logo-text">FIESTA</span>
                </button>

                <button
                    className="mobile-menu-toggle"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                    <button
                        className={`nav-link ${isActive("/") ? "active" : ""}`}
                        onClick={() => handleLinkClick("/")}
                    >
                        홈
                    </button>

                    <button
                        className={`nav-link ${
                            isActive("/search/school") ? "active" : ""
                        }`}
                        onClick={() => handleLinkClick("/search/school")}
                    >
                        학교별
                    </button>

                    <button
                        className={`nav-link ${
                            isActive("/search/artist") ? "active" : ""
                        }`}
                        onClick={() => handleLinkClick("/search/artist")}
                    >
                        아티스트별
                    </button>

                    <button
                        className={`nav-link ${
                            isActive("/calendar") ? "active" : ""
                        }`}
                        onClick={() => handleLinkClick("/calendar")}
                    >
                        일정
                    </button>

                    <button
                        className={`nav-link ${
                            isActive("/favorites") ? "active" : ""
                        }`}
                        onClick={() => handleLinkClick("/favorites")}
                    >
                        <FaHeart style={{ marginRight: "5px" }} />
                        즐겨찾기
                    </button>

                    <button
                        onClick={() => {
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

                    {isLoggedIn ? (
                        <div className="nav-link user-menu">
                            <span>
                                <FaUser style={{ marginRight: "5px" }} />
                                {user?.name || "사용자"}
                            </span>
                            <button
                                className="logout-button"
                                onClick={() => {
                                    // 로그아웃 처리
                                    logout();
                                    handleLinkClick("/");
                                }}
                            >
                                로그아웃
                            </button>
                        </div>
                    ) : (
                        <button
                            className="nav-link login-button"
                            onClick={() => {
                                setShowLoginPopup(true);
                                handleLinkClick();
                            }}
                        >
                            <FaUser style={{ marginRight: "5px" }} />
                            로그인
                        </button>
                    )}
                </div>

                {/* 알림 드롭다운 */}
                <NotificationDropdown />
            </div>
        </nav>
    );
};

export default Navbar;
