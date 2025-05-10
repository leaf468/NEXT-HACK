import React, { useContext } from "react";
import ArtistCard from "./ArtistCard";
import { FestivalContext } from "../../contexts/FestivalContext";

const ArtistList = ({ artists, onArtistSelect }) => {
    const { festivals } = useContext(FestivalContext);

    // 각 아티스트가 출연하는 축제 수 계산
    const getArtistFestivalCount = (artistName) => {
        return festivals.filter((festival) =>
            festival.artists.some((artist) => artist.name === artistName)
        ).length;
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
            {artists.map((artist) => (
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
