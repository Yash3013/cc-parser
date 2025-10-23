const express = require('express');
const cors = require('cors');
require('dotenv').config();

const config = require('./config');
const setupMiddleware = require('./middleware');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors(config.cors));
app.use(express.json());
app.use(express.static('public'));

setupMiddleware(app);

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'Credit Card Statement Parser API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      banks: '/api/banks',
      parse: '/api/parse',
      batchParse: '/api/parse-batch'
    },
    documentation: 'https://github.com/Yash3013/cc-parser'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
    availableEndpoints: [
      '/api/health',
      '/api/banks',
      '/api/parse',
      '/api/parse-batch'
    ]
  });
});

app.listen(config.port, () => {
  console.log(`✅ Server running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});