// server.js - نقطة الدخول لخلفية النظام


require('dotenv').config();  // تأكد من تحميل متغيرات البيئة

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { analyzeRepository } = require('./services/analyzer');
const { queueAnalysis } = require('./services/queue');
const repoRouter = require('./routes/repository');
const reportRouter = require('./routes/report');
const authRouter = require('./routes/auth');

const app = express();

// إعدادات الوسيطة
app.use(cors());
app.use(express.json());

// توصيل بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('متصل بقاعدة البيانات'))
    .catch(err => console.error('خطأ في الاتصال بقاعدة البيانات:', err));

// المسارات
app.use('/api/auth', authRouter);
app.use('/api/repository', repoRouter);
app.use('/api/report', reportRouter);

// مسار API لتحليل مستودع جديد
app.post('/api/analyze', async (req, res) => {
    try {
        const { repoUrl } = req.body;

        // التحقق من صحة URL
        if (!repoUrl || !repoUrl.includes('github.com')) {
            return res.status(400).json({ error: 'رابط مستودع GitHub غير صالح' });
        }

        // إضافة المهمة لقائمة الانتظار
        const jobId = await queueAnalysis(repoUrl, req.user.id);

        res.status(202).json({
            message: 'تم تقديم طلب التحليل بنجاح',
            jobId
        });
    } catch (error) {
        console.error('خطأ في تحليل المستودع:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
    }
});

// مسار للتحقق من حالة التحليل
app.get('/api/analyze/status/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const status = await getAnalysisStatus(jobId);

        res.json({ status });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ أثناء التحقق من حالة المهمة' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});







