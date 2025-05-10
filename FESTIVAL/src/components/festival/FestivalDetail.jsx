import React, { useContext } from "react";
import {
    FaHeart,
    FaRegHeart,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClock,
    FaShare,
    FaMusic,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { NotificationContext } from "../../contexts/NotificationContext";
import { formatDate, formatDateTime } from "../../utils/dateUtils";

const FestivalDetail = ({ festival }) => {
    const { isFavorite, addToFavorites, removeFromFavorites } =
        useContext(UserContext);
    const { displayNotification } = useContext(NotificationContext);

    const handleFavoriteToggle = () => {
        if (isFavorite(festival.id)) {
            removeFromFavorites(festival.id);
            displayNotification(
                "즐겨찾기 삭제",
                `${festival.school} ${festival.name}이(가) 즐겨찾기에서 삭제되었습니다.`,
                "info"
            );
        } else {
            addToFavorites(festival.id);
            displayNotification(
                "즐겨찾기 추가",
                `${festival.school} ${festival.name}이(가) 즐겨찾기에 추가되었습니다.`,
                "success"
            );
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: `${festival.school} ${festival.name}`,
                    text: `${festival.school} ${festival.name} - ${formatDate(
                        festival.startDate
                    )} ~ ${formatDate(festival.endDate)}`,
                    url: encodeURI(window.location.href),
                })
                .then(() => {
                    displayNotification(
                        "공유 성공",
                        "축제 정보가 공유되었습니다.",
                        "success"
                    );
                })
                .catch((error) => {
                    console.error("공유 실패:", error);
                });
        } else {
            // 공유 API를 지원하지 않는 브라우저의 경우
            navigator.clipboard
                .writeText(encodeURI(window.location.href))
                .then(() => {
                    displayNotification(
                        "링크 복사",
                        "링크가 클립보드에 복사되었습니다.",
                        "info"
                    );
                })
                .catch((err) => {
                    console.error("클립보드 복사 실패:", err);
                });
        }
    };

    if (!festival) {
        return (
            <div className="loading-message">
                축제 정보를 불러오는 중입니다...
            </div>
        );
    }

    return (
        <div className="festival-detail-page">
            <div className="festival-detail-header">
                <div className="festival-title-section">
                    <h1 className="festival-detail-name">{festival.name}</h1>
                    <h2 className="festival-detail-school">
                        {festival.school}
                    </h2>

                    <div className="festival-detail-actions">
                        <button
                            className="action-button favorite-action"
                            onClick={handleFavoriteToggle}
                            aria-label={
                                isFavorite(festival.id)
                                    ? "즐겨찾기 삭제"
                                    : "즐겨찾기 추가"
                            }
                        >
                            {isFavorite(festival.id) ? (
                                <FaHeart />
                            ) : (
                                <FaRegHeart />
                            )}
                            <span>
                                {isFavorite(festival.id)
                                    ? "즐겨찾기 삭제"
                                    : "즐겨찾기 추가"}
                            </span>
                        </button>

                        <button
                            className="action-button share-action"
                            onClick={handleShare}
                            aria-label="공유하기"
                        >
                            <FaShare />
                            <span>공유하기</span>
                        </button>
                    </div>
                </div>

                <div className="festival-image-container">
                    {festival.image ? (
                        <img
                            src={festival.image}
                            alt={`${festival.school} ${festival.name} 포스터`}
                            className="festival-detail-image"
                        />
                    ) : (
                        <div className="festival-detail-placeholder">
                            <span>{festival.school.charAt(0)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="festival-detail-info">
                <div className="info-item">
                    <h3>
                        <FaCalendarAlt className="icon" />
                        일시
                    </h3>
                    <p>
                        {formatDate(festival.startDate)} ~{" "}
                        {formatDate(festival.endDate)}
                    </p>
                    <p className="subtext">{festival.time}</p>
                </div>

                <div className="info-item">
                    <h3>
                        <FaMapMarkerAlt className="icon" />
                        장소
                    </h3>
                    <p>{festival.location.address}</p>
                </div>
            </div>

            <div className="festival-detail-section">
                <h2 className="section-title">
                    <FaMusic className="icon" />
                    출연진
                </h2>

                {festival.artists && festival.artists.length > 0 ? (
                    <div className="artists-grid">
                        {festival.artists.map((artist, index) => (
                            <div key={index} className="artist-item">
                                {artist.image ? (
                                    <img
                                        src={artist.image}
                                        alt={artist.name}
                                        className="artist-image"
                                    />
                                ) : (
                                    <div className="artist-placeholder">
                                        <span>{artist.name.charAt(0)}</span>
                                    </div>
                                )}
                                <h3 className="artist-name">{artist.name}</h3>
                                {artist.time && (
                                    <p className="artist-time">{artist.time}</p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>출연진 정보가 없습니다.</p>
                )}
            </div>

            {festival.description && (
                <div className="festival-detail-section">
                    <h2 className="section-title">축제 소개</h2>
                    <div className="festival-description">
                        <p>{festival.description}</p>
                    </div>
                </div>
            )}

            {festival.ticketInfo && (
                <div className="festival-detail-section ticket-info">
                    <h2 className="section-title">티켓 정보</h2>
                    <p>{festival.ticketInfo}</p>
                    {festival.ticketLink && (
                        <a
                            href={festival.ticketLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ticket-link"
                        >
                            티켓 예매하기
                        </a>
                    )}
                </div>
            )}

            <div className="back-link-container">
                <Link to="/" className="back-link">
                    목록으로 돌아가기
                </Link>
            </div>
        </div>
    );
};

export default FestivalDetail;
