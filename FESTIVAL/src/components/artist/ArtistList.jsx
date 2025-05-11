import React, { useContext } from "react";
import ArtistCard from "./ArtistCard";
import { FestivalContext } from "../../contexts/FestivalContext";

const ArtistList = ({ artists, onArtistSelect }) => {
    const { festivals } = useContext(FestivalContext);

    // 각 아티스트가 출연 예정인 축제 수 계산 (지난 축제 제외)
    const getArtistFestivalCount = (artistName) => {
        const now = new Date();
        return festivals.filter((festival) => {
            // 아티스트가 참여하는 축제인지 확인
            const artistMatches = festival.artists.some((artist) => artist.name === artistName);

            if (!artistMatches) return false;

            // dday 또는 status 정보를 이용해 지난 축제 제외
            if (festival.status === "ended") return false;
            if (festival.dDays !== null && festival.dDays < 0) return false;

            // 기존 날짜 기반 확인
            if (festival.endDate) {
                let endDate;
                if (typeof festival.endDate === 'string') {
                    endDate = new Date(festival.endDate);
                } else if (festival.endDate instanceof Date) {
                    endDate = festival.endDate;
                } else if (festival.endDate && typeof festival.endDate.toDate === 'function') {
                    endDate = festival.endDate.toDate();
                } else {
                    return false; // 종료일이 유효하지 않으면 제외 (안전하게)
                }

                // 종료일이 지났으면 제외
                if (now > endDate) return false;
            } else if (festival.startDate) {
                // 종료일이 없지만 시작일이 있는 경우, 시작일이 이미 지났으면 제외
                let startDate;
                if (typeof festival.startDate === 'string') {
                    startDate = new Date(festival.startDate);
                } else if (festival.startDate instanceof Date) {
                    startDate = festival.startDate;
                } else if (festival.startDate && typeof festival.startDate.toDate === 'function') {
                    startDate = festival.startDate.toDate();
                } else {
                    return false; // 시작일이 유효하지 않으면 제외 (안전하게)
                }

                // 시작일이 지났고 종료일이 없는 경우, 축제가 이미 끝났다고 가정
                if (now > startDate) return false;
            } else {
                // 시작일과 종료일이 모두 없는 경우 제외 (날짜 정보가 필요함)
                return false;
            }

            return true;
        }).length;
    };

    if (!artists || artists.length === 0) {
        return (
            <div className="empty-message">
                <p>표시할 아티스트 정보가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="artist-grid">
            {artists
                .filter(artist => artist.name !== "name")
                .map((artist) => (
                    <ArtistCard
                        key={artist.id}
                        artist={artist}
                        festivalCount={getArtistFestivalCount(artist.name)}
                        onClick={() => onArtistSelect(artist.name)}
                    />
                ))}
        </div>
    );
};

export default ArtistList;
