// تحويل الأرقام إلى كتابة عربية

const ones = [
  '',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة'
];

const tens = [
  '',
  '',
  'عشرون',
  'ثلاثون',
  'أربعون',
  'خمسون',
  'ستون',
  'سبعون',
  'ثمانون',
  'تسعون'
];

const hundreds = [
  '',
  'مائة',
  'مائتان',
  'ثلاثمائة',
  'أربعمائة',
  'خمسمائة',
  'ستمائة',
  'سبعمائة',
  'ثمانمائة',
  'تسعمائة'
];

const thousands = [
  '',
  'ألف',
  'مليون',
  'مليار',
  'تريليون'
];

const teens = [
  'عشرة',
  'احدى عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر'
];

function convertGroupToArabic(num) {
  if (num === 0) return '';

  let result = '';

  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const o = num % 10;

  if (h > 0) {
    result += hundreds[h];
  }

  if (t === 1) {
    if (result) result += ' و';
    result += teens[o];
  } else {
    if (o > 0) {
      if (result) result += ' و';
      result += ones[o];
    }
    if (t > 1) {
      if (result) result += ' و';
      result += tens[t];
    }
  }

  return result;
}

export function convertNumberToArabic(num) {
  if (num === 0) return 'صفر';
  if (num < 0) return 'سالب ' + convertNumberToArabic(Math.abs(num));

  const parts = [];
  let groupIndex = 0;

  while (num > 0) {
    const group = num % 1000;
    if (group > 0) {
      let groupText = convertGroupToArabic(group);
      if (groupIndex > 0 && groupText) {
        groupText += ' ' + thousands[groupIndex];
        if (group > 2 && group < 11) {
          groupText += 'ات';
        }
      }
      parts.unshift(groupText);
    }
    num = Math.floor(num / 1000);
    groupIndex++;
  }

  return parts.join(' و');
}

export function formatMoneyToArabic(amount, currency = 'ريال') {
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);
  
  let result = convertNumberToArabic(integerPart) + ' ' + currency;
  
  if (decimalPart > 0) {
    result += ' و' + convertNumberToArabic(decimalPart) + ' هللة';
  }
  
  return result;
}
