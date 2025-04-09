
// analyzers/index.js - مؤشر المحللات
const flutterAnalyzer = require('./flutter');
const reactNativeAnalyzer = require('./reactNative');
const xamarinAnalyzer = require('./xamarin');
const nativeAndroidAnalyzer = require('./nativeAndroid');
const nativeIOSAnalyzer = require('./nativeIOS');

async function analyzeCode(repoPath, framework) {
    switch (framework) {
        case 'Flutter':
            return flutterAnalyzer.analyzeCode(repoPath);
        case 'React Native':
            return reactNativeAnalyzer.analyzeCode(repoPath);
        case 'Xamarin':
            return xamarinAnalyzer.analyzeCode(repoPath);
        case 'Native Android':
            return nativeAndroidAnalyzer.analyzeCode(repoPath);
        case 'Native iOS':
            return nativeIOSAnalyzer.analyzeCode(repoPath);
        default:
            // محلل افتراضي للإطارات غير المعروفة
            return defaultAnalyzer.analyzeCode(repoPath);
    }
}

async function analyzePerformance(repoPath, framework) {
    switch (framework) {
        case 'Flutter':
            return flutterAnalyzer.analyzePerformance(repoPath);
        case 'React Native':
            return reactNativeAnalyzer.analyzePerformance(repoPath);
        // ... المزيد من المحللات
        default:
            return defaultAnalyzer.analyzePerformance(repoPath);
    }
}

async function analyzeMemory(repoPath, framework) {
    switch (framework) {
        case 'Flutter':
            return flutterAnalyzer.analyzeMemory(repoPath);
        case 'React Native':
            return reactNativeAnalyzer.analyzeMemory(repoPath);
        // ... المزيد من المحللات
        default:
            return defaultAnalyzer.analyzeMemory(repoPath);
    }
}

async function analyzeBattery(repoPath, framework) {
    switch (framework) {
        case 'Flutter':
            return flutterAnalyzer.analyzeBattery(repoPath);
        case 'React Native':
            return reactNativeAnalyzer.analyzeBattery(repoPath);
        // ... المزيد من المحللات
        default:
            return defaultAnalyzer.analyzeBattery(repoPath);
    }
}

async function analyzeSecurity(repoPath, framework) {
    switch (framework) {
        case 'Flutter':
            return flutterAnalyzer.analyzeSecurity(repoPath);
        case 'React Native':
            return reactNativeAnalyzer.analyzeSecurity(repoPath);
        // ... المزيد من المحللات
        default:
            return defaultAnalyzer.analyzeSecurity(repoPath);
    }
}

module.exports = {
    analyzeCode,
    analyzePerformance,
    analyzeMemory,
    analyzeBattery,
    analyzeSecurity
};