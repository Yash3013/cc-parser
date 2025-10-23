function generateAnalytics(parsedData){
  const analytics = {
    summary: {},
    spending: {},
    insights: []
  };
  const totalDue = parseFloat((parsedData.totalAmountDue || '0').replace(/[₹,]/g,''));
  const previousBalance = parseFloat((parsedData.previousBalance || '0').replace(/[₹,]/g,''));
  const creditLimit = parseFloat((parsedData.creditLimit || '0').replace(/[₹,]/g,''));
  
  analytics.summary = {
    totalDue: `₹${totalDue.toLocaleString('en-IN')}`,
    previousBalance: `₹${previousBalance.toLocaleString('en-IN')}`,
    newSpending: `₹${(totalDue - previousBalance).toLocaleString('en-IN')}`,
    creditUtilization: creditLimit > 0 ? `${((totalDue / creditLimit) * 100).toFixed(1)}%` : 'N/A'
  };
  if(parsedData.transactions && parsedData.transactions.length > 0){
    const categorizer = require('./categorizer');
    const categorySpending = categorizer.calculateCategorySpending(parsedData.transactions);
    analytics.spending = {
      totalTransactions: parsedData.transactions.length,
      categoryBreakdown: categorySpending,
      averageTransaction: `₹${(totalDue / parsedData.transactions.length).toFixed(2)}`,
      highestTransaction: findHighestTransaction(parsedData.transactions)
    };
    analytics.insights = generateInsights(analytics, categorySpending);
  }
  return analytics;
}

function findHighestTransaction(transactions){
  if(!transactions || transactions.length === 0) return null;
  return transactions.reduce((highest, current) => {
    const currentAmount = parseFloat(current.amount.replace(/[₹,]/g, ''));
    const highestAmount = parseFloat(highest.amount.replace(/[₹,]/g, ''));
    return currentAmount > highestAmount ? current : highest;
  });
}

function generateInsights(analytics,categorySpending){
  const insights = [];
  const utilization = parseFloat(analytics.summary.creditUtilization);
  if(utilization > 70){
    insights.push({
      type: 'warning',
      title: 'High Credit Utilization',
      message: `Your credit utilization is ${utilization.toFixed(1)}%. Keep it below 30% for better credit score.`
    });
  } else if(utilization < 30){
    insights.push({
      type: 'success',
      title: 'Healthy Credit Usage',
      message: `Great! Your credit utilization is ${utilization.toFixed(1)}%, which is excellent for your credit score.`
    });
  }
  
  if(categorySpending && categorySpending.length > 0){
    const topCategory = categorySpending[0];
    insights.push({
      type: 'info',
      title: 'Top Spending Category',
      message: `${topCategory.category} accounts for ${topCategory.percentage}% (₹${topCategory.amount}) of your spending.`
    });
  }
  insights.push({
    type: 'reminder',
    title: 'Payment Reminder',
    message: 'Pay your credit card bill before the due date to avoid interest charges and maintain a good credit score.'
  });
  
  return insights;
}

module.exports = { generateAnalytics };