import React, { createContext, useState, useEffect } from "react";
import {
    getUserFavorites,
    addFavorite,
    removeFavorite,
} from "../services/userService";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    // 로컬 스토리지에서 사용자 정보 불러오기
    useEffect(() => {
        const savedUser = localStorage.getItem("festivalUser");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setIsLoggedIn(true);
                // 사용자가 방문한 적이 있음을 표시
                localStorage.setItem("festivalUserVisited", "true");
            } catch (e) {
                console.error("저장된 사용자 정보를 불러오는데 실패했습니다:", e);
            }
        } else {
            // 처음 방문한 경우 로그인 팝업 표시
            setShowLoginPopup(true);
        }
    }, []);

    // 로컬 스토리지에서 즐겨찾기 불러오기 (로그인 없이도 동작하게)
    useEffect(() => {
        const loadFavorites = () => {
            if (isLoggedIn && user) {
                // 사용자 ID로 즐겨찾기 로드
                const userFavoritesKey = `favorites_${user.id}`;
                const savedFavorites = localStorage.getItem(userFavoritesKey);

                if (savedFavorites) {
                    setFavorites(JSON.parse(savedFavorites));
                } else {
                    // 기존의 일반 즐겨찾기가 있으면 사용자 즐겨찾기로 마이그레이션
                    const oldFavorites = JSON.parse(
                        localStorage.getItem("favorites") || "[]"
                    );
                    if (oldFavorites.length > 0) {
                        localStorage.setItem(userFavoritesKey, JSON.stringify(oldFavorites));
                        setFavorites(oldFavorites);
                    } else {
                        setFavorites([]);
                    }
                }
            } else {
                // 로컬 스토리지에서 즐겨찾기 불러오기
                const localFavorites = JSON.parse(
                    localStorage.getItem("favorites") || "[]"
                );
                setFavorites(localFavorites);
            }
        };

        loadFavorites();
    }, [isLoggedIn, user]);

    // 축제를 즐겨찾기에 추가
    const addToFavorites = async (festivalId) => {
        if (!isLoggedIn || !user) {
            // 로그인하지 않은 경우 로컬 스토리지에 저장
            const updatedFavorites = [...favorites, festivalId];
            localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
            setFavorites(updatedFavorites);
            return;
        }

        // 로그인한 사용자의 즐겨찾기
        const userFavoritesKey = `favorites_${user.id}`;
        const updatedFavorites = [...favorites, festivalId];
        localStorage.setItem(userFavoritesKey, JSON.stringify(updatedFavorites));
        setFavorites(updatedFavorites);
    };

    // 축제를 즐겨찾기에서 제거
    const removeFromFavorites = async (festivalId) => {
        if (!isLoggedIn || !user) {
            // 로그인하지 않은 경우 로컬 스토리지에서 제거
            const updatedFavorites = favorites.filter(
                (id) => id !== festivalId
            );
            localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
            setFavorites(updatedFavorites);
            return;
        }

        // 로그인한 사용자의 즐겨찾기 제거
        const userFavoritesKey = `favorites_${user.id}`;
        const updatedFavorites = favorites.filter((id) => id !== festivalId);
        localStorage.setItem(userFavoritesKey, JSON.stringify(updatedFavorites));
        setFavorites(updatedFavorites);
    };

    // 즐겨찾기 여부 확인
    const isFavorite = (festivalId) => {
        return favorites.includes(festivalId);
    };

    // 로그아웃 처리
    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("festivalUser");
    };

    return (
        <UserContext.Provider
            value={{
                favorites,
                isLoggedIn,
                user,
                showLoginPopup,
                setShowLoginPopup,
                addToFavorites,
                removeFromFavorites,
                isFavorite,
                setIsLoggedIn,
                setUser,
                logout,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
