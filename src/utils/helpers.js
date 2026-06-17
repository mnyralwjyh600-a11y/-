// دوال مساعدة عامة

export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`;
  if (format === 'YYYY-MM-DD HH:mm') return `${year}-${month}-${day} ${hours}:${minutes}`;
  if (format === 'HH:mm:ss') return `${hours}:${minutes}:${String(d.getSeconds()).padStart(2, '0')}`;
  
  return d.toLocaleDateString('ar-SA');
}

export function formatMoney(amount, decimals = 2, currency = 'ر.س') {
  if (!amount) return '0.00';
  const num = parseFloat(amount);
  return num.toLocaleString('ar-SA', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  }) + ' ' + currency;
}

export function generateVoucherNumber(type = 'receipt') {
  const prefix = type === 'receipt' ? 'RCP' : 'PAY';
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export function truncateText(text, length = 50) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidPhone(phone) {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 9;
}

export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function getQueryParams(url) {
  const params = {};
  const urlParams = new URL(url, 'http://localhost').searchParams;
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  return params;
}

export function buildQueryString(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}
