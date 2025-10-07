import { Check } from 'lucide-react';

const PasswordHints = ({ password, show }) => {
  if (!show || !password) return null;

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const hasMinLength = password.length >= 8;

  const hints = [
    { key: 'length', text: '최소 8자 이상', valid: hasMinLength },
    { key: 'letter', text: '영어를 포함해주세요', valid: hasLetter },
    { key: 'number', text: '숫자를 포함해주세요', valid: hasNumber },
    { key: 'special', text: '특수문자 포함해주세요', valid: hasSpecialChar },
  ];

  return (
    <div className="password-hints">
      <div className="password-hint-title">
        비밀번호의 조건은 다음과 같아요:
      </div>
      {hints.map((hint) => (
        <div
          key={hint.key}
          className={`password-hint ${hint.valid ? 'valid' : 'invalid'}`}
        >
          <Check size={20} />
          {hint.text}
        </div>
      ))}
    </div>
  );
};

export default PasswordHints;
