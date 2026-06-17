import express from 'express';
import { getQuery, runQuery, allQuery } from '../models/database.js';
import { requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/settings
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const settings = await allQuery('SELECT * FROM settings');
    const settingsObj = {};

    settings.forEach(s => {
      if (s.setting_type === 'boolean') {
        settingsObj[s.setting_key] = s.setting_value === 'true';
      } else if (s.setting_type === 'number') {
        settingsObj[s.setting_key] = parseFloat(s.setting_value);
      } else if (s.setting_type === 'json') {
        settingsObj[s.setting_key] = JSON.parse(s.setting_value);
      } else {
        settingsObj[s.setting_key] = s.setting_value;
      }
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'حدث خطأ في جلب الإعدادات' });
  }
});

// PUT /api/settings
router.put('/', requireRole(['admin']), async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      const existing = await getQuery('SELECT * FROM settings WHERE setting_key = ?', [key]);

      let settingType = 'string';
      let settingValue = String(value);

      if (typeof value === 'boolean') {
        settingType = 'boolean';
      } else if (typeof value === 'number') {
        settingType = 'number';
      } else if (typeof value === 'object') {
        settingType = 'json';
        settingValue = JSON.stringify(value);
      }

      if (existing) {
        await runQuery(
          'UPDATE settings SET setting_value = ?, setting_type = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?',
          [settingValue, settingType, key]
        );
      } else {
        await runQuery(
          'INSERT INTO settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?)',
          [key, settingValue, settingType]
        );
      }
    }

    res.json({ message: 'تم حفظ الإعدادات بنجاح' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'حدث خطأ في حفظ الإعدادات' });
  }
});

export default router;
