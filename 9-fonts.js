// Curated Arabic Google Fonts with their real weight ranges and style class.
export const FONTS = [
  { id: 'Cairo', css: 'Cairo', label: 'القاهرة', kind: 'نسخ حديث', weights: [200, 300, 400, 500, 600, 700, 800, 900, 1000] },
  { id: 'Tajawal', css: 'Tajawal', label: 'تجوال', kind: 'نسخ حديث', weights: [200, 300, 400, 500, 700, 800, 900] },
  { id: 'Almarai', css: 'Almarai', label: 'المراعي', kind: 'نسخ حديث', weights: [300, 400, 700, 800] },
  { id: 'IBM Plex Sans Arabic', css: 'IBM Plex Sans Arabic', label: 'بلكس عربي', kind: 'نسخ حديث', weights: [100, 200, 300, 400, 500, 600, 700] },
  { id: 'Mada', css: 'Mada', label: 'مَدى', kind: 'نسخ حديث', weights: [200, 300, 400, 500, 600, 700, 900] },
  { id: 'Changa', css: 'Changa', label: 'تشانجا', kind: 'نسخ حديث', weights: [200, 300, 400, 500, 600, 700, 800] },
  { id: 'El Messiri', css: 'El Messiri', label: 'المسيري', kind: 'نسخ حديث', weights: [400, 500, 600, 700] },
  { id: 'Noto Kufi Arabic', css: 'Noto Kufi Arabic', label: 'نوتو كوفي', kind: 'كوفي', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { id: 'Reem Kufi', css: 'Reem Kufi', label: 'ريم كوفي', kind: 'كوفي', weights: [400, 500, 600, 700] },
  { id: 'Amiri', css: 'Amiri', label: 'أميري', kind: 'نسخ تراثي', weights: [400, 700] },
  { id: 'Scheherazade New', css: 'Scheherazade New', label: 'شهرزاد', kind: 'نسخ تراثي', weights: [400, 500, 600, 700] },
  { id: 'Markazi Text', css: 'Markazi Text', label: 'مركزي', kind: 'نسخ تراثي', weights: [400, 500, 600, 700] },
  { id: 'Aref Ruqaa', css: 'Aref Ruqaa', label: 'عارف رقعة', kind: 'رقعة', weights: [400, 700] },
  { id: 'Lalezar', css: 'Lalezar', label: 'لاله‌زار', kind: 'عرض', weights: [400] },
]

export const SAMPLES = [
  {
    id: 'pangram',
    label: 'جملة كل الحروف',
    text: 'نصٌّ حكيمٌ له سرٌّ قاطعٌ وذو شأنٍ عظيمٍ مكتوبٌ على ثوبٍ أخضرٍ ومغلَّفٌ بجلدٍ أزرق',
  },
  {
    id: 'poetry',
    label: 'شعر',
    text: 'على قدرِ أهلِ العزمِ تأتي العزائمُ *** وتأتي على قدرِ الكرامِ المكارمُ',
  },
  {
    id: 'ui',
    label: 'واجهة استخدام',
    text: 'تسجيل الدخول · حفظ التغييرات · إلغاء الطلب · عرض المزيد · إعدادات الحساب · سلة التسوق فارغة',
  },
  {
    id: 'numbers',
    label: 'أرقام وعملات',
    text: '١٢٣٤٥٦٧٨٩٠ — ٤٢٫٩٩ جنيهًا — الخميس ٢٦ نوفمبر ٢٠٢٦ — 1234567890 — EGP 42.99',
  },
  {
    id: 'tashkeel',
    label: 'اختبار التشكيل',
    text: 'لَا لَاَ لَاٰ لَآ لَأٓ — الْمَدْرَسَةُ الْجَمِيلَةُ، أَهْلًا بِالضَّيْفِ الْكَرِيمِ! هَلْ قَرَأْتَ الْكِتَابَ؟',
  },
]

// Build one css2 request covering exactly the fonts in play (plus UI font).
// light=true loads every family at weight 400 only (for picker swatches).
export function fontsUrl(ids, light = false) {
  const fams = light ? ids : [...new Set([...ids, 'IBM Plex Sans Arabic'])]
  const parts = fams.map((id) => {
    const f = FONTS.find((x) => x.id === id)
    const w = light ? '400' : f ? f.weights.join(';') : '400;500;600;700'
    return `family=${id.replace(/ /g, '+')}:wght@${w}`
  })
  return `https://fonts.googleapis.com/css2?${parts.join('&')}&subset=arabic&display=swap`
}
