// models/Report.js - نموذج تقرير التحليل
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    repoUrl: {
        type: String,
        required: true
    },
    repoName: {
        type: String,
        required: true
    },
    framework: {
        type: String,
        required: true
    },
    analysisDate: {
        type: Date,
        default: Date.now
    },
    codeQuality: {
        type: Number,
        required: true
    },
    strengths: [String],
    weaknesses: [String],
    performance: {
        score: Number,
        issues: [String]
    },
    memory: {
        score: Number,
        issues: [String]
    },
    battery: {
        score: Number,
        issues: [String]
    },
    security: {
        score: Number,
        issues: [String]
    },
    recommendations: [String]
});

module.exports = mongoose.model('Report', ReportSchema);