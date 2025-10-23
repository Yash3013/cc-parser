function extractAxisName(text){
  const patterns = [
    /Primary\s+Card\s+Member[\s:]+([A-Z][A-Z\s]+?)(?:\n|Card)/i,
    /Name[\s:]+([A-Z\s]{3,50})/i,
    /Dear\s+([A-Z\s]+)/i
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return match[1].trim().substring(0, 50);
  }
  return null;
}

function extractAxisCard(text){
  const patterns = [
    /Card\s*Number[\s:]+\*+(\d{4})/i,
    /ending\s+with\s+(\d{4})/i,
    /XXXX\s*XXXX\s*XXXX\s*(\d{4})/i
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractAxisPeriod(text){
  const pattern = /Statement\s+Date[\s:]+(\d{2}\s+\w+\s+\d{4})\s+to\s+(\d{2}\s+\w+\s+\d{4})/i;
  const match = text.match(pattern);
  return match ? `${match[1]} - ${match[2]}` : null;
}

function extractAxisAmount(text){
  const patterns = [
    /Total\s*Amount\s*Due[\s:]+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/i,
    /Minimum\s*Amount\s*Due[\s:]+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/i
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return `₹${match[1].replace(/,/g, '')}`;
  }
  return null;
}

function extractAxisDate(text){
  const pattern = /Due\s*Date[\s:]+(\d{2}\s+\w+\s+\d{4})/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function extractAxisPrevious(text){
  const pattern = /Previous\s*Outstanding[\s:]+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/i;
  const match = text.match(pattern);
  return match ? `₹${match[1].replace(/,/g, '')}` : null;
}

function extractAxisLimit(text){
  const pattern = /Credit\s*Limit[\s:]+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/i;
  const match = text.match(pattern);
  return match ? `₹${match[1].replace(/,/g, '')}` : null;
}

function extractAxisPoints(text){
  const pattern = /(?:EDGE\s*)?Reward\s*Points[\s:]+(\d{1,10})/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function extractAxisTransactions(text){
  const transactions = [];
  const pattern = /(\d{2}\/\d{2}\/\d{4})\s+(.{10,60}?)\s+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/g;
  let match;
  while ((match = pattern.exec(text)) !== null && transactions.length < 15){
    transactions.push({
      date: match[1],
      description: match[2].trim().substring(0, 50),
      amount: `₹${match[3].replace(/,/g, '')}`
    });
  }
  return transactions;
}

const axisParse = (text) => {
  return {
    cardholderName: extractAxisName(text),
    cardLastFour: extractAxisCard(text),
    statementPeriod: extractAxisPeriod(text),
    totalAmountDue: extractAxisAmount(text),
    paymentDueDate: extractAxisDate(text),
    previousBalance: extractAxisPrevious(text),
    creditLimit: extractAxisLimit(text),
    rewardPoints: extractAxisPoints(text),
    transactions: extractAxisTransactions(text),
    confidence: 0.84
  };
};

module.exports = { parse: axisParse };