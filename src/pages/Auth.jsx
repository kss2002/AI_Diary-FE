import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/services/authService';
import '../styles/Auth.css';

const Auth = () => {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  // 입력값 상태
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [registerId, setRegisterId] = useState('');
  const [registerPw, setRegisterPw] = useState('');
  const [registerNickname, setRegisterNickname] = useState('');
  // 에러 메시지 상태
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerStep, setRegisterStep] = useState(1); // 1: 기본정보, 3: 완료
  const [registerLoading, setRegisterLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  const navigate = useNavigate();
  const { login: loginContext } = useAuth();

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password) => {
    if (!password.trim()) return '비밀번호를 입력하세요.';
    if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';

    // 영어(대소문자), 숫자, 특수문자 포함 여부 검사
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!hasLetter) return '비밀번호에 영어를 포함해주세요.';
    if (!hasNumber) return '비밀번호에 숫자를 포함해주세요.';
    if (!hasSpecialChar) return '비밀번호에 특수문자를 포함해주세요.';

    return '';
  };

  // 비밀번호 힌트 상태를 가져오는 함수
  const getPasswordHints = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    const hasMinLength = password.length >= 8;

    return {
      hasMinLength,
      hasLetter,
      hasNumber,
      hasSpecialChar,
    };
  };

  // 유효성 검사 함수
  const validateRegister = () => {
    if (!registerId.trim()) return '아이디(이메일)를 입력하세요.';

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerId)) return '올바른 이메일 형식을 입력하세요.';

    // 비밀번호 검사
    const passwordError = validatePassword(registerPw);
    if (passwordError) return passwordError;

    if (!registerNickname.trim()) return '닉네임을 입력하세요.';
    if (registerNickname.length < 2 || registerNickname.length > 8)
      return '닉네임은 2~8글자여야 합니다.';
    return '';
  };

  const validateLogin = () => {
    if (!loginId.trim()) return '아이디(이메일)를 입력하세요.';
    if (!loginPw.trim()) return '비밀번호를 입력하세요.';
    return '';
  };

  // 회원가입 - 새로운 API 사용
  const handleRegister = async (e) => {
    e.preventDefault();
    const err = validateRegister();
    setRegisterError(err);
    if (err) return;

    setRegisterLoading(true);
    setRegisterError('');

    try {
      await authService.signup({
        email: registerId,
        password: registerPw,
        nickName: registerNickname,
      });

      // 회원가입 성공 시 로그인 탭으로 자동 이동
      setRegisterStep(1); // 상태 초기화
      setTab('login'); // 로그인 탭으로 전환

      // 회원가입한 이메일을 로그인 필드에 자동 입력
      setLoginId(registerId);
      setLoginPw(''); // 보안상 비밀번호는 비워둠

      // 회원가입 필드들 초기화
      setRegisterId('');
      setRegisterPw('');
      setRegisterNickname('');
    } catch (error) {
      setRegisterError(error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // 로그인 - 새로운 API 사용
  const handleLogin = async (e) => {
    e.preventDefault();
    const err = validateLogin();
    setLoginError(err);
    if (err) return;

    setLoginLoading(true);
    setLoginError('');

    try {
      console.log('🔄 로그인 시도:', { email: loginId });

      const userData = await authService.login({
        email: loginId,
        password: loginPw,
      });

      console.log('✅ 로그인 성공:', userData);
      loginContext(userData); // AuthContext에 사용자 정보 저장
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ 로그인 실패:', error);

      // 더 구체적인 에러 메시지 표시
      let errorMessage = '로그인 중 오류가 발생했습니다.';

      if (error.status === 401) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.status === 400) {
        errorMessage = '입력 정보를 확인해주세요.';
      } else if (error.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setLoginError(errorMessage);
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
            <form className="auth-form" onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="아이디(이메일)"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoComplete="username"
                disabled={loginLoading}
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                autoComplete="current-password"
                disabled={loginLoading}
              />
              {loginError && <div className="auth-error">{loginError}</div>}
              <button type="submit" disabled={loginLoading}>
                {loginLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          ) : (
            <>
              {registerStep === 1 && (
                <form className="auth-form" onSubmit={handleRegister}>
                  <input
                    type="text"
                    placeholder="아이디(이메일)"
                    value={registerId}
                    onChange={(e) => setRegisterId(e.target.value)}
                    autoComplete="username"
                    disabled={registerLoading}
                  />
                  <input
                    type="password"
                    placeholder="비밀번호 (영어+숫자+특수문자, 8자 이상)"
                    value={registerPw}
                    onChange={(e) => setRegisterPw(e.target.value)}
                    onFocus={() => setShowPasswordHints(true)}
                    onBlur={() => setShowPasswordHints(false)}
                    autoComplete="new-password"
                    disabled={registerLoading}
                  />
                  {showPasswordHints && registerPw && (
                    <div className="password-hints">
                      <div className="password-hint-title">비밀번호 조건:</div>
                      <div
                        className={`password-hint ${
                          getPasswordHints(registerPw).hasMinLength
                            ? 'valid'
                            : 'invalid'
                        }`}
                      >
                        ✓ 최소 8자 이상
                      </div>
                      <div
                        className={`password-hint ${
                          getPasswordHints(registerPw).hasLetter
                            ? 'valid'
                            : 'invalid'
                        }`}
                      >
                        ✓ 영어 포함
                      </div>
                      <div
                        className={`password-hint ${
                          getPasswordHints(registerPw).hasNumber
                            ? 'valid'
                            : 'invalid'
                        }`}
                      >
                        ✓ 숫자 포함
                      </div>
                      <div
                        className={`password-hint ${
                          getPasswordHints(registerPw).hasSpecialChar
                            ? 'valid'
                            : 'invalid'
                        }`}
                      >
                        ✓ 특수문자 포함
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="닉네임 (2~8글자)"
                    value={registerNickname}
                    onChange={(e) => setRegisterNickname(e.target.value)}
                    autoComplete="nickname"
                    disabled={registerLoading}
                  />
                  {registerError && (
                    <div className="auth-error">{registerError}</div>
                  )}
                  <button type="submit" disabled={registerLoading}>
                    {registerLoading ? '처리 중...' : '회원가입'}
                  </button>
                </form>
              )}

              {registerStep === 3 && (
                <div className="auth-success">
                  회원가입이 완료되었습니다! 로그인 후 이용해 주세요.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
