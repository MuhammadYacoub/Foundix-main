# Foundix - دليل التعديلات الجديدة

## ✅ التعديلات المنفذة

### 1. إزالة قسم Pricing (الأسعار)
- تم حذف قسم "Choose Your Plan" بالكامل
- تم تحديث قائمة التنقل لإزالة رابط Pricing

### 2. تعديل Hero Section (القسم الرئيسي)
- **الفيديو الآن ثابت في الخلفية** - يعمل تلقائياً بدون صوت
- الفيديو يغطي كامل الشاشة مع overlay شفاف
- النصوص تظهر فوق الفيديو بشكل واضح
- تصميم احترافي مثل المواقع العالمية

### 3. إضافة Cilantro للشركات الموثوقة
- تم إضافة `Resource/cilantro.webp` لقسم Trusted By
- الشعارات تظهر في البداية مباشرة بعد Hero Section

### 4. تحسين قسم Team
- **جاهز لإضافة صور الفريق**
- ضع صور أعضاء الفريق في:
  - `Resource/team1.jpg`
  - `Resource/team2.jpg`
  - `Resource/team3.jpg`
  - `Resource/team4.jpg`
- عدّل الأسماء والمناصب في HTML مباشرة
- إذا لم تكن الصورة موجودة، سيظهر اللوجو الافتراضي

### 5. إضافة فيديوهات للخدمات
- كل خدمة الآن يمكن أن تحتوي على فيديو
- ضع الفيديوهات في المجلد الرئيسي:
  - `service1.mp4` - HR Management
  - `service2.mp4` - IT Infrastructure
  - `service3.mp4` - Accounting & Finance
  - `service4.mp4` - Quality Control
  - `service5.mp4` - Professional Design
  - `service6.mp4` - Marketing & Outreach
  - `service7.mp4` - Team Developers
  - `service8.mp4` - Inventory Management
  - `service9.mp4` - Call Center Setup
  - `service10.mp4` - Delivery Management
  - `service11.mp4` - Data Analysis
- الفيديو يظهر عند الضغط على الخدمة في Modal

### 6. تحسين اللوجو في Header
- اللوجو أكبر وأوضح (50x50px)
- إضافة ظل وحدود للوجو
- تأثير hover احترافي
- يعمل كرابط للعودة للصفحة الرئيسية

### 7. Live Visitors حقيقي
- **عداد الزوار الآن حقيقي 100%**
- يستخدم localStorage لتتبع الزوار
- يحذف الجلسات القديمة (أكثر من 5 دقائق)
- يتزامن بين التبويبات المفتوحة (BroadcastChannel)
- يحدث كل 10 ثوانٍ
- يعرض عدد الزوار الفعليين على الموقع

### 8. تحسينات الموبايل
- **تصميم متجاوب 100%** مع جميع الشاشات
- قائمة الهامبرجر محسّنة:
  - روابط أكبر وأوضح
  - خلفية glass لكل رابط
  - سهولة في الضغط
  - إغلاق تلقائي عند اختيار رابط
- الأزرار أكبر وأسهل في الضغط
- النصوص واضحة وقابلة للقراءة
- الفيديو يتكيف مع حجم الشاشة
- جميع العناصر متناسقة على الموبايل

## 📁 الملفات المطلوبة

### صور الفريق (اختياري)
```
Resource/
  ├── team1.jpg
  ├── team2.jpg
  ├── team3.jpg
  └── team4.jpg
```

### فيديوهات الخدمات (اختياري)
```
service1.mp4
service2.mp4
service3.mp4
service4.mp4
service5.mp4
service6.mp4
service7.mp4
service8.mp4
service9.mp4
service10.mp4
service11.mp4
```

### صورة Cilantro (مطلوب)
```
Resource/
  └── cilantro.webp
```

## 🎨 كيفية تعديل معلومات الفريق

افتح `index.html` وابحث عن قسم Team، ثم عدّل:

```html
<div class="team-info">
  <h3>اسم العضو</h3>
  <p>المنصب الوظيفي</p>
</div>
```

## 🚀 الميزات الجديدة

### 1. Hero Video Background
- فيديو بخلفية كاملة
- يعمل تلقائياً بدون صوت
- overlay احترافي
- متجاوب مع جميع الشاشات

### 2. Real-Time Visitor Counter
- عداد حقيقي للزوار
- يستخدم تقنيات متقدمة:
  - localStorage للتخزين
  - sessionStorage للجلسات
  - BroadcastChannel للتزامن
- تحديث تلقائي كل 10 ثوانٍ

### 3. Service Videos
- فيديو لكل خدمة
- يظهر في Modal عند الضغط
- تشغيل يدوي (controls)
- تصميم احترافي

### 4. Enhanced Mobile Experience
- قائمة هامبرجر محسّنة
- أزرار أكبر
- نصوص واضحة
- تجربة سلسة

## 📱 اختبار التجاوب

الموقع متجاوب مع:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px)
- ✅ Tablet (768px)
- ✅ Mobile (480px)
- ✅ Small Mobile (320px)

## 🎯 ملاحظات مهمة

1. **الفيديو الرئيسي**: تأكد أن `Resource/foundix.mp4` موجود
2. **صورة Cilantro**: ضع `Resource/cilantro.webp` في المجلد
3. **صور الفريق**: اختياري - إذا لم تكن موجودة سيظهر اللوجو
4. **فيديوهات الخدمات**: اختياري - إذا لم تكن موجودة لن يظهر فيديو

## 🔧 التخصيص

### تغيير الألوان
عدّل في `style.css` في قسم `:root`:
```css
--primary: #6366f1;
--secondary: #8b5cf6;
--accent: #ec4899;
```

### تغيير الخطوط
عدّل في `style.css`:
```css
--font-primary: 'Inter', sans-serif;
--font-display: 'Space Grotesk', sans-serif;
```

## 📞 الدعم

إذا كنت بحاجة لأي تعديلات إضافية، يمكنك:
1. تعديل HTML مباشرة للنصوص
2. تعديل CSS للألوان والتنسيقات
3. تعديل JavaScript للوظائف

---

**تم التطوير بواسطة Foundix Team** 🚀
