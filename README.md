# نظام صندوق إدارة الأموال 💰
# Financial Fund Management System

نظام صندوق مالي احترافي عربي كامل مع واجهة RTL متقدمة وميزات حسابية متكاملة.

## ✨ المميزات الرئيسية

### 🎨 واجهة المستخدم
- تصميم احترافي RTL كامل باللغة العربية
- واجهة متجاوبة للهاتف والكمبيوتر
- ألوان احترافية (أبيض + أزرق داكن)
- خطوط عربية واضحة
- أداء عالي وسرعة استجابة

### 🔐 نظام الأمان والمستخدمين
- نظام Authentication قوي مع تشفير كلمات المرور
- 4 أدوار مختلفة (مدير نظام، محاسب، موظف، مشاهدة فقط)
- نظام صلاحيات تفصيلي (إضافة، تعديل، حذف، طباعة، تصدير، إدارة)
- Audit Logs كامل لتتبع جميع العمليات
- Session Management آمن

### 📊 لوحة التحكم Dashboard
- بطاقات إحصائية (الرصيد، الإيرادات، المصروفات، السندات، العملاء)
- رسوم بيانية متقدمة
- اختصارات سريعة للعمليات الشائعة

### 📋 نظام السندات
- **سند قبض** (Receipt Voucher)
- **سند صرف** (Payment Voucher)
- ترقيم تلقائي
- تحويل المبلغ لكتابة بالحروف العربية
- بحث وفلترة متقدمة
- تعديل وحذف بصلاحية

### 📄 الطباعة والتصدير
- PDF احترافي مع شعار ورأس الصندوق
- طباعة مباشرة
- تصدير لـ Excel
- تنسيق A4 رسمي

### 📈 التقارير
- تقرير يومي / أسبوعي / شهري / سنوي
- كشف حساب العميل
- تقرير الإيرادات والمصروفات
- حركة الصندوق الشهرية
- دعم البحث والفلترة والطباعة لكل التقارير

### ⚙️ الإعدادات
- إدارة بيانات المؤسسة (اسم، شعار، عملة)
- تنسيقات التاريخ والأرقام
- النسخ الاحتياطي والاستعادة
- إدارة المستخدمين

## 🚀 البدء السريع

### المتطلبات
- Node.js 16+
- npm أو yarn

### التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/mnyralwjyh600-a11y/-.git
cd -

# تثبيت المكتبات
npm install

# نسخ ملف البيئة
cp .env.example .env

# تهيئة قاعدة البيانات
npm run seed-db

# تشغيل الخادم
npm start
```

سيتم تشغيل التطبيق على `http://localhost:3000`

### بيانات تسجيل الدخول الافتراضية
- **اسم المستخدم**: admin
- **كلمة المرور**: admin123

## 📁 هيكل المشروع

```
.
├── public/
│   ├── css/
│   │   ├── style.css (الأساسي)
│   │   ├── rtl.css (دعم RTL)
│   │   └── responsive.css (التجاوب)
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── utils.js
│   │   └── reports.js
│   ├── images/
│   └── uploads/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── vouchersController.js
│   │   ├── customersController.js
│   │   ├── usersController.js
│   │   ├── reportsController.js
│   │   └── settingsController.js
│   ├── models/
│   │   ├── database.js
│   │   ├── User.js
│   │   ├── Voucher.js
│   │   ├── Customer.js
│   │   ├── AuditLog.js
│   │   └── Settings.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── permissionMiddleware.js
│   │   ├── errorHandler.js
│   │   └── auditMiddleware.js
│   ├── utils/
│   │   ├── pdfGenerator.js
│   │   ├── excelExporter.js
│   │   ├── numberToArabic.js
│   │   └── validators.js
│   └── routes/
│       ├── auth.js
│       ├── dashboard.js
│       ├── vouchers.js
│       ├── customers.js
│       ├── users.js
│       ├── reports.js
│       └── settings.js
├── views/
│   ├── login.html
│   ├── dashboard.html
│   ├── vouchers.html
│   ├── customers.html
│   ├── users.html
│   ├── reports.html
│   └── settings.html
├── scripts/
│   ├── seedDatabase.js
│   └── backup.js
├── database/
│   └── schema.sql
├── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔧 التكنولوجيا المستخدمة

- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **PDF Generation**: PDFKit
- **Excel Export**: XLSX
- **Security**: bcryptjs, helmet, express-rate-limit
- **PDF من الأمام**: jsPDF (مكتبة عميل)

## 📚 التوثيق

### API Endpoints

#### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `POST /api/auth/change-password` - تغيير كلمة المرور

#### Dashboard
- `GET /api/dashboard` - الإحصائيات والبيانات الأساسية

#### Vouchers
- `GET /api/vouchers` - قائمة السندات
- `POST /api/vouchers` - إنشاء سند جديد
- `GET /api/vouchers/:id` - تفاصيل السند
- `PUT /api/vouchers/:id` - تعديل السند
- `DELETE /api/vouchers/:id` - حذف السند
- `GET /api/vouchers/:id/pdf` - تحميل PDF

#### Reports
- `GET /api/reports/daily` - التقرير اليومي
- `GET /api/reports/weekly` - التقرير الأسبوعي
- `GET /api/reports/monthly` - التقرير الشهري
- `GET /api/reports/yearly` - التقرير السنوي

## 🔒 الأمان

- كلمات المرور مشفرة باستخدام bcryptjs
- جلسات آمنة مع بيانات محدودة
- حماية CORS مفعلة
- معايير الأمان Helmet مفعلة
- تحديد معدل الطلبات (Rate Limiting)
- Audit Logs لجميع العمليات الحساسة

## 📝 الترخيص

MIT License

## 👥 المساهمة

لسؤال أو اقتراح، يرجى فتح Issue أو Pull Request.

---

**تطويركم الناجح** ✨
