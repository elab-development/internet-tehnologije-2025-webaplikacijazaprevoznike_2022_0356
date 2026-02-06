const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Missing or invalid authorization header',
      code: 'UNAUTHORIZED',
    });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired token',
      code: 'UNAUTHORIZED',
    });
  }
}

module.exports = { auth };
