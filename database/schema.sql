-- ==========================================
-- نظام صندوق إدارة الأموال
-- Financial Fund Management System Database Schema
-- ==========================================

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name_ar TEXT NOT NULL,
    full_name_en TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'employee', -- admin, accountant, employee, viewer
    is_active INTEGER DEFAULT 1,
    is_superuser INTEGER DEFAULT 0,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول الصلاحيات
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    permission_code TEXT UNIQUE NOT NULL,
    permission_name_ar TEXT NOT NULL,
    permission_name_en TEXT,
    description TEXT,
    category TEXT -- users, vouchers, reports, settings, audit
);

-- جدول صلاحيات الأدوار
CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    permission_id INTEGER NOT NULL,
    FOREIGN KEY (permission_id) REFERENCES permissions(id),
    UNIQUE(role, permission_id)
);

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    id_number TEXT,
    id_type TEXT, -- national_id, passport, company_id
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول السندات (القبض والصرف)
CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_number TEXT UNIQUE NOT NULL,
    voucher_type TEXT NOT NULL, -- receipt, payment
    customer_id INTEGER,
    amount DECIMAL(15, 2) NOT NULL,
    amount_text_ar TEXT,
    payment_method TEXT, -- cash, check, transfer, card
    description TEXT,
    notes TEXT,
    status TEXT DEFAULT 'draft', -- draft, pending, approved, cancelled
    created_by INTEGER NOT NULL,
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول تفاصيل السندات
CREATE TABLE IF NOT EXISTS voucher_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2),
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE
);

-- جدول الحسابات (للحسابات المالية)
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_code TEXT UNIQUE NOT NULL,
    account_name_ar TEXT NOT NULL,
    account_name_en TEXT,
    account_type TEXT NOT NULL, -- asset, liability, equity, revenue, expense
    balance DECIMAL(15, 2) DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول السجل المالي
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER,
    account_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- debit, credit
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- جدول سجل العمليات (Audit Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- create, update, delete, view, approve, reject
    entity_type TEXT NOT NULL, -- voucher, customer, user, settings
    entity_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT, -- string, number, boolean, json
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول النسخ الاحتياطية
CREATE TABLE IF NOT EXISTS backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backup_name TEXT NOT NULL,
    backup_path TEXT NOT NULL,
    file_size INTEGER,
    status TEXT DEFAULT 'completed', -- pending, completed, failed
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    restored_at DATETIME,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- جدول جلسات المستخدمين
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    logout_time DATETIME,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(created_at);
CREATE INDEX IF NOT EXISTS idx_vouchers_type ON vouchers(voucher_type);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name_ar);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
