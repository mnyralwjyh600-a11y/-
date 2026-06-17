import express from 'express';
import { getQuery, allQuery, runQuery } from '../models/database.js';
import { validateCustomer } from '../utils/validators.js';

const router = express.Router();

// GET /api/customers
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers WHERE is_active = 1';
    const params = [];

    if (search) {
      query += ' AND (name_ar LIKE ? OR name_en LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY name_ar ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const customers = await allQuery(query, params);
    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب العملاء' });
  }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await getQuery('SELECT * FROM customers WHERE id = ? AND is_active = 1', [id]);

    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب العميل' });
  }
});

// POST /api/customers
router.post('/', async (req, res) => {
  try {
    const errors = validateCustomer(req.body);
    if (errors) {
      return res.status(400).json({ errors });
    }

    const { nameAr, nameEn, phone, email, address, city, idNumber, idType, notes } = req.body;

    const result = await runQuery(
      `INSERT INTO customers (name_ar, name_en, phone, email, address, city, id_number, id_type, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nameAr, nameEn, phone, email, address, city, idNumber, idType, notes]
    );

    res.status(201).json({
      message: 'تم إضافة العميل بنجاح',
      id: result.id
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'حدث خطأ في إضافة العميل' });
  }
});

// PUT /api/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nameAr, nameEn, phone, email, address, city, idNumber, idType, notes } = req.body;

    const customer = await getQuery('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    await runQuery(
      `UPDATE customers SET name_ar = ?, name_en = ?, phone = ?, email = ?, address = ?, city = ?, id_number = ?, id_type = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nameAr, nameEn, phone, email, address, city, idNumber, idType, notes, id]
    );

    res.json({ message: 'تم تحديث العميل بنجاح' });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'حدث خطأ في تحديث العميل' });
  }
});

// DELETE /api/customers/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await getQuery('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    await runQuery('UPDATE customers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ message: 'تم حذف العميل بنجاح' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'حدث خطأ في حذف العميل' });
  }
});

export default router;
