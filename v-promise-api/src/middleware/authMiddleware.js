import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT authentication token
 * Expects token in Authorization header: "Bearer <token>"
 */
export const verifyAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "Access token required. Use 'Bearer <token>' in Authorization header" 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Token has expired" 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: "Invalid authentication token" 
    });
  }
};

/**
 * Middleware to verify user role
 * Usage: app.use('/admin', verifyRole(['admin']))
 */
export const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: "Insufficient permissions for this resource" 
      });
    }

    next();
  };
};
