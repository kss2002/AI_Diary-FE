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

  // 앱 시작 시 인증 상태 확인
  useEffect(() => {
    const validateAuth = async () => {
      try {
        const userData = await authService.validateAuth();

        if (userData) {
          // 유효한 사용자 데이터가 있는 경우
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ 기존 인증 정보 복원:', userData);
        } else {
          // 인증 정보가 없는 경우 (정상적인 상황)
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
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
    localStorage.removeItem('isAuthenticated');
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
