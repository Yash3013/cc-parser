const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : (process.env.CORS_ORIGIN || 'http://localhost:3000'),
    credentials: true
  },
  upload: {
    maxFileSize: 10*1024*1024,
    allowedTypes: ['application/pdf'],
    maxFiles: 15
  },
  rateLimiting:{
    windowMs: 15*60*1000,
    max: 100
  }
};

module.exports = config;
