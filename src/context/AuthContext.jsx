import { createContext, useContext, useState, useEffect } from 'react';
import { SWRConfig } from 'swr';
import { authService } from '../api/services/authService.js';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용되어야 합니다');
  }
  return context;
};

// 호환성을 위해 useAuthContext도 유지
export const useAuthContext = useAuth;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 앱 시작 시 토큰 검증
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authService.validateToken();
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Token validation failed:', error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  // SWR 글로벌 설정
  const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
    onError: (error) => {
      console.error('SWR Error:', error);

      // 401 에러 시 로그아웃 처리
      if (error.status === 401) {
        logout();
      }
    },
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      <SWRConfig value={swrConfig}>{children}</SWRConfig>
    </AuthContext.Provider>
  );
};
