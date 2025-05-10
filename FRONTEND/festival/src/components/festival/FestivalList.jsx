import React from "react";
import FestivalCard from "./FestivalCard";

const FestivalList = ({ festivals, loading, error }) => {
    if (loading) {
        return (
            <div className="loading-message">
                <div className="spinner"></div>
                <p>축제 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="retry-button"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    if (!festivals || festivals.length === 0) {
        return (
            <div className="empty-message">
                <p>표시할 축제 정보가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="card-grid">
            {festivals.map((festival) => (
                <FestivalCard key={festival.id} festival={festival} />
            ))}
        </div>
    );
};

export default FestivalList;
