const { extractTextFromPDF } = require('../services/pdfExtractor');
const { detectBank, parseStatement } = require('../services/parsers/mainParser');
const { validateExtractedData } = require('../services/validator');
const { categorizeTransactions } = require('../services/categorizer');
const { generateAnalytics } = require('../services/analytics');
const fs = require('fs').promises;

const parseSingle = async (req,res) => {
  try{
    if(!req.file){
      return res.status(400).json({error: 'No file uploaded'});
    }
    console.log(`Processing: ${req.file.originalname}`);
    const pdfText = await extractTextFromPDF(req.file.path);
    const bank = detectBank(pdfText);
    console.log(`Detected bank: ${bank}`);
    const parsedData = await parseStatement(pdfText,bank,req.file.path);
    if(parsedData.transactions && parsedData.transactions.length > 0){
      parsedData.transactions = categorizeTransactions(parsedData.transactions);
    }
    
    const analytics = generateAnalytics(parsedData);
    const validation = validateExtractedData(parsedData); 
    await fs.unlink(req.file.path).catch(err => console.error('Cleanup error:',err));
    res.json({
      success: true,
      bank,
      data: parsedData,
      analytics,
      validation,
      confidence: parsedData.confidence || 0.85,
      timestamp: new Date().toISOString()
    });
  } catch(err){
    console.error('Parsing error:',err);
    if(req.file){
      await fs.unlink(req.file.path).catch(() => {});
    } 
    res.status(500).json({ 
      error: 'Failed to parse statement', 
      details: error.message,
      bank: 'unknown'
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