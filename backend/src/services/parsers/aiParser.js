const OpenAI = require('openai');
const fs = require('fs').promises;

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function parseWithAI(pdfPath){
  try{
    if (!openai) {
      return {
        cardholderName: null,
        cardLastFour: null,
        statementPeriod: null,
        totalAmountDue: null,
        paymentDueDate: null,
        previousBalance: null,
        creditLimit: null,
        rewardPoints: null,
        transactions: [],
        confidence: 0.5,
        method: 'AI-Skipped'
      };
    }
    const pdfBuffer = await fs.readFile(pdfPath);
    const base64Pdf = pdfBuffer.toString('base64');
    const prompt = 'Extract key fields from the provided credit card statement PDF and return strictly valid JSON.';
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });
    let content = response.choices[0].message.content.trim();
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const extractedData = JSON.parse(content);
    return {
      ...extractedData,
      confidence: 0.95,
      method: 'AI'
    };
  } catch(err){
    return {
      cardholderName: null,
      cardLastFour: null,
      statementPeriod: null,
      totalAmountDue: null,
      paymentDueDate: null,
      previousBalance: null,
      creditLimit: null,
      rewardPoints: null,
      transactions: [],
      confidence: 0.3,
      method: 'AI-Failed',
      error: err.message
    };
  }
}

module.exports = { parseWithAI };
