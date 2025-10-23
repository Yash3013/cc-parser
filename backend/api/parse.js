// backend/api/parse.js
const cors = require('cors')({ origin:'https://cc-parser.vercel.app'});

function handler(req, res) {
  if(req.method === 'OPTIONS') return res.status(204).end();
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body || {};
  const input = body.text || '<no text provided>';
  const parsed = input.replace(/\D+/g, '') || null;
  return res.status(200).json({ parsed, original: input });
}

module.exports = (req,res) => {
  cors(req,res,() => handler(req,res));
};
