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

    // 로컬 스토리지에서 즐겨찾기 불러오기 (로그인 없이도 동작하게)
    useEffect(() => {
        const loadFavorites = () => {
            if (isLoggedIn && user) {
                // 서버에서 사용자 즐겨찾기 불러오기
                getUserFavorites(user.id)
                    .then((favoritesData) => {
                        setFavorites(favoritesData);
                    })
                    .catch((error) => {
                        console.error(
                            "즐겨찾기를 불러오는데 실패했습니다:",
                            error
                        );
                    });
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
        if (!isLoggedIn) {
            // 로그인하지 않은 경우 로컬 스토리지에 저장
            const updatedFavorites = [...favorites, festivalId];
            localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
            setFavorites(updatedFavorites);
            return;
        }

        try {
            await addFavorite(user.id, festivalId);
            setFavorites((prev) => [...prev, festivalId]);
        } catch (error) {
            console.error("즐겨찾기 추가에 실패했습니다:", error);
        }
    };

    // 축제를 즐겨찾기에서 제거
    const removeFromFavorites = async (festivalId) => {
        if (!isLoggedIn) {
            // 로그인하지 않은 경우 로컬 스토리지에서 제거
            const updatedFavorites = favorites.filter(
                (id) => id !== festivalId
            );
            localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
            setFavorites(updatedFavorites);
            return;
        }

        try {
            await removeFavorite(user.id, festivalId);
            setFavorites((prev) => prev.filter((id) => id !== festivalId));
        } catch (error) {
            console.error("즐겨찾기 제거에 실패했습니다:", error);
        }
    };

    // 즐겨찾기 여부 확인
    const isFavorite = (festivalId) => {
        return favorites.includes(festivalId);
    };

    return (
        <UserContext.Provider
            value={{
                favorites,
                isLoggedIn,
                user,
                addToFavorites,
                removeFromFavorites,
                isFavorite,
                setIsLoggedIn,
                setUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
