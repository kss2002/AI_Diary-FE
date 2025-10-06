// API 엔드포인트 상수 관리
export const BASE_URL = 'http://13.124.81.252:8080';

export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/v1/users/register/login',
    SIGNUP: '/v1/users/register/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    KAKAO_LOGIN: '/auth/kakao',
    GOOGLE_LOGIN: '/auth/google',
  },

  // 사용자 관련
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    DELETE_ACCOUNT: '/user/delete',
  },

  // 일기 관련
  DIARY: {
    LIST: '/diary',
    CREATE: '/diary',
    GET: (id) => `/diary/${id}`,
    UPDATE: (id) => `/diary/${id}`,
    DELETE: (id) => `/diary/${id}`,
  },

  // AI 관련
  AI: {
    ANALYZE: '/ai/analyze',
    RECOMMEND: '/ai/recommend',
  },
};

export default API_ENDPOINTS;
