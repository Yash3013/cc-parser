const hdfcParser = require('./hdfc');
const iciciParser = require('./icici');
const sbiParser = require('./sbi');
const axisParser = require('./axis');
const amexParser = require('./amex');
const { parseWithAI } = require('./aiParser');

const BANK_PATTERNS = {
  'HDFC': /HDFC\s*BANK|hdfc/i,
  'ICICI': /ICICI\s*BANK|icici/i,
  'SBI': /SBI\s*CARD|STATE\s*BANK\s*OF\s*INDIA/i,
  'AXIS': /AXIS\s*BANK|axis/i,
  'AMEX': /AMERICAN\s*EXPRESS|amex/i
};

function detectBank(text){
  for (const [bank, pattern] of Object.entries(BANK_PATTERNS)) {
    if (pattern.test(text)) {
      return bank;
    }
  }
  return 'UNKNOWN';
}

async function parseStatement(text, bank, pdfPath) {
  let parsedData = {};
  let useAI = false;
  try{
    switch(bank){
      case 'HDFC':
        parsedData = hdfcParser.parse(text);
        break;
      case 'ICICI':
        parsedData = iciciParser.parse(text);
        break;
      case 'SBI':
        parsedData = sbiParser.parse(text);
        break;
      case 'AXIS':
        parsedData = axisParser.parse(text);
        break;
      case 'AMEX':
        parsedData = amexParser.parse(text);
        break;
      default:
        useAI = true;
    }
    const requiredFields = ['cardholderName','cardLastFour','statementPeriod','totalAmountDue','paymentDueDate'];
    const extractedFields = requiredFields.filter(field => parsedData[field]);
    const completeness = extractedFields.length / requiredFields.length;
    
    if (useAI || completeness < 0.6 || (parsedData.confidence && parsedData.confidence < 0.7)){
      console.log('Using AI fallback for better accuracy');
      const aiData = await parseWithAI(pdfPath);
      parsedData = mergeParserResults(parsedData, aiData);
      parsedData.confidence = 0.95;
      parsedData.method = 'AI-Enhanced';
    } else{
      parsedData.confidence = Math.max(parsedData.confidence || 0.8, completeness);
      parsedData.method = 'Rule-Based';
    }
    
  } catch(err){
    console.error('Parser error, falling back to AI:',err.message);
    parsedData = await parseWithAI(pdfPath);
    parsedData.method = 'AI-Only';
  }
  return parsedData;
}

function mergeParserResults(ruleBasedData,aiData){
  return {
    ...aiData,
    ...Object.fromEntries(
      Object.entries(ruleBasedData).filter(([_, v]) => v != null && v !== '')
    ),
    confidence: 0.95
  };
}

module.exports = { detectBank, parseStatement };