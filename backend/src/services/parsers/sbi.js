function extractSBIName(text){
  const patterns = [
    /Card\s*holder[\s:]+([A-Z][A-Z\s]+?)(?:\n|Card|SBI)/i,
    /Name[\s:]+([A-Z\s]{3,50})/i,
    /Dear\s+([A-Z\s]+),/i
  ];
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return match[1].trim().substring(0, 50);
  }
  return null;
}

function extractSBICardNumber(text){
  const patterns = [
    /Card\s*No[\s:.]+.*?(\d{4})/i,
    /XXXX\s*(\d{4})/i,
    /ending\s+(\d{4})/i
  ];
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractSBIPeriod(text){
  const patterns = [
    /Statement\s+from[\s:]+(\d{2}\s+\w+\s+\d{4})\s+to\s+(\d{2}\s+\w+\s+\d{4})/i,
    /Billing\s+Cycle[\s:]+(\d{2}[-\/]\d{2}[-\/]\d{4})\s*-\s*(\d{2}[-\/]\d{2}[-\/]\d{4})/i
  ];
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return `${match[1]} - ${match[2]}`;
  }
  return null;
}

function extractSBITotal(text){
  const patterns = [
    /Total\s*Amount\s*Due[\s:]+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/i,
    /Amount\s*Due[\s:]+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/i
  ];
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return `₹${match[1].replace(/,/g, '')}`;
  }
  return null;
}

function extractSBIDueDate(text){
  const pattern = /Payment\s*Due\s*Date[\s:]+(\d{2}[-\/]\w+[-\/]\d{4})/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function extractSBIPrevious(text){
  const pattern = /Previous\s*Balance[\s:]+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/i;
  const match = text.match(pattern);
  return match ? `₹${match[1].replace(/,/g, '')}` : null;
}

function extractSBILimit(text){
  const pattern = /Credit\s*Limit[\s:]+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/i;
  const match = text.match(pattern);
  return match ? `₹${match[1].replace(/,/g, '')}` : null;
}

function extractSBIPoints(text){
  const pattern = /(?:Reward|SimplyCLICK)\s*Points[\s:]+(\d{1,10})/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function extractSBITransactions(text){
  const transactions = [];
  const pattern = /(\d{2}[-\/]\d{2})\s+(.{10,60}?)\s+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/g;
  let match;
  while((match = pattern.exec(text)) !== null && transactions.length < 15){
    transactions.push({
      date: match[1],
      description: match[2].trim().substring(0, 50),
      amount: `₹${match[3].replace(/,/g, '')}`
    });
  }
  return transactions;
}

const sbiParse = (text) => {
  return{
    cardholderName: extractSBIName(text),
    cardLastFour: extractSBICardNumber(text),
    statementPeriod: extractSBIPeriod(text),
    totalAmountDue: extractSBITotal(text),
    paymentDueDate: extractSBIDueDate(text),
    previousBalance: extractSBIPrevious(text),
    creditLimit: extractSBILimit(text),
    rewardPoints: extractSBIPoints(text),
    transactions: extractSBITransactions(text),
    confidence: 0.82
  };
};

module.exports = { parse: sbiParse };