import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FestivalContext } from "../contexts/FestivalContext";
import { NotificationContext } from "../contexts/NotificationContext";
import { fetchFestivalById } from "../services/festivalService";
import FestivalDetail from "../components/festival/FestivalDetail";

const FestivalDetailPage = () => {
    const { id } = useParams();
    const decodedId = decodeURIComponent(id);
    const navigate = useNavigate();
    const { getFestivalById } = useContext(FestivalContext);
    const { displayNotification } = useContext(NotificationContext);

    const [festival, setFestival] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadFestival = async () => {
            try {
                setLoading(true);

                // 먼저 컨텍스트에서 축제 정보 찾기
                let festivalData = getFestivalById(decodedId);

                // 컨텍스트에 없으면 API에서 가져오기
                if (!festivalData) {
                    try {
                        festivalData = await fetchFestivalById(decodedId);
                    } catch (err) {
                        throw new Error("축제 정보를 찾을 수 없습니다.");
                    }
                }

                setFestival(festivalData);
            } catch (err) {
                setError(err.message || "축제 정보를 불러오는데 실패했습니다.");
                displayNotification(
                    "오류",
                    err.message || "축제 정보를 불러오는데 실패했습니다.",
                    "error"
                );
            } finally {
                setLoading(false);
            }
        };

        loadFestival();
    }, [id, decodedId, getFestivalById, displayNotification]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>축제 정보를 불러오는 중입니다...</p>
            </div>
        );
    }

    if (error || !festival) {
        return (
            <div className="error-container">
                <h2>오류 발생</h2>
                <p>{error || "축제 정보를 찾을 수 없습니다."}</p>
                <button className="back-button" onClick={() => navigate("/")}>
                    홈으로 돌아가기
                </button>
            </div>
        );
    }

    return <FestivalDetail festival={festival} />;
};

export default FestivalDetailPage;
