const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    [
      '/api/auth',
      '/api/users',
      '/api/accounts',
      '/api/transactions',
      '/api/trades',
      '/api/market-data',
      '/api/alerts',
      '/api/payments',
      '/api/admin'
    ],
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  );

  app.use(
    '/market-data',
    createProxyMiddleware({
      target: 'ws://localhost:8080',
      ws: true,
      changeOrigin: true,
    })
  );
}; 