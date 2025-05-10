import { 
  getCollection, 
  addDocument, 
  updateDocument, 
  COLLECTIONS 
} from './api';
import { db } from './firebase';
import { 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// API 서버가 없는 경우를 위한 모의 데이터 사용 플래그
const USE_MOCK_DATA = true;

// 축제 업데이트 확인
export const checkFestivalUpdates = async (festivalIds) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 모의 데이터 - 약 20% 확률로 업데이트 발생
        const updates = [];
        festivalIds.forEach((id) => {
          if (Math.random() < 0.2) {
            const fields = ["라인업", "일정", "장소", "티켓 정보"];
            const randomField =
              fields[Math.floor(Math.random() * fields.length)];

            updates.push({
              festivalId: id,
              field: randomField,
              updatedAt: new Date().toISOString(),
            });
          }
        });

        resolve(updates);
      }, 500);
    });
  }

  try {
    // 지정된 축제 ID 목록에 대한 업데이트 찾기
    const updates = [];
    
    // 각 축제마다 최근 업데이트 확인
    for (const festivalId of festivalIds) {
      const festival = await getCollection(COLLECTIONS.FESTIVALS, {
        filters: [
          { field: 'id', operator: '==', value: festivalId },
          { field: 'updatedAt', operator: '>=', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() } // 최근 7일 이내 업데이트
        ]
      });
      
      if (festival.length > 0) {
        updates.push({
          festivalId,
          field: '축제 정보',
          updatedAt: festival[0].updatedAt
        });
      }
    }
    
    return updates;
  } catch (error) {
    console.error("축제 업데이트 확인에 실패했습니다:", error);
    throw error;
  }
};

// 사용자 알림 목록 가져오기
export const getUserNotifications = async (userId) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        resolve(notifications);
      }, 300);
    });
  }

  try {
    // 사용자의 알림 목록 가져오기
    const notifications = await getCollection(COLLECTIONS.NOTIFICATIONS, {
      filters: [
        { field: 'userId', operator: '==', value: userId }
      ],
      orderByField: 'timestamp',
      orderDirection: 'desc'
    });
    
    return notifications;
  } catch (error) {
    console.error("알림 목록을 가져오는데 실패했습니다:", error);
    throw error;
  }
};

// 알림 읽음 표시
export const markNotificationAsRead = async (userId, notificationId) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        const updatedNotifications = notifications.map(
          (notification) => {
            if (notification.id === notificationId) {
              return { ...notification, read: true };
            }
            return notification;
          }
        );

        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        resolve(updatedNotifications);
      }, 300);
    });
  }

  try {
    // 알림 읽음으로 업데이트
    await updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, {
      read: true
    });
    
    // 업데이트된 알림 목록 반환
    return await getUserNotifications(userId);
  } catch (error) {
    console.error("알림 읽음 표시에 실패했습니다:", error);
    throw error;
  }
};

// 알림 모두 읽음 표시
export const markAllNotificationsAsRead = async (userId) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        const updatedNotifications = notifications.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        );

        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        resolve(updatedNotifications);
      }, 300);
    });
  }

  try {
    // 사용자의 모든 알림 가져오기
    const notifications = await getCollection(COLLECTIONS.NOTIFICATIONS, {
      filters: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'read', operator: '==', value: false }
      ]
    });
    
    // 모든 읽지 않은 알림을 읽음으로 업데이트
    const updatePromises = notifications.map(notification => 
      updateDocument(COLLECTIONS.NOTIFICATIONS, notification.id, { read: true })
    );
    
    await Promise.all(updatePromises);
    
    // 업데이트된 알림 목록 반환
    return await getUserNotifications(userId);
  } catch (error) {
    console.error("알림 모두 읽음 표시에 실패했습니다:", error);
    throw error;
  }
};

// 실시간 알림 구독 (Firebase 사용)
export const subscribeToNotifications = (userId, callback) => {
  if (USE_MOCK_DATA) {
    // 모의 알림 생성 (5-10초마다 랜덤 알림)
    const interval = setInterval(() => {
      // 80% 확률로 알림 생성 안함
      if (Math.random() < 0.8) return;

      const types = ["festival_update", "new_artist", "lineup_change"];
      const randomType = types[Math.floor(Math.random() * types.length)];

      const notification = {
        id: `mock-${Date.now()}`,
        type: randomType,
        title: getNotificationTitle(randomType),
        message: getNotificationMessage(randomType),
        timestamp: new Date().toISOString(),
        read: false,
      };

      callback(notification);

      // 로컬 스토리지에 알림 저장
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      notifications.unshift(notification);
      localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
      );
    }, Math.random() * 5000 + 5000); // 5-10초마다

    return () => clearInterval(interval);
  }

  try {
    // Firestore 실시간 리스너 설정
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    // 구독 설정 및 콜백 함수 등록
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          // 새로운 알림이 추가된 경우
          const notification = {
            id: change.doc.id,
            ...change.doc.data()
          };
          callback(notification);
        }
      });
    });
    
    // 구독 해제 함수 반환
    return unsubscribe;
  } catch (error) {
    console.error("알림 구독에 실패했습니다:", error);
    return () => {}; // 오류 시 빈 함수 반환
  }
};

// 알림 생성 (관리자 또는 시스템용)
export const createNotification = async (userId, notificationData) => {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const notification = {
          id: `mock-${Date.now()}`,
          ...notificationData,
          timestamp: new Date().toISOString(),
          read: false,
        };
        
        const notifications = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );
        notifications.unshift(notification);
        localStorage.setItem(
          "notifications",
          JSON.stringify(notifications)
        );
        
        resolve(notification);
      }, 300);
    });
  }
  
  try {
    // 새 알림 생성 데이터 준비
    const newNotification = {
      ...notificationData,
      userId,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Firestore에 알림 추가
    const notificationId = await addDocument(COLLECTIONS.NOTIFICATIONS, newNotification);
    
    return {
      id: notificationId,
      ...newNotification
    };
  } catch (error) {
    console.error("알림 생성에 실패했습니다:", error);
    throw error;
  }
};

// 알림 타입에 따른 제목 생성
const getNotificationTitle = (type) => {
  switch (type) {
    case "festival_update":
      return "축제 정보 업데이트";
    case "new_artist":
      return "새로운 아티스트 추가";
    case "lineup_change":
      return "라인업 변경 알림";
    default:
      return "새로운 알림";
  }
};

// 알림 타입에 따른 메시지 생성
const getNotificationMessage = (type) => {
  const schools = [
    "서울대학교",
    "고려대학교",
    "연세대학교",
    "부산대학교",
    "카이스트",
  ];
  const festivals = ["대동제", "축제", "청춘 페스티벌", "봄 축제"];
  const artists = ["아이유", "뉴진스", "세븐틴", "악뮤", "싸이"];

  const randomSchool = schools[Math.floor(Math.random() * schools.length)];
  const randomFestival =
    festivals[Math.floor(Math.random() * festivals.length)];
  const randomArtist = artists[Math.floor(Math.random() * artists.length)];

  switch (type) {
    case "festival_update":
      return `${randomSchool} ${randomFestival}의 일정이 업데이트되었습니다.`;
    case "new_artist":
      return `${randomSchool} ${randomFestival}에 ${randomArtist}(이)가 새롭게 추가되었습니다.`;
    case "lineup_change":
      return `${randomSchool} ${randomFestival}의 라인업이 변경되었습니다.`;
    default:
      return "축제 정보가 업데이트되었습니다.";
  }
};