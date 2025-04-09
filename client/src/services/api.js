// src/services/api.js - خدمة API للتواصل مع الخلفية
import axios from 'axios';

// إنشاء نسخة من Axios مع الإعدادات الافتراضية
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// سيتم إضافة المعترضات لاحقًا بعد تصدير الكائن
export default api;

// سيتم استيراد الدوال من ملف auth.js وإضافتها للمعترضات
// بعد تصدير api لتجنب مشكلة الاعتمادية الدائرية