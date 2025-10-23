

function extractAmexName(text){
  const patterns = [
    /Card\s*Member[\s:]+([A-Z][A-Z\s]+?)(?:\n|Account)/i,
    /Name[\s:]+([A-Z\s]{3,50})/i,
    /([A-Z\s]{5,50})\s+American\s+Express/i
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if (match) return match[1].trim().substring(0, 50);
  }
  return null;
}

function extractAmexCard(text){
  const patterns = [
    /Card\s*ending\s+in[\s:]+(\d{4})/i,
    /Account\s*ending\s+(\d{4})/i,
    /\*+(\d{5})/i  
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if(match) return match[1].slice(-4); 
  }
  return null;
}

function extractAmexPeriod(text){
  const patterns = [
    /Statement\s+Closing\s+Date[\s:]+(\w+\s+\d{1,2},\s+\d{4})/i,
    /Billing\s+Period[\s:]+(\d{2}\/\d{2}\/\d{4})\s+to\s+(\d{2}\/\d{2}\/\d{4})/i
  ];
  const match = text.match(patterns[0]);
  if(match) return match[1];
  const match2 = text.match(patterns[1]);
  if(match2) return `${match2[1]} - ${match2[2]}`;
  return null;
}

function extractAmexAmount(text){
  const patterns = [
    /New\s+Balance[\s:]+\$?\s*([\d,]+\.?\d*)/i,
    /Total\s+Amount\s+Due[\s:]+\$?\s*([\d,]+\.?\d*)/i,
    /Payment\s+Due[\s:]+\$?\s*([\d,]+\.?\d*)/i
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if(match){
      const isUSD = /\$/.test(text);
      const symbol = isUSD ? '$' : '₹';
      return `${symbol}${match[1].replace(/,/g, '')}`;
    }
  }
  return null;
}

function extractAmexDate(text){
  const patterns = [
    /Payment\s+Due\s+Date[\s:]+(\w+\s+\d{1,2},\s+\d{4})/i,
    /Due\s+Date[\s:]+(\d{2}\/\d{2}\/\d{4})/i
  ];
  
  for(const pattern of patterns){
    const match = text.match(pattern);
    if(match) return match[1];
  }
  return null;
}

function extractAmexPrevious(text){
  const pattern = /Previous\s+Balance[\s:]+\$?\s*([\d,]+\.?\d*)/i;
  const match = text.match(pattern);
  if(match){
    const isUSD = /\$/.test(text);
    const symbol = isUSD ? '$' : '₹';
    return `${symbol}${match[1].replace(/,/g, '')}`;
  }
  return null;
}

function extractAmexLimit(text){
  const pattern = /Credit\s+Limit[\s:]+\$?\s*([\d,]+\.?\d*)/i;
  const match = text.match(pattern);
  if(match){
    const isUSD = /\$/.test(text);
    const symbol = isUSD ? '$' : '₹';
    return `${symbol}${match[1].replace(/,/g, '')}`;
  }
  return null;
}

function extractAmexPoints(text){
  const pattern = /Membership\s*Rewards[\s:]+(\d{1,10})\s*points/i;
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function extractAmexTransactions(text){
  const transactions = [];
  const patterns = [
    /(\w+\s+\d{1,2})\s+(.{10,60}?)\s+\$?\s*([\d,]+\.?\d*)/g,
    /(\d{2}\/\d{2})\s+(.{10,60}?)\s+\$?\s*([\d,]+\.?\d*)/g
  ];

  for(const pattern of patterns){
    let match;
    while ((match = pattern.exec(text)) !== null && transactions.length < 15) {
      const isUSD = /\$/.test(text);
      const symbol = isUSD ? '$' : '₹';
      transactions.push({
        date: match[1],
        description: match[2].trim().substring(0, 50),
        amount: `${symbol}${match[3].replace(/,/g,'')}`
      });
    }
    if(transactions.length > 0) break;
  }
  return transactions;
}

const amexParse = (text) => {
  return {
    cardholderName: extractAmexName(text),
    cardLastFour: extractAmexCard(text),
    statementPeriod: extractAmexPeriod(text),
    totalAmountDue: extractAmexAmount(text),
    paymentDueDate: extractAmexDate(text),
    previousBalance: extractAmexPrevious(text),
    creditLimit: extractAmexLimit(text),
    rewardPoints: extractAmexPoints(text),
    transactions: extractAmexTransactions(text),
    confidence: 0.85
  };
};

module.exports = { parse: amexParse };