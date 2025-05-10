import React, { useContext } from "react";
import { Link } from "react-router-dom";
import {
    FaHeart,
    FaRegHeart,
    FaMapMarkerAlt,
    FaCalendarAlt,
} from "react-icons/fa";
import { UserContext } from "../../contexts/UserContext";
import { formatDate } from "../../utils/dateUtils";
import { getFestivalStatus } from "../../utils/dateUtils";

const FestivalCard = ({ festival }) => {
    const { isFavorite, addToFavorites, removeFromFavorites } =
        useContext(UserContext);

    const handleFavoriteToggle = (e) => {
        e.preventDefault(); // 링크 클릭 이벤트 방지
        e.stopPropagation(); // 이벤트 버블링 방지

        if (isFavorite(festival.id)) {
            removeFromFavorites(festival.id);
        } else {
            addToFavorites(festival.id);
        }
    };

    const festivalStatus = getFestivalStatus(
        festival.startDate,
        festival.endDate
    );

    return (
        <Link to={`/festival/${encodeURIComponent(festival.id)}`} className="festival-card">
            <div className={`festival-status ${festivalStatus.status}`}>
                {festivalStatus.label}
            </div>

            <div className="festival-image">
                {festival.image ? (
                    <img
                        src={festival.image}
                        alt={`${festival.school} ${festival.name} 포스터`}
                    />
                ) : (
                    <div className="placeholder-image">
                        <span>{festival.school.charAt(0)}</span>
                    </div>
                )}
            </div>

            <div className="festival-content">
                <div className="festival-header">
                    <h2 className="festival-name">{festival.name}</h2>
                    <button
                        className={`favorite-button ${
                            isFavorite(festival.id) ? "active" : ""
                        }`}
                        onClick={handleFavoriteToggle}
                        aria-label={
                            isFavorite(festival.id)
                                ? "즐겨찾기 삭제"
                                : "즐겨찾기 추가"
                        }
                    >
                        {isFavorite(festival.id) ? <FaHeart /> : <FaRegHeart />}
                    </button>
                </div>

                <h3 className="festival-school">{festival.school}</h3>

                <div className="festival-details">
                    <div className="festival-detail">
                        <FaCalendarAlt className="icon" />
                        <span>
                            {formatDate(festival.startDate)} ~{" "}
                            {formatDate(festival.endDate)}
                        </span>
                    </div>

                    <div className="festival-detail">
                        <FaMapMarkerAlt className="icon" />
                        <span>{festival.location.address}</span>
                    </div>
                </div>

                {festival.artists && festival.artists.length > 0 && (
                    <div className="festival-artists">
                        <span className="artists-label">출연진:</span>
                        <div className="artists-list">
                            {festival.artists
                                .slice(0, 3)
                                .map((artist, index) => (
                                    <span key={index} className="artist-tag">
                                        {artist.name}
                                    </span>
                                ))}
                            {festival.artists.length > 3 && (
                                <span className="more-artists">
                                    +{festival.artists.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default FestivalCard;
