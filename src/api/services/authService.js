import apiClient from '../config/axios.js';
import { API_ENDPOINTS } from '../config/endpoints.js';
import { handleApiError, handleSuccess } from '../config/errorHandler.js';

// 인증 서비스
export const authService = {
  // 일반 로그인
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password,
      });

      // API 응답 구조에 맞게 처리
      if (response.data.success && response.data.data) {
        const userData = response.data.data;

        // 사용자 정보 저장 (토큰이 없으므로 userId로 인증 상태 관리)
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');

        handleSuccess(response.data.message || '로그인되었습니다.');
        return userData;
      } else {
        throw new Error(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 회원가입
  async signup(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, {
        email: userData.email,
        password: userData.password,
        nickName: userData.nickName,
      });

      // API 응답 구조에 맞게 처리
      if (response.data.success) {
        handleSuccess(response.data.message || '회원가입이 완료되었습니다.');
        return response.data.data;
      } else {
        throw new Error(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // 로그아웃 (현재는 로컬 데이터 정리만)
  async logout() {
    try {
      // 로컬 데이터 정리
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');

      handleSuccess('로그아웃되었습니다.');
    } catch (error) {
      // 로그아웃은 실패해도 로컬 데이터는 정리
      localStorage.removeItem('isAuthenticated');
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

  // 사용자 인증 상태 확인 (토큰 대신 localStorage 기반)
  async validateAuth() {
    try {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      const savedUser = localStorage.getItem('user');

      if (!isAuthenticated || !savedUser) {
        throw new Error('No authentication found');
      }

      return JSON.parse(savedUser);
    } catch {
      // 인증 정보가 유효하지 않으면 정리
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      throw new Error('Authentication validation failed');
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
