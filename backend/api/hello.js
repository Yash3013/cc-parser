module.exports = (req, res) => {
  if(req.method !== 'GET') return res.status(405).end();
  res.status(200).json({ message: 'Hello from backend!'});
};
