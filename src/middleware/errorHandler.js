export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'خطأ في التحقق من البيانات',
      details: err.message
    });
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      error: 'البيانات المدخلة موجودة بالفعل أو تنتهك قاعدة البيانات'
    });
  }

  // Authentication errors
  if (err.statusCode === 401) {
    return res.status(401).json({
      error: 'يجب تسجيل الدخول'
    });
  }

  // Authorization errors
  if (err.statusCode === 403) {
    return res.status(403).json({
      error: 'ليس لديك صلاحية للقيام بهذه العملية'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    error: err.message || 'حدث خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
