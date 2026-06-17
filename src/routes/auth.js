import express from 'express';
import bcryptjs from 'bcryptjs';
import { getQuery, runQuery } from '../models/database.js';
import { validators } from '../utils/validators.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, remember } = req.body;

    // Validate input
    const usernameError = validators.username(username);
    if (usernameError) {
      return res.status(400).json({ error: usernameError });
    }

    const passwordError = validators.password(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Find user
    const user = await getQuery('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
    
    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // Update last login
    await runQuery('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name_ar,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'حدث خطأ في تسجيل الدخول' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'حدث خطأ في تسجيل الخروج' });
    }
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  });
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول' });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'كلمات المرور غير متطابقة' });
    }

    const passwordError = validators.password(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Get user
    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    // Verify current password
    const isValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await runQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'حدث خطأ في تغيير كلمة المرور' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول' });
    }

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json({
      id: user.id,
      username: user.username,
      fullName: user.full_name_ar,
      role: user.role,
      email: user.email,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

export default router;
