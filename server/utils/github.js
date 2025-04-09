// utils/github.js - أدوات التعامل مع GitHub
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function downloadRepository(repoUrl) {
    try {
        // إنشاء مجلد مؤقت
        const tempDir = path.join(os.tmpdir(), `repo-${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        // استنساخ المستودع
        execSync(`git clone ${repoUrl} ${tempDir}`, { stdio: 'ignore' });

        return tempDir;
    } catch (error) {
        console.error('خطأ في تنزيل المستودع:', error);
        throw new Error('فشل في تنزيل المستودع من GitHub');
    }
}

async function detectFramework(repoPath) {
    // التحقق من نوع إطار العمل بناءً على الملفات الموجودة

    // Flutter
    if (fs.existsSync(path.join(repoPath, 'pubspec.yaml'))) {
        return 'Flutter';
    }

    // React Native
    if (
        fs.existsSync(path.join(repoPath, 'package.json')) &&
        JSON.parse(fs.readFileSync(path.join(repoPath, 'package.json'), 'utf8')).dependencies['react-native']
    ) {
        return 'React Native';
    }

    // Xamarin
    if (fs.existsSync(path.join(repoPath, '*.csproj'))) {
        const csprojContent = fs.readFileSync(path.join(repoPath, '*.csproj'), 'utf8');
        if (csprojContent.includes('Xamarin')) {
            return 'Xamarin';
        }
    }

    // Native Android
    if (fs.existsSync(path.join(repoPath, 'app/build.gradle'))) {
        return 'Native Android';
    }

    // Native iOS
    if (fs.existsSync(path.join(repoPath, '*.xcodeproj'))) {
        return 'Native iOS';
    }

    // لم يتم التعرف على الإطار
    return 'Unknown';
}

module.exports = { downloadRepository, detectFramework };