import React from "react";
import { FaMusic } from "react-icons/fa";

const ArtistCard = ({ artist, festivalCount, onClick }) => {
    return (
        <div className="artist-card" onClick={() => onClick(artist.name)}>
            <div className="artist-image-container">
                {artist.posterUrl || artist.image || artist.imageUrl ? (
                    <img
                        src={`${artist.posterUrl || artist.image || artist.imageUrl}${(artist.posterUrl || artist.image || artist.imageUrl).includes('?') ? '&' : '?'}t=${Date.now()}`}
                        alt={artist.name}
                        className="artist-image"
                        onError={(e) => {
                            console.log(`Image load error for artist ${artist.name}`);
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                        }}
                    />
                ) : null}
                <div className="artist-placeholder" style={{ display: (artist.posterUrl || artist.image || artist.imageUrl) ? 'none' : 'block' }}>
                    <span>{artist.name.charAt(0)}</span>
                </div>
            </div>

            <div className="artist-content">
                <h2 className="artist-name">{artist.name}</h2>

                {artist.genres && artist.genres.length > 0 && (
                    <div className="artist-genres">
                        {artist.genres.map((genre, index) => (
                            <span key={index} className="genre-tag">
                                {genre}
                            </span>
                        ))}
                    </div>
                )}

                {festivalCount > 0 && (
                    <div className="artist-festivals">
                        <FaMusic className="icon" />
                        <span>{festivalCount}개 축제 출연 예정</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArtistCard;
