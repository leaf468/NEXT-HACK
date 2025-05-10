import React, { useState, useContext } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { registerUser, loginUser } from "../services/userService";

const AuthPage = () => {
    const { isLoggedIn, setIsLoggedIn, setUser } = useContext(UserContext);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                // 로그인 처리
                const user = await loginUser(email, password);
                setUser(user);
                setIsLoggedIn(true);
                navigate(from, { replace: true });
            } else {
                // 회원가입 처리
                if (!displayName) {
                    setError("이름을 입력해주세요.");
                    setLoading(false);
                    return;
                }
                const user = await registerUser(email, password, displayName);
                setUser(user);
                setIsLoggedIn(true);
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(isLogin
                ? "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
                : "회원가입에 실패했습니다. 다시 시도해주세요."
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError("");
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <h1 className="auth-title">
                    {isLogin ? "로그인" : "회원가입"}
                </h1>
                
                {error && <p className="auth-error">{error}</p>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="displayName">이름</label>
                            <input
                                type="text"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="이름을 입력하세요"
                                required={!isLogin}
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일을 입력하세요"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? "처리 중..." : (isLogin ? "로그인" : "회원가입")}
                    </button>
                </form>
                
                <div className="auth-switch">
                    {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
                    <button 
                        onClick={switchMode} 
                        className="auth-switch-btn"
                    >
                        {isLogin ? "회원가입" : "로그인"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;