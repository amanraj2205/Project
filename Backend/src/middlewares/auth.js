
import jwt from 'jsonwebtoken';
import { config } from "dotenv";
config();

const JWT_SECRET = process.env.JWT_SECRET;


const authenticateToken = (req, res, next) => {
  try {
    let token;

   
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }
   
    else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

   
    const decoded = jwt.verify(token, JWT_SECRET);
    
   
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      reason: error.message
    });
  }
};


const authenticateTokenFlexible = (req, res, next) => {
  try {
    let token;

    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
   
    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }
    
    else if (req.body.token) {
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};


const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Role required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user.role} not authorized for this action`
      });
    }

    next();
  };
};


const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export {
  authenticateToken,
  authenticateTokenFlexible, 
  authorizeRoles,
  adminOnly
};
