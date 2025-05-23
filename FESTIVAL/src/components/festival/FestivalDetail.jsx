import React, { useContext, useState } from "react";
import {
    FaHeart,
    FaRegHeart,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClock,
    FaShare,
    FaMusic,
    FaComments
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { NotificationContext } from "../../contexts/NotificationContext";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

const FestivalDetail = ({ festival }) => {
    const { isFavorite, addToFavorites, removeFromFavorites } =
        useContext(UserContext);
    const { displayNotification } = useContext(NotificationContext);
    const [commentRefreshKey, setCommentRefreshKey] = useState(0);

    const handleCommentAdded = () => {
        setCommentRefreshKey(prevKey => prevKey + 1);
        displayNotification(
            "댓글 등록",
            "댓글이 성공적으로 등록되었습니다.",
            "success"
        );
    };

    const handleCommentDeleted = () => {
        setCommentRefreshKey(prevKey => prevKey + 1);
        displayNotification(
            "댓글 삭제",
            "댓글이 성공적으로 삭제되었습니다.",
            "info"
        );
    };

    // 대학 이름을 가져오는 함수 (university.name, universityName 또는 school 필드 사용)
    const getUniversityName = () => {
        return (festival.university && festival.university.name) || festival.universityName || festival.school || '대학 정보 없음';
    };

    // 축제 이름을 가져오는 함수 (university.festival_name, festival_name 또는 name 필드 사용)
    const getFestivalName = () => {
        return (festival.university && festival.university.festival_name) || festival.festival_name || festival.name || '축제 정보 없음';
    };

    const handleFavoriteToggle = () => {
        if (isFavorite(festival.id)) {
            removeFromFavorites(festival.id);
            displayNotification(
                "즐겨찾기 삭제",
                `${getUniversityName()} ${getFestivalName()}이(가) 즐겨찾기에서 삭제되었습니다.`,
                "info"
            );
        } else {
            addToFavorites(festival.id);
            displayNotification(
                "즐겨찾기 추가",
                `${getUniversityName()} ${getFestivalName()}이(가) 즐겨찾기에 추가되었습니다.`,
                "success"
            );
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: `${getUniversityName()} ${getFestivalName()}`,
                    text: `${getUniversityName()} ${getFestivalName()} - ${formatDate(
                        festival.startDate
                    )}`,
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
                    <div className="festival-name-container">
                        <h1 className="festival-detail-name">{getFestivalName()}</h1>
                    </div>
                    <h2 className="festival-detail-school">
                        {getUniversityName()}
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
                    {(festival.university && festival.university.poster_url) || festival.imageUrl || festival.image || (festival.university && festival.university.posterUrl) ? (
                        <div className="festival-image-wrapper">
                            <img
                                src={(festival.university && festival.university.poster_url) || festival.imageUrl || festival.image || (festival.university && festival.university.posterUrl)}
                                alt={`${getUniversityName()} ${getFestivalName()} 포스터`}
                                className="festival-detail-image"
                            />
                        </div>
                    ) : (
                        <div className="festival-detail-placeholder">
                            <span>{getUniversityName().charAt(0)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="festival-detail-info">
                <div className="info-item">
                    <h3>
                        <FaCalendarAlt className="icon" />
                        {getUniversityName()} 행사 일정
                    </h3>
                    <p>
                        {formatDate(festival.startDate)}
                    </p>
                    <p className="subtext">
                        {festival.time ? festival.time : "시간 정보 없음"}
                    </p>
                    {/* 디버깅용 정보는 숨김 처리 */}
                </div>

                {festival.location && festival.location.address && (
                    <div className="info-item">
                        <h3>
                            <FaMapMarkerAlt className="icon" />
                            장소
                        </h3>
                        <p>{festival.location.address}</p>
                    </div>
                )}
            </div>

            <div className="festival-detail-section">
                <h2 className="section-title">
                    <FaMusic className="icon" />
                    {getUniversityName()}의 공연 아티스트
                </h2>

                {festival.artists && festival.artists.length > 0 ? (
                    <div className="artists-grid">
                        {festival.artists.map((artist, index) => (
                            <div key={index} className="artist-item">
                                <div className="artist-image-container">
                                    {artist.imageUrl || artist.image ? (
                                        <img
                                            src={artist.imageUrl || artist.image}
                                            alt={artist.name || "아티스트"}
                                            className="artist-image"
                                        />
                                    ) : (
                                        <div className="artist-placeholder">
                                            <span>{artist.name && artist.name.trim() !== "" ? artist.name.charAt(0) : "?"}</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="artist-name">
                                    {!artist.name || artist.name === "name" || artist.name.trim() === "" ? "미정" : artist.name}
                                </h3>
                                {(artist.time || artist.performanceDate) && (
                                    <p className="artist-time">{artist.time || artist.performanceDate}</p>
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
                    <h2 className="section-title">{getFestivalName()} 소개</h2>
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

            {/* 카더라 게시판 섹션 */}
            <div className="festival-detail-section kadera-section">
                <h2 className="section-title">
                    <FaComments className="icon" style={{fontSize: '0.85em'}} />
                    카더라 게시판
                </h2>
                <CommentForm
                    festivalId={festival.id}
                    onCommentAdded={handleCommentAdded}
                />
                <CommentList
                    key={commentRefreshKey}
                    festivalId={festival.id}
                    refreshKey={commentRefreshKey}
                    onCommentDeleted={handleCommentDeleted}
                />
            </div>

            <div className="back-link-container">
                <Link to="/" className="back-link">
                    목록으로 돌아가기
                </Link>
            </div>
        </div>
    );
};

export default FestivalDetail;
