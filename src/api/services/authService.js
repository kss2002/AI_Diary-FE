import apiClient from '../config/axios.js';
import { API_ENDPOINTS } from '../config/endpoints.js';
import { handleApiError, handleSuccess } from '../config/errorHandler.js';

// 인증 서비스
export const authService = {
  // 일반 로그인
  async login(credentials) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // 토큰 저장
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }

      handleSuccess('로그인되었습니다.');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 회원가입
  async signup(userData) {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.SIGNUP,
        userData
      );
      handleSuccess('회원가입이 완료되었습니다.');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 로그아웃
  async logout() {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);

      // 로컬 데이터 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      handleSuccess('로그아웃되었습니다.');
    } catch (error) {
      // 로그아웃은 실패해도 로컬 데이터는 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      throw handleApiError(error);
    }
  },

  // 카카오 로그인
  async kakaoLogin(code) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.KAKAO_LOGIN, {
        code,
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }

      handleSuccess('카카오 로그인 성공!');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 구글 로그인
  async googleLogin(token) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        token,
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }

      handleSuccess('구글 로그인 성공!');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 토큰 검증 및 사용자 정보 조회
  async validateToken() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
      return response.data;
    } catch (error) {
      // 토큰이 유효하지 않으면 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      throw handleApiError(error);
    }
  },

  // 토큰 새로고침
  async refreshToken() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export default authService;
