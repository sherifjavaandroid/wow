// services/queue.js - خدمة قائمة انتظار التحليل
const Queue = require('bull');
const { analyzeRepository } = require('./analyzer');

// إنشاء قائمة انتظار للتحليل باستخدام Redis
const analysisQueue = new Queue('code-analysis', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
});

// إضافة مهمة تحليل إلى القائمة
async function queueAnalysis(repoUrl, userId) {
    const job = await analysisQueue.add({
        repoUrl,
        userId
    }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        }
    });

    return job.id;
}

// الحصول على حالة المهمة
async function getAnalysisStatus(jobId) {
    const job = await analysisQueue.getJob(jobId);

    if (!job) {
        return { status: 'not_found' };
    }

    const state = await job.getState();
    const progress = job._progress;

    return {
        id: job.id,
        status: state,
        progress: progress || 0,
        createdAt: job.processedOn,
        finishedAt: job.finishedOn,
        failedReason: job.failedReason
    };
}

// معالجة المهام في القائمة
analysisQueue.process(async (job) => {
    const { repoUrl, userId } = job.data;

    job.progress(10);
    console.log(`بدء تحليل المستودع: ${repoUrl} للمستخدم: ${userId}`);

    try {
        // تنزيل وتحليل المستودع
        job.progress(20);
        const reportId = await analyzeRepository(repoUrl, userId);

        job.progress(100);
        return { success: true, reportId };
    } catch (error) {
        console.error(`فشل تحليل المستودع: ${repoUrl}`, error);
        throw new Error(`فشل تحليل المستودع: ${error.message}`);
    }
});

// الاستماع لأحداث القائمة
analysisQueue.on('completed', (job, result) => {
    console.log(`تم اكتمال مهمة التحليل #${job.id} لـ ${job.data.repoUrl}`);
});

analysisQueue.on('failed', (job, error) => {
    console.error(`فشلت مهمة التحليل #${job.id} لـ ${job.data.repoUrl}`, error);
});

module.exports = { queueAnalysis, getAnalysisStatus };