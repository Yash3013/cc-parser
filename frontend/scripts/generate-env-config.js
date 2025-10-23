const fs = require('fs');
const path = require('path');
const defaultConfig = {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  REACT_APP_MAX_FILE_SIZE: process.env.REACT_APP_MAX_FILE_SIZE || '10485760', // 10MB
  REACT_APP_MAX_FILES: process.env.REACT_APP_MAX_FILES || '15'
};

const envConfigContent = `window._env_ = ${JSON.stringify(defaultConfig, null, 2)};`;

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(
  path.resolve(publicDir, 'env-config.js'),
  envConfigContent,
  { encoding: 'utf-8' }
);

console.log('✅ Environment configuration generated successfully');