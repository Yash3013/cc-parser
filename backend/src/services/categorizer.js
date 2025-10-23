const CATEGORY_PATTERNS = {
  'Food & Dining': [
    /swiggy|zomato|restaurant|cafe|food|dining|pizza|burger|mcdonald|kfc|domino|subway/i
  ],
  'Shopping': [
    /amazon|flipkart|myntra|ajio|shopping|mall|store|retail|walmart|target/i
  ],
  'Groceries': [
    /grocery|supermarket|dmart|bigbazaar|reliance\s*fresh|more|vegetables/i
  ],
  'Fuel': [
    /petrol|fuel|gas|pump|shell|hp|bharat|indian\s*oil/i
  ],
  'Entertainment': [
    /netflix|prime|hotstar|spotify|movie|cinema|theatre|pvr|inox|gaming/i
  ],
  'Bills & Utilities': [
    /electricity|water|gas|bill|utility|internet|broadband|mobile|recharge/i
  ],
  'Travel': [
    /uber|ola|taxi|flight|airline|hotel|booking|travel|makemytrip|goibibo|irctc/i
  ],
  'Healthcare': [
    /hospital|doctor|medical|pharmacy|medicine|health|clinic|apollo|fortis/i
  ],
  'Education': [
    /school|college|university|course|education|tuition|book|udemy|coursera/i
  ],
  'Insurance': [
    /insurance|policy|premium|lic|hdfc\s*life|icici\s*pru/i
  ]
};

function categorizeTransactions(transactions){
  return transactions.map(txn => {
    let category = 'Others';
    for (const [cat, patterns] of Object.entries(CATEGORY_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(txn.description))) {
        category = cat;
        break;
      }
    }
    return { ...txn, category };
  });
}

function calculateCategorySpending(transactions){
  const categoryTotals = {};
  let total = 0;
  transactions.forEach(txn => {
    const amount = parseFloat(txn.amount.replace(/[₹,]/g, ''));
    categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + amount;
    total += amount;
  });
  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount: amount.toFixed(2),
    percentage: ((amount / total) * 100).toFixed(1)
  })).sort((a, b) => b.amount - a.amount);
}

module.exports = { categorizeTransactions,calculateCategorySpending };