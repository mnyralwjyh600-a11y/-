import express from 'express';
import bcryptjs from 'bcryptjs';
import { getQuery, allQuery, runQuery } from '../models/database.js';
import { requireRole } from '../middleware/authMiddleware.js';
import { validateUser } from '../utils/validators.js';

const router = express.Router();

// GET /api/users
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, username, full_name_ar, email, role, is_active, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const users = await allQuery(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب المستخدمين' });
  }
});

// GET /api/users/:id
router.get('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getQuery(
      'SELECT id, username, full_name_ar, full_name_en, email, role, is_active, last_login, created_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب المستخدم' });
  }
});

// POST /api/users
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const errors = validateUser(req.body);
    if (errors) {
      return res.status(400).json({ errors });
    }

    const { username, password, fullNameAr, fullNameEn, email, role } = req.body;

    // Check if username exists
    const existingUser = await getQuery('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await runQuery(
      `INSERT INTO users (username, password, full_name_ar, full_name_en, email, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, fullNameAr, fullNameEn, email, role]
    );

    res.status(201).json({
      message: 'تم إنشاء المستخدم بنجاح',
      id: result.id
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'حدث خطأ في إنشاء المستخدم' });
  }
});

// PUT /api/users/:id
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { fullNameAr, fullNameEn, email, role, isActive } = req.body;

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    await runQuery(
      `UPDATE users SET full_name_ar = ?, full_name_en = ?, email = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [fullNameAr, fullNameEn, email, role, isActive, id]
    );

    res.json({ message: 'تم تحديث المستخدم بنجاح' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'حدث خطأ في تحديث المستخدم' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getQuery('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }

    if (user.is_superuser) {
      return res.status(400).json({ error: 'لا يمكن حذف المسؤول الأساسي' });
    }

    await runQuery('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'حدث خطأ في حذف المستخدم' });
  }
});

export default router;
