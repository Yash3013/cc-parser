const { extractTextFromPDF } = require('../services/pdfExtractor');
const { detectBank, parseStatement } = require('../services/parsers/mainParser');
const { validateExtractedData } = require('../services/validator');
const { categorizeTransactions } = require('../services/categorizer');
const { generateAnalytics } = require('../services/analytics');
const fs = require('fs').promises;

const parseSingle = async (req, res) => {
  const startTime = Date.now();
  const TIMEOUT = 50000; // 50 seconds (to stay within Vercel's 60s limit)

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Set up timeout
    const timeout = setTimeout(() => {
      throw new Error('Processing timeout exceeded');
    }, TIMEOUT);

    console.log(`Processing: ${req.file.originalname}`);
    
    // Extract text with timeout check
    const pdfText = await extractTextFromPDF(req.file.path);
    if (!pdfText) {
      throw new Error('Failed to extract text from PDF');
    }

    // Detect bank with timeout check
    const bank = detectBank(pdfText);
    console.log(`Detected bank: ${bank}`);
    if (!bank) {
      throw new Error('Unable to detect bank from statement');
    }

    // Parse statement with timeout check
    const parsedData = await parseStatement(pdfText, bank, req.file.path);
    if (!parsedData) {
      throw new Error('Failed to parse statement data');
    }

    // Process transactions if available
    if (parsedData.transactions && parsedData.transactions.length > 0) {
      parsedData.transactions = categorizeTransactions(parsedData.transactions);
    }

    // Generate analytics and validate
    const analytics = generateAnalytics(parsedData);
    const validation = validateExtractedData(parsedData);

    // Clear timeout as processing is complete
    clearTimeout(timeout);

    // Cleanup file
    await fs.unlink(req.file.path).catch(err => console.error('Cleanup error:', err));

    // Calculate processing time
    const processingTime = Date.now() - startTime;
    console.log(`Processing completed in ${processingTime}ms`);

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
    console.error('Parsing error:', err);
    
    // Cleanup file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    // Send appropriate error response
    const statusCode = err.message.includes('timeout') ? 504 : 500;
    res.status(statusCode).json({
      error: 'Failed to parse statement',
      details: err.message,
      bank: 'unknown',
      timestamp: new Date().toISOString()
    });
  }
};

const parseBatch = async (req,res) => {
  try{
    if(!req.files || req.files.length === 0){
      return res.status(400).json({ error: 'No files uploaded' });
    }
    console.log(`Batch processing ${req.files.length} files`);
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
            error: error.message
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
    console.error('Batch processing error:', err);
    if(req.files){
      await Promise.all(
        req.files.map(file => fs.unlink(file.path).catch(() => {}))
      );
    }
    res.status(500).json({ 
      error: 'Batch processing failed', 
      details: err.message 
    });
  }
};

module.exports = {parseSingle,parseBatch};