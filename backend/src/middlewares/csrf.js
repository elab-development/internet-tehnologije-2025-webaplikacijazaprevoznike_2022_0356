const EXPECTED_TOKEN = process.env.CSRF_SECRET || 'dev-csrf-token';

function csrfProtection(req, res, next) {
  const method = req.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  if (!token || token !== EXPECTED_TOKEN) {
    return res.status(403).json({
      message: 'Invalid CSRF token',
      code: 'CSRF_FORBIDDEN',
    });
  }
  return next();
}

module.exports = { csrfProtection };

