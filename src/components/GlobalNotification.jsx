import { useState, useEffect } from 'react';

// 글로벌 알림 컴포넌트
export const GlobalNotification = () => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // 에러 이벤트 리스너
    const handleGlobalError = (event) => {
      setNotification({
        type: 'error',
        message: event.detail.message,
        id: Date.now(),
      });
    };

    // 성공 이벤트 리스너
    const handleGlobalSuccess = (event) => {
      setNotification({
        type: 'success',
        message: event.detail.message,
        id: Date.now(),
      });
    };

    window.addEventListener('globalError', handleGlobalError);
    window.addEventListener('globalSuccess', handleGlobalSuccess);

    return () => {
      window.removeEventListener('globalError', handleGlobalError);
      window.removeEventListener('globalSuccess', handleGlobalSuccess);
    };
  }, []);

  // 알림 자동 제거
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification) return null;

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-content">
        <span className="notification-message">{notification.message}</span>
        <button
          className="notification-close"
          onClick={() => setNotification(null)}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default GlobalNotification;
