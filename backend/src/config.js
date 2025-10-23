const path = require('path');

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.replace(/\/$/, '')) : 
      ['http://localhost:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  upload: {
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
      files: parseInt(process.env.MAX_FILES, 10) || 15
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'), false);
      }
    },
    dest: path.join(__dirname, '../uploads')
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-1106-preview'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW,10) || 900000, //15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX,10) || 100 
  }
};