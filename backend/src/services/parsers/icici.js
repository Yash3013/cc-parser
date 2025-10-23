function extractCardholderName(text){
  const patterns = [
    /(?:Name|Card\s*Member)[\s:]+([A-Z][A-Z\s]+?)(?:\n|Card|ICICI)/i,
    /Dear\s+([A-Z\s]{3,50})/i,
    /Member\s+Name[\s:]+([A-Z\s]+)/i
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return match[1].trim().substring(0, 50);
  }
  return null;
}

function extractCardNumber(text){
  const patterns = [
    /Card\s*Number[\s:]+.*?(\d{4})/i,
    /ending\s+(?:with\s+)?(\d{4})/i,
    /XXXX\s*XXXX\s*XXXX\s*(\d{4})/i,
    /\*{12}(\d{4})/
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractStatementPeriod(text){
  const patterns = [
    /Statement\s+Period[\s:]+(\d{2}[-\/]\d{2}[-\/]\d{4})\s+to\s+(\d{2}[-\/]\d{2}[-\/]\d{4})/i,
    /Billing\s+Period[\s:]+(\d{2}\s+\w+\s+\d{4})\s+to\s+(\d{2}\s+\w+\s+\d{4})/i,
    /from\s+(\d{2}[-\/]\w{3}[-\/]\d{4})\s+to\s+(\d{2}[-\/]\w{3}[-\/]\d{4})/i
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return `${match[1]} - ${match[2]}`;
  }
  return null;
}

function extractTotalDue(text){
  const patterns = [
    /Total\s*Amount\s*Due[\s:]+(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)/i,
    /Payment\s*Due[\s:]+(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)/i,
    /Amount\s*Payable[\s:]+(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)/i
  ];
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return `₹${match[1].replace(/,/g, '')}`;
  }
  return null;
}

function extractDueDate(text){
  const patterns = [
    /Payment\s*Due\s*Date[\s:]+(\d{2}[-\/]\d{2}[-\/]\d{4})/i,
    /Due\s*Date[\s:]+(\d{2}\s+\w+\s+\d{4})/i,
    /Pay\s*by[\s:]+(\d{2}[-\/]\w{3}[-\/]\d{4})/i
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractPreviousBalance(text){
  const pattern = /(?:Previous|Opening|Last\s+Month)\s*Balance[\s:]+(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)/i;
  const match = text.match(pattern);
  return match ? `₹${match[1].replace(/,/g, '')}` : null;
}

function extractCreditLimit(text){
  const pattern = /(?:Credit\s*Limit|Total\s*Credit\s*Limit)[\s:]+(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)/i;
  const match = text.match(pattern);
  return match ? `₹${match[1].replace(/,/g, '')}` : null;
}

function extractRewardPoints(text){
  const pattern = /(?:Reward|PAYBACK|Points?)[\s:]+(\d{1,10})/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function extractTransactions(text){
  const transactions = [];
  const patterns = [
    /(\d{2}[-\/]\d{2}[-\/]\d{4})\s+(.{10,60}?)\s+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/g,
    /(\d{2}\s\w{3})\s+(.{10,60}?)\s+(?:Rs\.?|₹)?\s*([\d,]+\.?\d*)/g
  ];
  
  for(const pattern of patterns){
    let match;
    while ((match = pattern.exec(text)) !== null && transactions.length < 15) {
      transactions.push({
        date: match[1],
        description: match[2].trim().substring(0, 50),
        amount: `₹${match[3].replace(/,/g, '')}`
      });
    }
    if (transactions.length > 0) break;
  }
  return transactions;
}

function parse(text){
  return {
    cardholderName: extractCardholderName(text),
    cardLastFour: extractCardNumber(text),
    statementPeriod: extractStatementPeriod(text),
    totalAmountDue: extractTotalDue(text),
    paymentDueDate: extractDueDate(text),
    previousBalance: extractPreviousBalance(text),
    creditLimit: extractCreditLimit(text),
    rewardPoints: extractRewardPoints(text),
    transactions: extractTransactions(text),
    confidence: 0.83
  };
}

module.exports = { parse };