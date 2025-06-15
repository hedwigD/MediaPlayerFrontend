/* eslint-disable */
import React, { useState } from 'react';
import Button from '@enact/sandstone/Button';
import { InputField } from '@enact/sandstone/Input';
import BodyText from '@enact/sandstone/BodyText';
import $L from '@enact/i18n/$L';
import axios from 'axios';
import './account.css';

const Account = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', description: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // (선택) 이미지 입력 지원하려면 state 및 InputField/파일 추가 필요

  const handleInputChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const url = mode === 'login' ? '/login' : '/members/signup';

    if (mode === 'login') {
      // 로그인: application/json
      const payload = {
        email: form.email,
        password: form.password,
      };
      try {
        const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
        const token = response.headers['authorization']?.replace('Bearer ','') || response.headers['Authorization']?.replace('Bearer ','');
        if (response.status === 200 && token) {
          localStorage.setItem('accessToken', token);
          setMessage('로그인 성공');
          onLoginSuccess?.(token);
        } else {
          setMessage('로그인 실패: 토큰이 없습니다.');
        }
      } catch (error) {
        if (error.response) {
          setMessage(error.response.data?.message || '서버 오류');
        } else if (error.request) {
          setMessage('서버와 연결할 수 없습니다. 다시 시도해주세요.');
        } else {
          setMessage(`오류 발생: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 회원가입: multipart/form-data
    const formData = new FormData();
    formData.append(
      'request',
      JSON.stringify({
        email: form.email,
        password: form.password,
        nickname: form.name,
        description: form.description,
      })
    );
    // 'profileImage'는 실제 파일이 없어도 반드시 포함 (빈 Blob)
    formData.append('profileImage', new Blob([]), '');

    // 디버깅: 실제 들어가는 값 확인
    for (const pair of formData.entries()) {
      console.log('[회원가입 FormData]', pair[0], pair[1]);
    }

    try {
      const response = await axios.post(url, formData);
      if (response.data?.isSuccess) {
        setMessage('회원가입 성공');
        onLoginSuccess?.();
        setForm({ name: '', email: '', password: '', description: '' });
      } else {
        setMessage(response.data?.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data?.message || '서버 오류');
      } else if (error.request) {
        setMessage('서버와 연결할 수 없습니다. 다시 시도해주세요.');
      } else {
        setMessage(`오류 발생: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
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
