// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,  // .env 에 설정해 두세요
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false                         // 쿠키 인증이 아닌 토큰 방식이므로 false
});

// 모든 요청에 자동으로 Authorization 헤더 추가
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
