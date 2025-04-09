// services/analyzer.js - خدمة تحليل الكود
const { downloadRepository, detectFramework } = require('../utils/github');
const { analyzeCode, analyzePerformance, analyzeMemory, analyzeBattery, analyzeSecurity } = require('../analyzers');
const Report = require('../models/Report');

async function analyzeRepository(repoUrl, userId) {
    try {
        // تنزيل المستودع
        const repoPath = await downloadRepository(repoUrl);

        // الكشف عن إطار العمل
        const framework = await detectFramework(repoPath);

        // تحليل الكود بناءً على إطار العمل المكتشف
        const codeAnalysis = await analyzeCode(repoPath, framework);
        const performanceAnalysis = await analyzePerformance(repoPath, framework);
        const memoryAnalysis = await analyzeMemory(repoPath, framework);
        const batteryAnalysis = await analyzeBattery(repoPath, framework);
        const securityAnalysis = await analyzeSecurity(repoPath, framework);

        // إنشاء التقرير
        const report = new Report({
            userId,
            repoUrl,
            repoName: repoUrl.split('/').pop(),
            framework,
            analysisDate: new Date(),
            codeQuality: calculateOverallScore([
                codeAnalysis.score,
                performanceAnalysis.score,
                memoryAnalysis.score,
                batteryAnalysis.score,
                securityAnalysis.score
            ]),
            strengths: codeAnalysis.strengths,
            weaknesses: codeAnalysis.weaknesses,
            performance: {
                score: performanceAnalysis.score,
                issues: performanceAnalysis.issues
            },
            memory: {
                score: memoryAnalysis.score,
                issues: memoryAnalysis.issues
            },
            battery: {
                score: batteryAnalysis.score,
                issues: batteryAnalysis.issues
            },
            security: {
                score: securityAnalysis.score,
                issues: securityAnalysis.issues
            },
            recommendations: generateRecommendations([
                codeAnalysis,
                performanceAnalysis,
                memoryAnalysis,
                batteryAnalysis,
                securityAnalysis
            ])
        });

        await report.save();
        return report._id;
    } catch (error) {
        console.error('خطأ في تحليل المستودع:', error);
        throw error;
    }
}

function calculateOverallScore(scores) {
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function generateRecommendations(analyses) {
    const allRecommendations = analyses.flatMap(analysis => analysis.recommendations || []);

    // ترتيب التوصيات حسب الأهمية وإزالة المكررات
    return [...new Set(allRecommendations)]
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 10)
        .map(rec => rec.text);
}

module.exports = { analyzeRepository };