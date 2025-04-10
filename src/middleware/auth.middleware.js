const { verifyToken } = require('../utils/auth');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Store decoded token (user info) in request object
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token is not valid' });
  }
};

module.exports = { authenticate };