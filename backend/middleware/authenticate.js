module.exports = (req, res, next) => {
  // Example basic check - you can improve using real tokens
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
  next();
};
