const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

async function extractTextFromPDF(pdfPath){
  try{
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer,{
      max: 0, 
      version: 'v2.0.550'
    });
    console.log(`📄 Extracted ${data.numpages} pages, ${data.text.length} characters`);
    return data.text;
  } catch(err){
    console.error('PDF extraction error:', err);
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
}

async function extractMetadata(pdfPath){
  try{
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);
    return{
      pages: data.numpages,
      info: data.info,
      metadata: data.metadata
    };
  } catch(err){
    return null;
  }
}

module.exports = { extractTextFromPDF, extractMetadata };