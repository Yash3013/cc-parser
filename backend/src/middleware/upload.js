const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

const storage = multer.diskStorage({
  destination: async (req,file,cb) => {
    const dir = path.join(process.cwd(),'uploads');
    await fs.mkdir(dir,{recursive: true});
    cb(null,dir);
  },
  filename: (req,file,cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req,file,cb) => {
  if(file.mimetype === 'application/pdf'){
    cb(null, true);
  } else{
    cb(new Error('Only PDF files are allowed'),false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter
});

module.exports = { upload };