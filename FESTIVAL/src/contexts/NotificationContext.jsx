// src/contexts/NotificationContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { UserContext } from "./UserContext";
import { FestivalContext } from "./FestivalContext";
import { checkFestivalUpdates } from "../services/notificationService";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const { favorites } = useContext(UserContext);
    const { festivals } = useContext(FestivalContext);

    // Don't automatically show notifications when new ones come in
    // This was causing issues with the toggle functionality
    // useEffect(() => {
    //     setShowNotification(notifications.length > 0);
    // }, [notifications]);

    // 알림 표시
    const displayNotification = (title, message, type = "info") => {
        const newNotification = {
            id: uuidv4(),
            title,
            message,
            type,
            read: false,
            show: true, // <-- start visible
            timestamp: new Date(),
        };

        setNotifications((prev) => [newNotification, ...prev]);

        // 자동 제거 예약
        setTimeout(() => {
            removeNotification(newNotification.id);
        }, 10000);

        return newNotification.id;
    };

    // 알림 제거
    const removeNotification = (notificationId) => {
        // 1) mark show=false for fade-out animation
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, show: false } : n
            )
        );

        // 2) after animation, actually drop from array
        setTimeout(() => {
            setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId)
            );
        }, 300);
    };

    // 모든 알림 읽음 처리
    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    // 읽지 않은 개수
    const getUnreadCount = () => notifications.filter((n) => !n.read).length;

    // 즐겨찾기 축제 업데이트 주기적 체크
    useEffect(() => {
        if (!festivals.length || !favorites.length) return;

        const checkForUpdates = async () => {
            try {
                const favs = festivals.filter((f) => favorites.includes(f.id));
                if (!favs.length) return;

                const updates = await checkFestivalUpdates(
                    favs.map((f) => f.id)
                );

                updates.forEach((u) => {
                    const fest = festivals.find((f) => f.id === u.festivalId);
                    if (!fest) return;

                    const schoolName =
                        fest.universityName ||
                        fest.university?.name ||
                        fest.school ||
                        "대학교";
                    const festName = fest.name || "축제";

                    displayNotification(
                        "관심 축제 정보 업데이트",
                        `${schoolName} ${festName}의 ${u.field}이(가) 업데이트 되었습니다.`
                    );
                });
            } catch (err) {
                console.error("축제 업데이트 확인 중 오류:", err);
            }
        };

        checkForUpdates();
        const id = setInterval(checkForUpdates, 5 * 60 * 1000);
        return () => clearInterval(id);
    }, [festivals, favorites]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                showNotification,
                setShowNotification,
                displayNotification,
                removeNotification,
                markAllAsRead,
                getUnreadCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
