// 글로벌 에러 처리 및 사용자 알림
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// 에러 메시지 매핑
const ERROR_MESSAGES = {
  400: '잘못된 요청입니다.',
  401: '로그인이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '이미 존재하는 데이터입니다.',
  422: '입력 정보를 확인해주세요.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버에 문제가 발생했습니다.',
  502: '서버 연결에 실패했습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
  default: '알 수 없는 오류가 발생했습니다.',
};

// 글로벌 에러 핸들러
export const handleApiError = (error) => {
  let message = ERROR_MESSAGES.default;
  let status = 500;
  let code = 'UNKNOWN_ERROR';

  if (error.response) {
    // 서버 응답이 있는 경우
    status = error.response.status;
    message =
      error.response.data?.message ||
      ERROR_MESSAGES[status] ||
      ERROR_MESSAGES.default;
    code = error.response.data?.code || `HTTP_${status}`;
  } else if (error.request) {
    // 네트워크 에러
    message = '네트워크 연결을 확인해주세요.';
    code = 'NETWORK_ERROR';
  } else {
    // 기타 에러
    message = error.message || ERROR_MESSAGES.default;
  }

  const apiError = new ApiError(message, status, code);

  // 에러 로깅
  console.error('🔥 Global Error Handler:', {
    message: apiError.message,
    status: apiError.status,
    code: apiError.code,
    originalError: error,
  });

  // 글로벌 에러 이벤트 발생 (토스트 알림 등을 위해)
  window.dispatchEvent(
    new CustomEvent('globalError', {
      detail: apiError,
    })
  );

  return apiError;
};

// 성공 메시지 처리
export const handleSuccess = (message = '처리되었습니다.') => {
  window.dispatchEvent(
    new CustomEvent('globalSuccess', {
      detail: { message },
    })
  );
};
