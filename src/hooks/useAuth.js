import useSWR from 'swr';
import { authService } from '../api/services/authService.js';

// SWR fetcher 함수
const fetcher = async (url) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  return response.json();
};

// 인증 관련 훅
export const useAuth = () => {
  const {
    data: user,
    error,
    mutate,
  } = useSWR(
    localStorage.getItem('accessToken') ? '/user/profile' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  );

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    mutate(result.user); // SWR 캐시 업데이트
    return result;
  };

  const logout = async () => {
    await authService.logout();
    mutate(null); // SWR 캐시 클리어
  };

  const signup = async (userData) => {
    return authService.signup(userData);
  };

  const kakaoLogin = async (code) => {
    const result = await authService.kakaoLogin(code);
    mutate(result.user);
    return result;
  };

  const googleLogin = async (token) => {
    const result = await authService.googleLogin(token);
    mutate(result.user);
    return result;
  };

  return {
    user,
    isLoading: !error && !user && localStorage.getItem('accessToken'),
    isError: error,
    login,
    logout,
    signup,
    kakaoLogin,
    googleLogin,
    mutate,
  };
};

// 사용자 프로필 조회
export const useProfile = () => {
  const { data, error, mutate } = useSWR('/user/profile', fetcher);

  return {
    profile: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
