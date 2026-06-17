import express from 'express';
import { allQuery, getQuery } from '../models/database.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    // Get balance from last transaction
    const balance = await getQuery(
      `SELECT COALESCE(SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE -amount END), 0) as total
       FROM transactions`
    );

    // Get today's receipts
    const todayReceipts = await getQuery(
      `SELECT COALESCE(SUM(amount), 0) as total FROM vouchers
       WHERE voucher_type = 'receipt' AND DATE(created_at) = DATE('now')`
    );

    // Get today's payments
    const todayPayments = await getQuery(
      `SELECT COALESCE(SUM(amount), 0) as total FROM vouchers
       WHERE voucher_type = 'payment' AND DATE(created_at) = DATE('now')`
    );

    // Get total revenue (all receipts)
    const totalRevenue = await getQuery(
      `SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE voucher_type = 'receipt'`
    );

    // Get total expenses (all payments)
    const totalExpenses = await getQuery(
      `SELECT COALESCE(SUM(amount), 0) as total FROM vouchers WHERE voucher_type = 'payment'`
    );

    // Get today's voucher count
    const voucherCount = await getQuery(
      `SELECT COUNT(*) as count FROM vouchers WHERE DATE(created_at) = DATE('now')`
    );

    // Get total customers
    const customerCount = await getQuery(
      `SELECT COUNT(*) as count FROM customers WHERE is_active = 1`
    );

    // Get recent vouchers
    const recentVouchers = await allQuery(
      `SELECT v.*, c.name_ar FROM vouchers v
       LEFT JOIN customers c ON v.customer_id = c.id
       ORDER BY v.created_at DESC LIMIT 10`
    );

    // Get daily statistics for the last 7 days
    const dailyStats = await allQuery(
      `SELECT 
         DATE(created_at) as date,
         SUM(CASE WHEN voucher_type = 'receipt' THEN amount ELSE 0 END) as receipts,
         SUM(CASE WHEN voucher_type = 'payment' THEN amount ELSE 0 END) as payments
       FROM vouchers
       WHERE created_at >= datetime('now', '-7 days')
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    res.json({
      currentBalance: balance.total || 0,
      todayReceipts: todayReceipts.total || 0,
      todayPayments: todayPayments.total || 0,
      totalRevenue: totalRevenue.total || 0,
      totalExpenses: totalExpenses.total || 0,
      dailyVouchers: voucherCount.count || 0,
      totalCustomers: customerCount.count || 0,
      recentVouchers,
      dailyStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب بيانات لوحة التحكم' });
  }
});

export default router;
