const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('../config');

const setupMiddleware = (app) => {
  app.use(helmet());
  app.use(rateLimit(config.rateLimiting));
  if(config.nodeEnv !== 'test'){
    app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
  }
  app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      ...(config.nodeEnv === 'development' && { stack: err.stack })
    });
  });
};

module.exports = setupMiddleware;