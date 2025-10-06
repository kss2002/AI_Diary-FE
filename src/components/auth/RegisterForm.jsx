import { useState } from 'react';
import PasswordInput from './PasswordInput';
import PasswordHints from './PasswordHints';

const RegisterForm = ({ onSubmit, loading = false, step = 1 }) => {
  const [registerId, setRegisterId] = useState('');
  const [registerPw, setRegisterPw] = useState('');
  const [registerNickname, setRegisterNickname] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  // 비밀번호 유효성 검사 함수
  const validatePassword = (password) => {
    if (!password.trim()) return '비밀번호를 입력하세요.';
    if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!hasLetter) return '비밀번호에 영어를 포함해주세요.';
    if (!hasNumber) return '비밀번호에 숫자를 포함해주세요.';
    if (!hasSpecialChar) return '비밀번호에 특수문자를 포함해주세요.';

    return '';
  };

  // 유효성 검사 함수
  const validateRegister = () => {
    if (!registerId.trim()) return '아이디(이메일)를 입력하세요.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerId)) return '올바른 이메일 형식을 입력하세요.';

    const passwordError = validatePassword(registerPw);
    if (passwordError) return passwordError;

    if (!registerNickname.trim()) return '닉네임을 입력하세요.';
    if (registerNickname.length < 2 || registerNickname.length > 8)
      return '닉네임은 2~8글자여야 합니다.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateRegister();
    setRegisterError(err);
    if (err) return;

    try {
      await onSubmit({
        email: registerId,
        password: registerPw,
        nickName: registerNickname,
      });
    } catch (error) {
      setRegisterError(error.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  // 외부에서 폼 초기화를 위한 함수
  const clearForm = () => {
    setRegisterId('');
    setRegisterPw('');
    setRegisterNickname('');
    setRegisterError('');
  };

  // 외부에서 이메일 값을 가져오기 위한 함수
  const getEmail = () => registerId;

  // 부모 컴포넌트에서 사용할 수 있도록 노출
  RegisterForm.clearForm = clearForm;
  RegisterForm.getEmail = getEmail;

  if (step === 3) {
    return (
      <div className="auth-success">
        회원가입이 완료되었습니다! 로그인 후 이용해 주세요.
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="아이디(이메일)"
        value={registerId}
        onChange={(e) => setRegisterId(e.target.value)}
        autoComplete="username"
        disabled={loading}
      />
      <PasswordInput
        value={registerPw}
        onChange={(e) => setRegisterPw(e.target.value)}
        placeholder="비밀번호 (영어+숫자+특수문자, 8자 이상)"
        disabled={loading}
        autoComplete="new-password"
        onFocus={() => setShowPasswordHints(true)}
        onBlur={() => setShowPasswordHints(false)}
      />
      <PasswordHints password={registerPw} show={showPasswordHints} />
      <input
        type="text"
        placeholder="닉네임 (2~8글자)"
        value={registerNickname}
        onChange={(e) => setRegisterNickname(e.target.value)}
        autoComplete="nickname"
        disabled={loading}
      />
      {registerError && <div className="auth-error">{registerError}</div>}
      <button className="auth-form-btn" type="submit" disabled={loading}>
        {loading ? '처리 중...' : '회원가입'}
      </button>
    </form>
  );
};

export default RegisterForm;
