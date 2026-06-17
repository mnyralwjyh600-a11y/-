import express from 'express';
import { allQuery, getQuery } from '../models/database.js';

const router = express.Router();

// GET /api/reports/daily
router.get('/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];

    const data = await allQuery(
      `SELECT 
        v.id, v.voucher_number, v.voucher_type, v.amount, v.payment_method,
        c.name_ar, u.full_name_ar,
        v.created_at
       FROM vouchers v
       LEFT JOIN customers c ON v.customer_id = c.id
       LEFT JOIN users u ON v.created_by = u.id
       WHERE DATE(v.created_at) = ?
       ORDER BY v.created_at DESC`,
      [reportDate]
    );

    const summary = await getQuery(
      `SELECT 
        SUM(CASE WHEN voucher_type = 'receipt' THEN amount ELSE 0 END) as totalReceipts,
        SUM(CASE WHEN voucher_type = 'payment' THEN amount ELSE 0 END) as totalPayments
       FROM vouchers
       WHERE DATE(created_at) = ?`,
      [reportDate]
    );

    res.json({
      date: reportDate,
      vouchers: data,
      summary: summary || { totalReceipts: 0, totalPayments: 0 }
    });
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب التقرير اليومي' });
  }
});

// GET /api/reports/monthly
router.get('/monthly', async (req, res) => {
  try {
    const { month } = req.query;
    const reportMonth = month || new Date().toISOString().slice(0, 7);

    const data = await allQuery(
      `SELECT 
        DATE(v.created_at) as date,
        SUM(CASE WHEN v.voucher_type = 'receipt' THEN v.amount ELSE 0 END) as receipts,
        SUM(CASE WHEN v.voucher_type = 'payment' THEN v.amount ELSE 0 END) as payments,
        COUNT(*) as voucherCount
       FROM vouchers v
       WHERE strftime('%Y-%m', v.created_at) = ?
       GROUP BY DATE(v.created_at)
       ORDER BY date ASC`,
      [reportMonth]
    );

    const summary = await getQuery(
      `SELECT 
        SUM(CASE WHEN voucher_type = 'receipt' THEN amount ELSE 0 END) as totalReceipts,
        SUM(CASE WHEN voucher_type = 'payment' THEN amount ELSE 0 END) as totalPayments,
        COUNT(*) as totalVouchers
       FROM vouchers
       WHERE strftime('%Y-%m', created_at) = ?`,
      [reportMonth]
    );

    res.json({
      month: reportMonth,
      dailyData: data,
      summary: summary || { totalReceipts: 0, totalPayments: 0, totalVouchers: 0 }
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب التقرير الشهري' });
  }
});

// GET /api/reports/customer/:customerId
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await getQuery('SELECT * FROM customers WHERE id = ?', [customerId]);
    if (!customer) {
      return res.status(404).json({ error: 'العميل غير موجود' });
    }

    const transactions = await allQuery(
      `SELECT * FROM vouchers WHERE customer_id = ? ORDER BY created_at DESC`,
      [customerId]
    );

    const summary = await getQuery(
      `SELECT 
        SUM(CASE WHEN voucher_type = 'receipt' THEN amount ELSE 0 END) as totalReceipts,
        SUM(CASE WHEN voucher_type = 'payment' THEN amount ELSE 0 END) as totalPayments
       FROM vouchers
       WHERE customer_id = ?`,
      [customerId]
    );

    res.json({
      customer,
      transactions,
      summary: summary || { totalReceipts: 0, totalPayments: 0 }
    });
  } catch (error) {
    console.error('Customer report error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب تقرير العميل' });
  }
});

export default router;
