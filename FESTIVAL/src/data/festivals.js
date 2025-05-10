// 모의 데이터: 대학교 축제 정보
const festivals = [
    {
        id: "1",
        name: "대동제",
        school: "서울대학교",
        description:
            "서울대학교 2025년 봄 대동제입니다. 다양한 공연과 부스가 준비되어 있습니다.",
        startDate: "2025-05-20",
        endDate: "2025-05-23",
        time: "17:00 ~ 22:00",
        image: "https://example.com/snu_festival.jpg",
        location: {
            address: "서울특별시 관악구 관악로 1 서울대학교 대운동장",
            coordinates: {
                latitude: 37.4591,
                longitude: 126.952,
            },
            region: "서울",
        },
        artists: [
            {
                name: "아이유",
                time: "2025-05-22 20:00",
                image: "https://example.com/artists/iu.jpg",
            },
            {
                name: "뉴진스",
                time: "2025-05-23 19:00",
                image: "https://example.com/artists/newjeans.jpg",
            },
            {
                name: "악뮤",
                time: "2025-05-21 20:00",
                image: "https://example.com/artists/akmu.jpg",
            },
        ],
        ticketInfo: "학생증 지참 시 입장 가능, 일반인 입장 가능(유료)",
        ticketLink: "https://example.com/ticket/snu",
    },
    {
        id: "2",
        name: "고연전 축제",
        school: "고려대학교",
        description:
            "고려대학교 2025년 고연전 축제. 연세대학교와의 스포츠 경기 및 다양한 축제 행사가 진행됩니다.",
        startDate: "2025-09-15",
        endDate: "2025-09-18",
        time: "18:00 ~ 23:00",
        image: "https://example.com/korea_university_festival.jpg",
        location: {
            address: "서울특별시 성북구 안암로 145 고려대학교 안암캠퍼스",
            coordinates: {
                latitude: 37.5895,
                longitude: 127.0323,
            },
            region: "서울",
        },
        artists: [
            {
                name: "지코",
                time: "2025-09-17 21:00",
                image: "https://example.com/artists/zico.jpg",
            },
            {
                name: "있지",
                time: "2025-09-16 20:00",
                image: "https://example.com/artists/itzy.jpg",
            },
        ],
        ticketInfo: "학생증 지참 시 무료 입장, 타 대학생 및 일반인 5,000원",
        ticketLink: "https://example.com/ticket/korea",
    },
    {
        id: "3",
        name: "함께하는 광복 축제",
        school: "부산대학교",
        description:
            "부산대학교 2025년 봄 축제입니다. 지역사회와 함께하는 다양한 행사가 준비되어 있습니다.",
        startDate: "2025-05-17",
        endDate: "2025-05-19",
        time: "16:00 ~ 22:00",
        image: "https://example.com/pusan_festival.jpg",
        location: {
            address: "부산광역시 금정구 부산대학로63번길 2 부산대학교",
            coordinates: {
                latitude: 35.2334,
                longitude: 129.0798,
            },
            region: "부산",
        },
        artists: [
            {
                name: "싸이",
                time: "2025-05-19 20:30",
                image: "https://example.com/artists/psy.jpg",
            },
            {
                name: "세븐틴",
                time: "2025-05-18 19:00",
                image: "https://example.com/artists/seventeen.jpg",
            },
        ],
        ticketInfo: "학생증 지참 필수, 일반인 입장 가능(1만원)",
        ticketLink: null,
    },
    {
        id: "4",
        name: "하나로 축제",
        school: "연세대학교",
        description:
            "연세대학교 2025년 가을 축제. 학생들의 다양한 문화 행사와 공연이 준비되어 있습니다.",
        startDate: "2025-10-05",
        endDate: "2025-10-08",
        time: "17:30 ~ 22:30",
        image: "https://example.com/yonsei_festival.jpg",
        location: {
            address: "서울특별시 서대문구 연세로 50 연세대학교",
            coordinates: {
                latitude: 37.5665,
                longitude: 126.938,
            },
            region: "서울",
        },
        artists: [
            {
                name: "르세라핌",
                time: "2025-10-07 20:00",
                image: "https://example.com/artists/lesserafim.jpg",
            },
            {
                name: "악뮤",
                time: "2025-10-08 21:00",
                image: "https://example.com/artists/akmu.jpg",
            },
        ],
        ticketInfo: "학생증 지참 시 무료, 타 대학생 및 일반인 8,000원",
        ticketLink: "https://example.com/ticket/yonsei",
    },
    {
        id: "5",
        name: "카이페스티벌",
        school: "카이스트",
        description:
            "카이스트 2025년 봄 축제. 과학기술 전시와 함께하는 문화 공연 축제입니다.",
        startDate: "2025-04-10",
        endDate: "2025-04-12",
        time: "14:00 ~ 22:00",
        image: "https://example.com/kaist_festival.jpg",
        location: {
            address: "대전광역시 유성구 대학로 291 카이스트",
            coordinates: {
                latitude: 36.37,
                longitude: 127.3603,
            },
            region: "대전",
        },
        artists: [
            {
                name: "아이유",
                time: "2025-04-12 20:00",
                image: "https://example.com/artists/iu.jpg",
            },
            {
                name: "10cm",
                time: "2025-04-11 19:00",
                image: "https://example.com/artists/10cm.jpg",
            },
        ],
        ticketInfo: "학생증 지참 시 무료, 외부인 입장 가능(5,000원)",
        ticketLink: "https://example.com/ticket/kaist",
    },
    {
        id: "6",
        name: "청춘 축제",
        school: "한양대학교",
        description:
            "한양대학교 2025년 봄 축제. 청춘의 열정을 느낄 수 있는 다양한 행사가 준비되어 있습니다.",
        startDate: "2025-05-25",
        endDate: "2025-05-28",
        time: "16:30 ~ 23:00",
        image: "https://example.com/hanyang_festival.jpg",
        location: {
            address: "서울특별시 성동구 왕십리로 222 한양대학교",
            coordinates: {
                latitude: 37.5574,
                longitude: 127.0467,
            },
            region: "서울",
        },
        artists: [
            {
                name: "태양",
                time: "2025-05-27 21:00",
                image: "https://example.com/artists/taeyang.jpg",
            },
            {
                name: "볼빨간사춘기",
                time: "2025-05-26 20:00",
                image: "https://example.com/artists/bol4.jpg",
            },
        ],
        ticketInfo: "학생증 지참 시 무료 입장, 외부인 입장 가능(1만원)",
        ticketLink: "https://example.com/ticket/hanyang",
    },
    {
        id: "7",
        name: "대동제",
        school: "경북대학교",
        description:
            "경북대학교 2025년 가을 대동제. 전통과 현대가 어우러진 다채로운 프로그램이 준비되어 있습니다.",
        startDate: "2025-09-23",
        endDate: "2025-09-26",
        time: "16:00 ~ 22:00",
        image: "https://example.com/knu_festival.jpg",
        location: {
            address: "대구광역시 북구 대학로 80 경북대학교",
            coordinates: {
                latitude: 35.888,
                longitude: 128.6108,
            },
            region: "대구",
        },
        artists: [
            {
                name: "헤이즈",
                time: "2025-09-25 20:00",
                image: "https://example.com/artists/heize.jpg",
            },
            {
                name: "뉴진스",
                time: "2025-09-26 21:00",
                image: "https://example.com/artists/newjeans.jpg",
            },
        ],
        ticketInfo: "학생증 지참 시 무료, 일반인 입장 가능(7,000원)",
        ticketLink: "https://example.com/ticket/knu",
    },
    {
        id: "8",
        name: "봄꽃 축제",
        school: "이화여자대학교",
        description:
            "이화여자대학교 2025년 봄 축제. 캠퍼스의 아름다운 봄꽃과 함께하는 문화 행사입니다.",
        startDate: "2025-04-05",
        endDate: "2025-04-08",
        time: "15:00 ~ 21:00",
        image: "https://example.com/ewha_festival.jpg",
        location: {
            address: "서울특별시 서대문구 이화여대길 52 이화여자대학교",
            coordinates: {
                latitude: 37.5618,
                longitude: 126.9467,
            },
            region: "서울",
        },
        artists: [
            {
                name: "다비치",
                time: "2025-04-07 19:00",
                image: "https://example.com/artists/davichi.jpg",
            },
            {
                name: "에스파",
                time: "2025-04-08 20:00",
                image: "https://example.com/artists/aespa.jpg",
            },
        ],
        ticketInfo: "학생증 지참 시 무료, 외부인 사전예약 필수(무료)",
        ticketLink: "https://example.com/ticket/ewha",
    },
];

export default festivals;
