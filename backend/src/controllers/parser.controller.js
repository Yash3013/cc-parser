const { extractTextFromPDF } = require('../services/pdfExtractor');
const { detectBank, parseStatement } = require('../services/parsers/mainParser');
const { validateExtractedData } = require('../services/validator');
const { categorizeTransactions } = require('../services/categorizer');
const { generateAnalytics } = require('../services/analytics');
const fs = require('fs').promises;

const parseSingle = async (req, res) => {
  const startTime = Date.now();
  const TIMEOUT = 50000;
  let timedOut = false;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded', message: 'No file uploaded' });
    }

    const timeout = setTimeout(() => {
      timedOut = true;
    }, TIMEOUT);

    const pdfText = await extractTextFromPDF(req.file.path);
    if (timedOut) throw new Error('Processing timeout exceeded');
    if (!pdfText) {
      throw new Error('Failed to extract text from PDF');
    }

    const bank = detectBank(pdfText);
    if (timedOut) throw new Error('Processing timeout exceeded');
    if (!bank) {
      throw new Error('Unable to detect bank from statement');
    }

    const parsedData = await parseStatement(pdfText, bank, req.file.path);
    if (timedOut) throw new Error('Processing timeout exceeded');
    if (!parsedData) {
      throw new Error('Failed to parse statement data');
    }

    if (parsedData.transactions && parsedData.transactions.length > 0) {
      parsedData.transactions = categorizeTransactions(parsedData.transactions);
    }

    const analytics = generateAnalytics(parsedData);
    const validation = validateExtractedData(parsedData);

    clearTimeout(timeout);

    await fs.unlink(req.file.path).catch(() => {});

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      bank,
      data: parsedData,
      analytics,
      validation,
      confidence: parsedData.confidence || 0.85,
      timestamp: new Date().toISOString(),
      processingTime
    });
  } catch (err) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    const statusCode = err.message.includes('timeout') ? 504 : 500;
    res.status(statusCode).json({
      error: 'Failed to parse statement',
      message: err.message,
      details: err.message,
      bank: 'unknown',
      timestamp: new Date().toISOString()
    });
  }
};

const parseBatch = async (req,res) => {
  try{
    if(!req.files || req.files.length === 0){
      return res.status(400).json({ error: 'No files uploaded', message: 'No files uploaded' });
    }
    const results = await Promise.all(
      req.files.map(async (file) => {
        try{
          const pdfText = await extractTextFromPDF(file.path);
          const bank = detectBank(pdfText);
          const parsedData = await parseStatement(pdfText,bank,file.path);
          if(parsedData.transactions){
            parsedData.transactions = categorizeTransactions(parsedData.transactions);
          }
          const analytics = generateAnalytics(parsedData);
          await fs.unlink(file.path).catch(() => {});
          return {
            filename: file.originalname,
            bank,
            data: parsedData,
            analytics,
            success: true
          };
        } catch(err){
          await fs.unlink(file.path).catch(() => {});
          return {
            filename: file.originalname,
            success: false,
            error: err.message,
            message: err.message
          };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    res.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful,
        failed
      }
    });
  } catch(err){
    if(req.files){
      await Promise.all(
        req.files.map(file => fs.unlink(file.path).catch(() => {}))
      );
    }
    res.status(500).json({
      error: 'Batch processing failed',
      message: err.message,
      details: err.message
    });
  }
};

module.exports = {parseSingle,parseBatch};
