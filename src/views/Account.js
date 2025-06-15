/* eslint-disable */
import React, { useState } from 'react';
import Button from '@enact/sandstone/Button';
import { InputField } from '@enact/sandstone/Input';
import BodyText from '@enact/sandstone/BodyText';
import $L from '@enact/i18n/$L';
import axios from 'axios'; // axios import
import './account.css';

const Account = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', description: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const handleInputChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true); // API 요청 전 로딩 시작
    const url = mode === 'login' ? 'http://15.165.123.189:8080/login' : 'http://15.165.123.189:8080/members/signup'; // API 엔드포인트

    const payload = {
      email: form.email,
      password: form.password,
    };

    if (mode === 'register') {
      payload.nickname = form.name;
      payload.description = form.description;
    }

    try {
      const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } }); // POST 요청
      if (response.data.isSuccess) {
        setMessage(mode === 'login' ? '로그인 성공' : `회원가입 성공: ${form.name}`);
        onLoginSuccess?.(); // 상위 컴포넌트에 로그인 성공 알림
        setForm({ name: '', email: '', password: '', description: '' });
      } else {
        setMessage(response.data.message || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error) {
      setMessage('서버와 연결할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setMessage('');
    setForm({ name: '', email: '', password: '', description: '' });
  };

  return (
    <div className="account-container">
      <h2 className="account-heading">
        {mode === 'login' ? $L('로그인') : $L('회원가입')}
      </h2>

      <div className="account-form">
        {mode === 'register' && (
          <>
            <InputField
              placeholder="이름"
              value={form.name}
              onChange={e => handleInputChange('name', e.value)}
            />
            <InputField
              placeholder="자기소개"
              value={form.description}
              onChange={e => handleInputChange('description', e.value)}
            />
          </>
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

        <Button onClick={handleSubmit} type="submit" disabled={isLoading}>
          {isLoading ? $L('로딩 중...') : mode === 'login' ? $L('로그인') : $L('회원가입')}
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
