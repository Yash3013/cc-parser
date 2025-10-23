function validateExtractedData(data){
  const validations = {
    cardholderName: validateName(data.cardholderName),
    cardLastFour: validateCardNumber(data.cardLastFour),
    statementPeriod: validateDateRange(data.statementPeriod),
    totalAmountDue: validateAmount(data.totalAmountDue),
    paymentDueDate: validateDate(data.paymentDueDate)
  };
  const validCount = Object.values(validations).filter(v => v.valid).length;
  const totalFields = Object.keys(validations).length;
  return{
    fields: validations,
    overallScore: (validCount / totalFields * 100).toFixed(0),
    isComplete: validCount === totalFields,
    missingFields: Object.keys(validations).filter(k => !validations[k].valid)
  };
}

function validateName(name){
  if(!name) return {valid: false,message: 'Name is missing' };
  if(name.length < 3) return {valid: false,message: 'Name too short' };
  if(!/^[A-Za-z\s.]+$/.test(name)) return {valid: false,message: 'Invalid characters in name' };
  return { valid: true, message: 'Valid' };
}

function validateCardNumber(number){
  if(!number) return {valid: false,message: 'Card number missing' };
  if(!/^\d{4}$/.test(number)) return {valid: false,message: 'Must be 4 digits' };
  return {valid: true,message: 'Valid' };
}

function validateDateRange(dateRange){
  if(!dateRange) return {valid: false,message: 'Date range missing' };
  if(!/\d{2}.+\d{4}.*-.*\d{2}.+\d{4}/.test(dateRange)) {
    return {valid: false,message: 'Invalid format' };
  }
  return {valid: true,message: 'Valid' };
}

function validateAmount(amount){
  if(!amount) return {valid: false,message: 'Amount missing' };
  const numericAmount = amount.replace(/[₹,]/g, '');
  if(isNaN(numericAmount) || parseFloat(numericAmount) <= 0) {
    return {valid: false,message: 'Invalid amount' };
  }
  return {valid: true,message: 'Valid' };
}

function validateDate(date){
  if(!date) return {valid: false,message: 'Date missing' };
  if(!/\d{2}.+\d{4}/.test(date)){
    return {valid: false,message: 'Invalid date format' };
  }
  return {valid: true,message: 'Valid' };
}

module.exports = { validateExtractedData };
