import express from 'express';
import { getQuery, allQuery, runQuery } from '../models/database.js';
import { validateVoucher } from '../utils/validators.js';
import { generateVoucherNumber, formatMoneyToArabic } from '../utils/helpers.js';
import { formatMoneyToArabic as convertAmount } from '../utils/numberToArabic.js';

const router = express.Router();

// GET /api/vouchers
router.get('/', async (req, res) => {
  try {
    const { type, startDate, endDate, customerId, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT v.*, c.name_ar FROM vouchers v LEFT JOIN customers c ON v.customer_id = c.id WHERE 1=1`;
    const params = [];

    if (type) {
      query += ' AND v.voucher_type = ?';
      params.push(type);
    }

    if (customerId) {
      query += ' AND v.customer_id = ?';
      params.push(customerId);
    }

    if (status) {
      query += ' AND v.status = ?';
      params.push(status);
    }

    if (startDate) {
      query += ' AND DATE(v.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(v.created_at) <= ?';
      params.push(endDate);
    }

    query += ` ORDER BY v.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const vouchers = await allQuery(query, params);
    res.json(vouchers);
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب السندات' });
  }
});

// GET /api/vouchers/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await getQuery(
      `SELECT v.*, c.name_ar, u.full_name_ar FROM vouchers v
       LEFT JOIN customers c ON v.customer_id = c.id
       LEFT JOIN users u ON v.created_by = u.id
       WHERE v.id = ?`,
      [id]
    );

    if (!voucher) {
      return res.status(404).json({ error: 'السند غير موجود' });
    }

    const details = await allQuery(
      'SELECT * FROM voucher_details WHERE voucher_id = ?',
      [id]
    );

    res.json({ ...voucher, details });
  } catch (error) {
    console.error('Get voucher error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب السند' });
  }
});

// POST /api/vouchers
router.post('/', async (req, res) => {
  try {
    const errors = validateVoucher(req.body);
    if (errors) {
      return res.status(400).json({ errors });
    }

    const {
      voucherType,
      customerId,
      amount,
      paymentMethod,
      description,
      notes,
      details
    } = req.body;

    const voucherNumber = generateVoucherNumber(voucherType);
    const amountText = convertAmount(amount);

    const result = await runQuery(
      `INSERT INTO vouchers (voucher_number, voucher_type, customer_id, amount, amount_text_ar, payment_method, description, notes, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        voucherNumber,
        voucherType,
        customerId,
        amount,
        amountText,
        paymentMethod,
        description,
        notes,
        req.session.userId,
        'draft'
      ]
    );

    // Insert details if provided
    if (details && Array.isArray(details)) {
      for (const detail of details) {
        await runQuery(
          'INSERT INTO voucher_details (voucher_id, description, amount) VALUES (?, ?, ?)',
          [result.id, detail.description, detail.amount]
        );
      }
    }

    res.status(201).json({
      message: 'تم إنشاء السند بنجاح',
      id: result.id,
      voucherNumber
    });
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ error: 'حدث خطأ في إنشاء السند' });
  }
});

// PUT /api/vouchers/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { voucherType, customerId, amount, paymentMethod, description, notes, status } = req.body;

    // Check if voucher exists
    const voucher = await getQuery('SELECT * FROM vouchers WHERE id = ?', [id]);
    if (!voucher) {
      return res.status(404).json({ error: 'السند غير موجود' });
    }

    // Can't edit approved vouchers
    if (voucher.status === 'approved') {
      return res.status(400).json({ error: 'لا يمكن تعديل سند معتمد' });
    }

    const amountText = amount ? convertAmount(amount) : voucher.amount_text_ar;

    await runQuery(
      `UPDATE vouchers SET voucher_type = ?, customer_id = ?, amount = ?, amount_text_ar = ?, payment_method = ?, description = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [voucherType, customerId, amount, amountText, paymentMethod, description, notes, status || voucher.status, id]
    );

    res.json({ message: 'تم تحديث السند بنجاح' });
  } catch (error) {
    console.error('Update voucher error:', error);
    res.status(500).json({ error: 'حدث خطأ في تحديث السند' });
  }
});

// DELETE /api/vouchers/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if voucher exists
    const voucher = await getQuery('SELECT * FROM vouchers WHERE id = ?', [id]);
    if (!voucher) {
      return res.status(404).json({ error: 'السند غير موجود' });
    }

    // Can't delete approved vouchers
    if (voucher.status === 'approved') {
      return res.status(400).json({ error: 'لا يمكن حذف سند معتمد' });
    }

    // Delete details first
    await runQuery('DELETE FROM voucher_details WHERE voucher_id = ?', [id]);

    // Delete voucher
    await runQuery('DELETE FROM vouchers WHERE id = ?', [id]);

    res.json({ message: 'تم حذف السند بنجاح' });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({ error: 'حدث خطأ في حذف السند' });
  }
});

export default router;
