import { useState } from 'react';
import PasswordInput from './PasswordInput';

const LoginForm = ({ onSubmit, loading = false }) => {
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginError, setLoginError] = useState('');

  const validateLogin = () => {
    if (!loginId.trim()) return '아이디(이메일)를 입력하세요.';
    if (!loginPw.trim()) return '비밀번호를 입력하세요.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateLogin();
    setLoginError(err);
    if (err) return;

    try {
      await onSubmit({ email: loginId, password: loginPw });
    } catch (error) {
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
    }
  };

  // 외부에서 이메일 자동 입력을 위한 함수
  const setEmail = (email) => setLoginId(email);
  const clearForm = () => {
    setLoginId('');
    setLoginPw('');
    setLoginError('');
  };

  // 부모 컴포넌트에서 사용할 수 있도록 노출
  LoginForm.setEmail = setEmail;
  LoginForm.clearForm = clearForm;

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="아이디(이메일)"
        value={loginId}
        onChange={(e) => setLoginId(e.target.value)}
        autoComplete="username"
        disabled={loading}
      />
      <PasswordInput
        value={loginPw}
        onChange={(e) => setLoginPw(e.target.value)}
        placeholder="비밀번호"
        disabled={loading}
        autoComplete="current-password"
      />
      {loginError && <div className="auth-error">{loginError}</div>}
      <button className="auth-form-btn" type="submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
};

export default LoginForm;
