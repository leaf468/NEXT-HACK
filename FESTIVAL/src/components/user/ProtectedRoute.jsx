import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트
 * 로그인하지 않은 사용자는 로그인 페이지로 리디렉션됨
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 보호된 컴포넌트
 * @returns {React.ReactNode} - 인증 상태에 따라 원래 컴포넌트 또는 리디렉션
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(UserContext);
  const location = useLocation();

  if (!isLoggedIn) {
    // 현재 경로를 state로 저장하여 로그인 후 원래 페이지로 돌아갈 수 있게 함
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;