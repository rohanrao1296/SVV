import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'svv_secret_key_2026_super_secure';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access Token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

export const authMiddleware = verifyToken;
export const roleMiddleware = (roles) => Array.isArray(roles) ? requireRole(...roles) : requireRole(roles);

export default { verifyToken, requireRole, authMiddleware, roleMiddleware };
