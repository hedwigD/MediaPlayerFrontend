// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/members', '/login'],
    createProxyMiddleware({
      target: 'http://15.165.123.189:8080',  // 백엔드 서버 주소
      changeOrigin: true,
      secure: false, // HTTPS가 아니라면 false로 설정
    })
  );
};
