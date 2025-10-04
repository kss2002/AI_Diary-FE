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
    // 로컬 스토리지에서 액세스 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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
    const originalRequest = error.config;

    // 401 에러 (토큰 만료) 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.accessToken;
        localStorage.setItem('accessToken', newToken);

        // 원래 요청에 새 토큰 적용하여 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
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
