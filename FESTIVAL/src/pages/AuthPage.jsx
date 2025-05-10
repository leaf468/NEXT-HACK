import React, { useState, useContext } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { loginUser } from "../services/userService";

const AuthPage = () => {
    const { isLoggedIn, setIsLoggedIn, setUser } = useContext(UserContext);
    const [name, setName] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [identifierType, setIdentifierType] = useState("phone"); // "phone" or "random"
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // 리디렉션 경로 (로그인 후 돌아갈 페이지)
    const from = location.state?.from?.pathname || "/";

    // 이미 로그인되어 있다면 이전 페이지 또는 홈으로 리다이렉트
    if (isLoggedIn) {
        return <Navigate to={from} replace />;
    }

    // Generate random 4-digit code
    const generateRandomCode = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const switchIdentifierType = () => {
        setIdentifierType(identifierType === "phone" ? "random" : "phone");
        setIdentifier("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!name || name.length < 2) {
            setError("이름을 2글자 이상 입력해주세요.");
            setLoading(false);
            return;
        }

        if (identifierType === "phone" && (!identifier || !/^\d{10,11}$/.test(identifier))) {
            setError("유효한 전화번호를 입력해주세요.");
            setLoading(false);
            return;
        }

        if (identifierType === "random" && (!identifier || !/^\d{4}$/.test(identifier))) {
            setError("유효한 4자리 코드를 입력해주세요.");
            setLoading(false);
            return;
        }

        try {
            // 로그인 처리
            const user = await loginUser(name);
            setUser(user);
            setIsLoggedIn(true);
            navigate(from, { replace: true });
        } catch (err) {
            setError("로그인에 실패했습니다. 다시 시도해주세요.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h1 className="auth-title">간편 로그인</h1>

                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">이름 (2-3글자)</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            required
                            maxLength={3}
                        />
                    </div>

                    <div className="form-group">
                        <div className="identifier-type-toggle">
                            <label>
                                <input
                                    type="radio"
                                    checked={identifierType === "phone"}
                                    onChange={() => setIdentifierType("phone")}
                                />
                                전화번호
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    checked={identifierType === "random"}
                                    onChange={() => setIdentifierType("random")}
                                />
                                랜덤 숫자 (4자리)
                            </label>
                        </div>

                        {identifierType === "phone" ? (
                            <>
                                <label htmlFor="phone">전화번호</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="전화번호를 입력하세요 (숫자만)"
                                    required
                                    maxLength={11}
                                />
                            </>
                        ) : (
                            <>
                                <label htmlFor="random">랜덤 숫자 (4자리)</label>
                                <div className="random-code-container">
                                    <input
                                        type="text"
                                        id="random"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="4자리 숫자를 입력하세요"
                                        required
                                        maxLength={4}
                                    />
                                    <button
                                        type="button"
                                        className="generate-code-btn"
                                        onClick={() => setIdentifier(generateRandomCode())}
                                    >
                                        생성
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? "처리 중..." : "로그인"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthPage;