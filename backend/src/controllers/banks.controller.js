const path = require('path');

const listBanks = (req,res) => {
  res.json({
    banks: [
      { id: 'HDFC',name: 'HDFC Bank',logo: '/logos/hdfc.png' },
      { id: 'ICICI',name: 'ICICI Bank',logo: '/logos/icici.png' },
      { id: 'SBI',name: 'SBI Card',logo: '/logos/sbi.png' },
      { id: 'AXIS',name: 'Axis Bank',logo: '/logos/axis.png' },
      { id: 'AMEX',name: 'American Express',logo: '/logos/amex.png' }
    ]
  });
};

module.exports = { listBanks};