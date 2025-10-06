import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services/authService';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/Auth.css';

const Auth = () => {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [registerStep, setRegisterStep] = useState(1); // 1: 기본정보, 3: 완료
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  // 회원가입 핸들러
  const handleRegister = async (formData) => {
    setRegisterLoading(true);

    try {
      await authService.signup(formData);
      setRegisterStep(3);
    } finally {
      setRegisterLoading(false);
    }
  };

  // 로그인 핸들러
  const handleLogin = async (credentials) => {
    setLoginLoading(true);

    try {
      console.log('🔄 로그인 시도:', { email: credentials.email });

      const userData = await authService.login(credentials);

      console.log('✅ 로그인 성공:', userData);
      loginContext(userData); // AuthContext에 사용자 정보 저장
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      throw error; // LoginForm에서 처리
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2>로그인 또는 회원가입</h2>
        <div className="social-login-block">
          <button className="kakao-btn">카카오로 시작하기</button>
          <button className="google-btn">구글로 시작하기</button>
        </div>
        <div className="auth-tabs">
          <button
            className={tab === 'login' ? 'active' : ''}
            onClick={() => setTab('login')}
          >
            로그인
          </button>
          <button
            className={tab === 'register' ? 'active' : ''}
            onClick={() => setTab('register')}
          >
            회원가입
          </button>
        </div>
        <div className="auth-form-block">
          {tab === 'login' ? (
            <LoginForm onSubmit={handleLogin} loading={loginLoading} />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              loading={registerLoading}
              step={registerStep}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
