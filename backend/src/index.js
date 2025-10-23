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

app.listen(config.port, () => {
  console.log(`✅ Server running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});