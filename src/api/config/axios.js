import axios from 'axios';
import { BASE_URL } from './endpoints.js';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 포함
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 현재 API는 토큰 방식이 아니므로 추후 구현 예정
    // const token = localStorage.getItem('accessToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    // 요청 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(
        '✅ API Response:',
        response.config.method?.toUpperCase(),
        response.config.url,
        response.data
      );
    }
    return response;
  },
  async (error) => {
    // 401 에러 처리 (현재는 간단하게 로그아웃 처리)
    if (error.response?.status === 401) {
      // 인증 실패 시 로그아웃 처리
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      window.location.href = '/auth';
      return Promise.reject(error);
    }

    // 에러 로깅
    console.error(
      '❌ API Error:',
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default apiClient;
