import React from "react";
import FavoriteList from "../components/user/FavoriteList";

const FavoritesPage = () => {
    return (
        <div className="favorites-page">
            <div className="favorites-header">
                <h1>즐겨찾기</h1>
                <p className="page-description">
                    관심 있는 축제를 한눈에 확인하세요.
                </p>
            </div>

            <FavoriteList />
        </div>
    );
};

export default FavoritesPage;
