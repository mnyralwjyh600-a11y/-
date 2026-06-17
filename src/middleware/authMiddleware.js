import { getQuery } from '../models/database.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Check if user is logged in via session
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });
    }

    // Get user from database
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'المستخدم غير نشط' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'حدث خطأ في التحقق' });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'ليس لديك صلاحية للوصول إلى هذا المورد' });
    }

    next();
  };
};

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'يجب تسجيل الدخول' });
      }

      // Admin has all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Check user permission
      const rolePermission = await getQuery(
        `SELECT rp.* FROM role_permissions rp
         JOIN permissions p ON rp.permission_id = p.id
         WHERE rp.role = ? AND p.permission_code = ?`,
        [req.user.role, permission]
      );

      if (!rolePermission) {
        return res.status(403).json({ error: 'ليس لديك صلاحية لهذه العملية' });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'حدث خطأ في التحقق من الصلاحيات' });
    }
  };
};
