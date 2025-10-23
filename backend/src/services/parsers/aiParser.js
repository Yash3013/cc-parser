const OpenAI = require('openai');
const fs = require('fs').promises;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function parseWithAI(pdfPath){
  try{
    console.log('🤖 Using AI to parse PDF...');
    const pdfBuffer = await fs.readFile(pdfPath);
    const base64Pdf = pdfBuffer.toString('base64');
    const prompt = `You are an expert at extracting data from credit card statements. Extract the following information from this PDF:

REQUIRED FIELDS:
1. cardholderName - Full name of the cardholder
2. cardLastFour - Last 4 digits of card number
3. statementPeriod - Date range (format: DD MMM YYYY - DD MMM YYYY)
4. totalAmountDue - Total amount to be paid
5. paymentDueDate - Due date for payment
OPTIONAL FIELDS:
6. previousBalance - Previous outstanding balance
7. creditLimit - Total credit limit
8. rewardPoints - Reward/cashback points
9. transactions - Array of up to 10 transactions with: date, description, amount
Return ONLY valid JSON with this exact structure:
{
  "cardholderName": "JOHN DOE",
  "cardLastFour": "1234",
  "statementPeriod": "01 Sep 2024 - 30 Sep 2024",
  "totalAmountDue": "₹45678.90",
  "paymentDueDate": "20 Oct 2024",
  "previousBalance": "₹32000",
  "creditLimit": "₹200000",
  "rewardPoints": "3456",
  "transactions": [
    {"date": "05 Sep", "description": "Amazon.in", "amount": "₹2499"}
  ]
}
IMPORTANT: 
- Always include ₹ symbol for amounts
- If a field is not found, use null
- Be precise and accurate`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.1
    });
    
    let content = response.choices[0].message.content.trim();
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const extractedData = JSON.parse(content);
    console.log('✅ AI extraction successful');
    return { 
      ...extractedData, 
      confidence: 0.95,
      method: 'AI'
    };
  } catch(err){
    console.error('❌ AI parsing error:',err.message);
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
      error: error.message
    };
  }
}

module.exports = { parseWithAI };