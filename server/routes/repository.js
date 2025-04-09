

// routes/repository.js - مسارات للتعامل مع المستودعات
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { queueAnalysis, getAnalysisStatus } = require('../services/queue');
const Report = require('../models/Report');

const router = express.Router();

// تحليل مستودع جديد
router.post('/analyze', authMiddleware, async (req, res) => {
    try {
        const { repoUrl } = req.body;

        // التحقق من صحة URL
        if (!repoUrl || !repoUrl.includes('github.com')) {
            return res.status(400).json({ error: 'رابط مستودع GitHub غير صالح' });
        }

        // التحقق مما إذا كان قد تم تحليل هذا المستودع مسبقًا
        const existingReport = await Report.findOne({
            repoUrl,
            userId: req.user.userId,
            analysisDate: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // في آخر 24 ساعة
        });

        if (existingReport) {
            return res.status(200).json({
                message: 'تم تحليل هذا المستودع مسبقًا',
                reportId: existingReport._id,
                redirect: true
            });
        }

        // إضافة المهمة لقائمة الانتظار
        const jobId = await queueAnalysis(repoUrl, req.user.userId);

        res.status(202).json({
            message: 'تم تقديم طلب التحليل بنجاح',
            jobId
        });
    } catch (error) {
        console.error('خطأ في طلب تحليل المستودع:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
    }
});

// الحصول على حالة التحليل
router.get('/status/:jobId', authMiddleware, async (req, res) => {
    try {
        const { jobId } = req.params;
        const status = await getAnalysisStatus(jobId);

        res.json({ status });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ أثناء التحقق من حالة المهمة' });
    }
});

// الحصول على قائمة المستودعات التي تم تحليلها
router.get('/', authMiddleware, async (req, res) => {
    try {
        const repositories = await Report.find({ userId: req.user.userId })
            .sort({ analysisDate: -1 })
            .select('repoName repoUrl framework analysisDate codeQuality');

        res.json({ repositories });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ أثناء استرداد قائمة المستودعات' });
    }
});

module.exports = router;







