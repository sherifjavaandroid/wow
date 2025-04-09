
// middleware/auth.js - وسيط المصادقة
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // الحصول على رمز الوصول من رأس الطلب
    const token = req.header('x-auth-token');

    // التحقق من وجود الرمز
    if (!token) {
        return res.status(401).json({ error: 'تم رفض الوصول، لم يتم توفير رمز المصادقة' });
    }

    try {
        // التحقق من صحة الرمز
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // إضافة معرف المستخدم إلى الطلب
        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ error: 'رمز المصادقة غير صالح' });
    }
};

module.exports = { authMiddleware };