import React, { useContext, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { FestivalContext } from "../../contexts/FestivalContext";
import FestivalCard from "../festival/FestivalCard";
import { filterFestivalsByStatus } from "../../utils/filterUtils";

const FavoriteList = () => {
    const { favorites } = useContext(UserContext);
    const { festivals } = useContext(FestivalContext);
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'upcoming', 'ongoing', 'ended'

    // 즐겨찾기한 축제 목록 가져오기
    const favoriteFestivals = festivals.filter((festival) =>
        favorites.includes(festival.id)
    );

    // 상태별 필터링
    const filteredFestivals = filterFestivalsByStatus(
        favoriteFestivals,
        statusFilter
    );

    const handleStatusChange = (status) => {
        setStatusFilter(status);
    };

    if (favorites.length === 0) {
        return (
            <div className="empty-favorites">
                <p>즐겨찾기한 축제가 없습니다.</p>
                <p>관심 있는 축제를 즐겨찾기에 추가해보세요!</p>
            </div>
        );
    }

    return (
        <div className="favorites-container">
            <div className="status-filters">
                <button
                    className={`status-filter-btn ${
                        statusFilter === "all" ? "active" : ""
                    }`}
                    onClick={() => handleStatusChange("all")}
                >
                    전체
                </button>
                <button
                    className={`status-filter-btn ${
                        statusFilter === "upcoming" ? "active" : ""
                    }`}
                    onClick={() => handleStatusChange("upcoming")}
                >
                    예정
                </button>
                <button
                    className={`status-filter-btn ${
                        statusFilter === "ongoing" ? "active" : ""
                    }`}
                    onClick={() => handleStatusChange("ongoing")}
                >
                    진행 중
                </button>
                <button
                    className={`status-filter-btn ${
                        statusFilter === "ended" ? "active" : ""
                    }`}
                    onClick={() => handleStatusChange("ended")}
                >
                    종료
                </button>
            </div>

            {filteredFestivals.length > 0 ? (
                <div className="card-grid">
                    {filteredFestivals.map((festival) => (
                        <FestivalCard key={festival.id} festival={festival} />
                    ))}
                </div>
            ) : (
                <div className="empty-filtered-favorites">
                    <p>선택한 상태의 축제가 없습니다.</p>
                </div>
            )}
        </div>
    );
};

export default FavoriteList;
