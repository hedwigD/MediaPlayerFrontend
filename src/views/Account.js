/* eslint-disable */
import React, { useState } from 'react';
import Button from '@enact/sandstone/Button';
import { InputField } from '@enact/sandstone/Input';
import BodyText from '@enact/sandstone/BodyText';
import $L from '@enact/i18n/$L';
import './account.css';

const Account = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleInputChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // 🚫 실제 API는 아직 없으므로, 여기선 조건만으로 처리
    if (mode === 'login') {
      if (form.email && form.password) {
        setMessage('로그인 성공');
        onLoginSuccess?.(); // ✅ 상위에 로그인 성공 알림
      } else {
        setMessage('이메일과 비밀번호를 입력하세요');
      }
    } else {
      if (form.name && form.email && form.password) {
        setMessage(`회원가입 성공: ${form.name}`);
        setForm({ name: '', email: '', password: '' });
      } else {
        setMessage('모든 항목을 입력하세요');
      }
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setMessage('');
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="account-container">
      <h2 className="account-heading">
        {mode === 'login' ? $L('로그인') : $L('회원가입')}
      </h2>

      <div className="account-form">
        {mode === 'register' && (
          <InputField
            placeholder="이름"
            value={form.name}
            onChange={e => handleInputChange('name', e.value)}
          />
        )}

        <InputField
          placeholder="이메일"
          value={form.email}
          type="email"
          onChange={e => handleInputChange('email', e.value)}
        />

        <InputField
          placeholder="비밀번호"
          value={form.password}
          type="password"
          onChange={e => handleInputChange('password', e.value)}
        />

        <Button onClick={handleSubmit} type="submit">
          {mode === 'login' ? $L('로그인') : $L('회원가입')}
        </Button>
      </div>

      <BodyText className="account-msg">{message}</BodyText>

      <Button onClick={toggleMode} size="small">
        {mode === 'login'
          ? $L('계정이 없으신가요? 회원가입')
          : $L('계정이 있으신가요? 로그인')}
      </Button>
    </div>
  );
};

export default Account;
