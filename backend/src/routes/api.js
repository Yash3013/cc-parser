const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { parserController, healthController, banksController } = require('../controllers');

router.get('/health',healthController.check);
router.get('/banks',banksController.listBanks);
router.post('/parse',upload.single('statement'),parserController.parseSingle);
router.post('/parse-batch',upload.array('statements', 5),parserController.parseBatch);

module.exports = router;