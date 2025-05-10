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

    // 알림 표시
    const displayNotification = (title, message, type = "info") => {
        const newNotification = {
            id: uuidv4(),
            title,
            message,
            type,
            read: false,
            timestamp: new Date(),
        };

        setNotifications((prev) => [newNotification, ...prev]);
        setShowNotification(true);

        // 10초 후 자동으로 닫기
        setTimeout(() => {
            removeNotification(newNotification.id);
        }, 10000);

        return newNotification.id;
    };

    // 알림 제거
    const removeNotification = (notificationId) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === notificationId
                    ? { ...notification, show: false }
                    : notification
            )
        );

        // 애니메이션 후 실제로 제거
        setTimeout(() => {
            setNotifications((prev) =>
                prev.filter(
                    (notification) => notification.id !== notificationId
                )
            );
        }, 300);
    };

    // 모든 알림 읽음 처리
    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, read: true }))
        );
    };

    // 알림 개수 가져오기
    const getUnreadCount = () => {
        return notifications.filter((notification) => !notification.read)
            .length;
    };

    // 즐겨찾기한 축제 업데이트 체크 (실시간 알림 구현)
    useEffect(() => {
        if (festivals.length === 0 || favorites.length === 0) return;

        const checkForUpdates = async () => {
            try {
                // 즐겨찾기한 축제들만 업데이트 체크
                const favoriteFestivals = festivals.filter((festival) =>
                    favorites.includes(festival.id)
                );

                if (favoriteFestivals.length === 0) return;

                const updates = await checkFestivalUpdates(
                    favoriteFestivals.map((f) => f.id)
                );

                // 업데이트가 있는 경우 알림 표시
                updates.forEach((update) => {
                    const festival = festivals.find(
                        (f) => f.id === update.festivalId
                    );
                    if (festival) {
                        displayNotification(
                            "축제 정보 업데이트",
                            `${festival.school} ${festival.name}의 ${update.field}이(가) 업데이트 되었습니다.`,
                            "info"
                        );
                    }
                });
            } catch (error) {
                console.error("축제 업데이트 확인 중 오류 발생:", error);
            }
        };

        // 처음 로드 시와 5분마다 업데이트 체크
        checkForUpdates();
        const intervalId = setInterval(checkForUpdates, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [festivals, favorites]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                displayNotification,
                removeNotification,
                markAllAsRead,
                getUnreadCount,
                showNotification,
                setShowNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
