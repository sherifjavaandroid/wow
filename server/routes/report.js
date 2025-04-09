// routes/report.js - مسارات للتعامل مع التقارير
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Report = require('../models/Report');

const router = express.Router();

// الحصول على تفاصيل تقرير محدد
router.get('/:reportId', authMiddleware, async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findOne({
            _id: reportId,
            userId: req.user.userId
        });

        if (!report) {
            return res.status(404).json({ error: 'التقرير غير موجود' });
        }

        res.json({ report });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ أثناء استرداد التقرير' });
    }
});

// الحصول على قائمة التقارير
router.get('/', authMiddleware, async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.user.userId })
            .sort({ analysisDate: -1 });

        res.json({ reports });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ أثناء استرداد قائمة التقارير' });
    }
});

// حذف تقرير
router.delete('/:reportId', authMiddleware, async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findOne({
            _id: reportId,
            userId: req.user.userId
        });

        if (!report) {
            return res.status(404).json({ error: 'التقرير غير موجود' });
        }

        await report.remove();

        res.json({ message: 'تم حذف التقرير بنجاح' });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ أثناء حذف التقرير' });
    }
});

module.exports = router;
