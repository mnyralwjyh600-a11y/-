// نماذج التحقق من البيانات

export const validators = {
  username: (value) => {
    if (!value) return 'اسم المستخدم مطلوب';
    if (value.length < 3) return 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'اسم المستخدم يحتوي على أحرف غير صحيحة';
    return null;
  },
  
  password: (value) => {
    if (!value) return 'كلمة المرور مطلوبة';
    if (value.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    return null;
  },
  
  email: (value) => {
    if (!value) return null; // optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'البريد الإلكتروني غير صحيح';
    return null;
  },
  
  phone: (value) => {
    if (!value) return null; // optional
    const phoneRegex = /^[0-9+\-() ]+$/;
    if (!phoneRegex.test(value) || value.replace(/[^0-9]/g, '').length < 9) {
      return 'رقم الهاتف غير صحيح';
    }
    return null;
  },
  
  amount: (value) => {
    if (!value) return 'المبلغ مطلوب';
    if (isNaN(value) || parseFloat(value) <= 0) return 'المبلغ يجب أن يكون رقماً موجباً';
    return null;
  },
  
  nameAr: (value) => {
    if (!value) return 'الاسم بالعربية مطلوب';
    if (value.length < 2) return 'الاسم يجب أن يكون حرفين على الأقل';
    return null;
  },
  
  date: (value) => {
    if (!value) return 'التاريخ مطلوب';
    if (isNaN(Date.parse(value))) return 'التاريخ غير صحيح';
    return null;
  }
};

export function validateVoucher(data) {
  const errors = {};
  
  if (!data.voucherType) errors.voucherType = 'نوع السند مطلوب';
  if (!data.customerId) errors.customerId = 'العميل مطلوب';
  
  const amountError = validators.amount(data.amount);
  if (amountError) errors.amount = amountError;
  
  if (!data.paymentMethod) errors.paymentMethod = 'طريقة الدفع مطلوبة';
  if (!data.description) errors.description = 'البيان مطلوب';
  
  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateUser(data) {
  const errors = {};
  
  const usernameError = validators.username(data.username);
  if (usernameError) errors.username = usernameError;
  
  const passwordError = validators.password(data.password);
  if (passwordError) errors.password = passwordError;
  
  const nameError = validators.nameAr(data.fullNameAr);
  if (nameError) errors.fullNameAr = nameError;
  
  if (!data.role) errors.role = 'الدور مطلوب';
  
  if (data.email) {
    const emailError = validators.email(data.email);
    if (emailError) errors.email = emailError;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateCustomer(data) {
  const errors = {};
  
  const nameError = validators.nameAr(data.nameAr);
  if (nameError) errors.nameAr = nameError;
  
  if (data.phone) {
    const phoneError = validators.phone(data.phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  if (data.email) {
    const emailError = validators.email(data.email);
    if (emailError) errors.email = emailError;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}
