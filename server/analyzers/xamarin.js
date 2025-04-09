// analyzers/xamarin.js - محلل كود Xamarin
const fs = require('fs');
const path = require('path');
const { parseFiles, findPatterns, countLines } = require('../utils/codeParser');

/**
 * تحليل كود Xamarin
 */
async function analyzeCode(repoPath) {
    // البحث عن ملفات C#
    const csharpFiles = await parseFiles(repoPath, '.cs');

    // تحليل ملفات XAML
    const xamlFiles = await parseFiles(repoPath, '.xaml');

    // تحليل ملفات المشروع
    const csprojFiles = await parseFiles(repoPath, '.csproj');

    // تحليل نقاط القوة
    const strengths = [];

    // التحقق من استخدام MVVM pattern
    if (findPatterns(csharpFiles, ['ViewModel', 'INotifyPropertyChanged', 'PropertyChanged'])) {
        strengths.push('استخدام نمط MVVM لفصل المنطق عن واجهة المستخدم');
    }

    // التحقق من استخدام Dependency Injection
    if (findPatterns(csharpFiles, ['IServiceProvider', 'ServiceCollection', 'DependencyService'])) {
        strengths.push('استخدام حقن التبعيات (DI) لتحسين قابلية الاختبار والصيانة');
    }

    // التحقق من استخدام الاختبارات
    if (findPatterns(csharpFiles, ['TestFixture', '[Test]', 'Assert.', 'Mock<'])) {
        strengths.push('تنفيذ اختبارات الوحدة');
    }

    // التحقق من التعامل مع منصات متعددة
    if (findPatterns(csharpFiles, ['OnPlatform', 'Device.RuntimePlatform', '#if __IOS__', '#if __ANDROID__'])) {
        strengths.push('استخدام آليات التمييز بين المنصات لتحسين تجربة المستخدم');
    }

    // تحليل نقاط الضعف
    const weaknesses = [];

    // التحقق من استخدام الأكواد السحرية
    if (findPatterns(csharpFiles, ['\"[A-Z0-9]{10,}\"'])) {
        weaknesses.push('استخدام أكواد سحرية قد تسبب صعوبة في الصيانة');
    }

    // التحقق من نقص التعليقات
    if (!checkAdequateComments(csharpFiles)) {
        weaknesses.push('نقص التعليقات في الأجزاء المعقدة من الكود');
    }

    // التحقق من طول الدوال
    if (findLongMethods(csharpFiles)) {
        weaknesses.push('وجود دوال طويلة جدًا تحتاج إلى تقسيم');
    }

    // تحليل مشاكل الأداء
    const performanceIssues = analyzePerformanceIssues(csharpFiles);

    // تحليل مشاكل الذاكرة
    const memoryIssues = analyzeMemoryIssues(csharpFiles);

    // تحليل مشاكل البطارية
    const batteryIssues = analyzeBatteryIssues(csharpFiles);

    // تحليل مشاكل الأمان
    const securityIssues = analyzeSecurityIssues(csharpFiles);

    // حساب الدرجة الإجمالية
    const score = calculateScore(strengths, weaknesses, performanceIssues, memoryIssues, batteryIssues, securityIssues);

    // إنشاء التوصيات
    const recommendations = generateRecommendations(weaknesses, performanceIssues, memoryIssues, batteryIssues, securityIssues);

    return {
        score,
        strengths,
        weaknesses,
        performanceIssues,
        memoryIssues,
        batteryIssues,
        securityIssues,
        recommendations
    };
}

/**
 * فحص التعليقات الكافية في الكود
 */
function checkAdequateComments(csharpFiles) {
    // حساب نسبة التعليقات إلى الكود
    let totalLines = 0;
    let commentLines = 0;

    for (const file of csharpFiles) {
        const lines = file.content.split('\n');
        totalLines += lines.length;

        for (const line of lines) {
            if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
                commentLines++;
            }
        }
    }

    // نسبة التعليقات يجب أن تكون على الأقل 10%
    return commentLines / totalLines >= 0.1;
}

/**
 * البحث عن الدوال الطويلة
 */
function findLongMethods(csharpFiles) {
    for (const file of csharpFiles) {
        const methodRegex = /(?:public|private|protected|internal)\s+(?:async\s+)?[\w<>]+\s+(\w+)\s*\([^)]*\)\s*(?:=>\s*[^;]+;|{)/g;
        let match;

        while ((match = methodRegex.exec(file.content)) !== null) {
            const methodName = match[1];
            const methodStart = match.index + match[0].length;
            let braceCount = match[0].endsWith('{') ? 1 : 0;
            let methodEnd = methodStart;

            if (braceCount === 0) {
                // Lambda expression method
                continue;
            }

            // Find the end of the method by matching braces
            for (let i = methodStart; i < file.content.length; i++) {
                if (file.content[i] === '{') braceCount++;
                else if (file.content[i] === '}') braceCount--;

                if (braceCount === 0) {
                    methodEnd = i;
                    break;
                }
            }

            const methodContent = file.content.substring(methodStart, methodEnd);
            const lines = methodContent.split('\n').length;

            if (lines > 50) {
                return true;
            }
        }
    }

    return false;
}

/**
 * تحليل مشاكل الأداء في Xamarin
 */
function analyzePerformanceIssues(csharpFiles) {
    const issues = [];

    // التحقق من استخدام UI Thread بشكل مفرط
    if (findPatterns(csharpFiles, ['Device.BeginInvokeOnMainThread', 'MainThread.BeginInvokeOnMainThread'])) {
        issues.push('استخدام مفرط لعمليات UI Thread قد يؤثر على سلاسة الواجهة');
    }

    // التحقق من استخدام ListView بدلاً من CollectionView
    if (findPatterns(csharpFiles, ['ListView']) && !findPatterns(csharpFiles, ['CollectionView'])) {
        issues.push('استخدام ListView بدلاً من CollectionView للقوائم، مما قد يؤثر على الأداء');
    }

    // التحقق من عدم استخدام Caching للصور
    if (findPatterns(csharpFiles, ['Image']) && !findPatterns(csharpFiles, ['CachedImage', 'FFImageLoading'])) {
        issues.push('عدم استخدام آليات تخزين مؤقت للصور مثل FFImageLoading');
    }

    // التحقق من استدعاءات شبكية غير متزامنة
    if (findPatterns(csharpFiles, ['HttpClient', 'WebClient']) && !findPatterns(csharpFiles, ['await', 'async'])) {
        issues.push('استخدام استدعاءات شبكية متزامنة قد تؤدي إلى تجميد الواجهة');
    }

    return issues;
}

/**
 * تحليل مشاكل الذاكرة في Xamarin
 */
function analyzeMemoryIssues(csharpFiles) {
    const issues = [];

    // التحقق من تسريبات الذاكرة المحتملة من الـ Event Handlers
    if (findPatterns(csharpFiles, ['+='], 0, ['-='])) {
        issues.push('احتمالية تسرب ذاكرة بسبب عدم إلغاء اشتراك Event Handlers');
    }

    // التحقق من استخدام IDisposable بشكل صحيح
    if (findPatterns(csharpFiles, ['IDisposable'], 0, ['Dispose()', 'using'])) {
        issues.push('عدم التخلص من الموارد بشكل صحيح من خلال Dispose أو using');
    }

    // التحقق من استخدام static بشكل مفرط
    if (findPatterns(csharpFiles, ['static\\s+(?:readonly\\s+)?(?:List|Dictionary|ObservableCollection)'])) {
        issues.push('استخدام مفرط للمجموعات الثابتة (static collections) مما قد يسبب تسرب ذاكرة');
    }

    // التحقق من الاحتفاظ بالصور الكبيرة
    if (findPatterns(csharpFiles, ['BitmapImage', 'SKBitmap'], 0, ['Dispose'])) {
        issues.push('عدم التخلص من موارد الصور الكبيرة بعد الانتهاء منها');
    }

    return issues;
}

/**
 * تحليل مشاكل البطارية في Xamarin
 */
function analyzeBatteryIssues(csharpFiles) {
    const issues = [];

    // التحقق من استخدام استشعار الموقع بشكل مستمر
    if (findPatterns(csharpFiles, ['GetLastKnownLocation', 'RequestLocationUpdates', 'CLLocationManager'])) {
        issues.push('استخدام خدمات الموقع بشكل مستمر يستهلك البطارية');
    }

    // التحقق من استخدام مؤقتات بفترات قصيرة
    if (findPatterns(csharpFiles, ['Timer\\(\\s*\\d+\\s*\\)', 'Interval\\s*=\\s*\\d+'])) {
        issues.push('استخدام مؤقتات بفترات قصيرة يستهلك البطارية');
    }

    // التحقق من استخدام Animation غير ضروري
    if (findPatterns(csharpFiles, ['Animation', 'Animate', 'FadeIn', 'TranslateTo'])) {
        issues.push('استخدام مفرط للرسومات المتحركة قد يؤثر على استهلاك البطارية');
    }

    // التحقق من استخدام التزامن المستمر
    if (findPatterns(csharpFiles, ['Timer', 'Thread.Sleep', 'Task.Delay\\(\\s*\\d{1,3}\\s*\\)'])) {
        issues.push('استخدام مهام متكررة بفترات زمنية قصيرة يستهلك البطارية');
    }

    return issues;
}

/**
 * تحليل مشاكل الأمان في Xamarin
 */
function analyzeSecurityIssues(csharpFiles) {
    const issues = [];

    // التحقق من تخزين بيانات حساسة كنص واضح
    if (findPatterns(csharpFiles, ['password', 'api_key', 'secret', 'token'], 0, ['SecureStorage', 'Encrypt'])) {
        issues.push('تخزين بيانات حساسة كنص واضح بدلاً من استخدام SecureStorage');
    }

    // التحقق من استخدام HTTP بدلًا من HTTPS
    if (findPatterns(csharpFiles, ['http://'])) {
        issues.push('استخدام بروتوكول HTTP غير الآمن بدلاً من HTTPS');
    }

    // التحقق من استخدام SQL غير المحصن
    if (findPatterns(csharpFiles, ['ExecuteQuery\\s*\\(\\s*\"', 'rawQuery\\s*\\(\\s*\"'])) {
        issues.push('استخدام استعلامات SQL مباشرة مما قد يعرض التطبيق لهجمات حقن SQL');
    }

    // التحقق من استخدام Certificate Pinning
    if (!findPatterns(csharpFiles, ['ServicePointManager', 'ServerCertificateCustomValidationCallback', 'TrustManager'])) {
        issues.push('عدم استخدام تثبيت الشهادة (Certificate Pinning) قد يعرض التطبيق لهجمات Man-In-The-Middle');
    }

    return issues;
}

/**
 * حساب النتيجة الإجمالية بناءً على المشاكل المكتشفة
 */
function calculateScore(strengths, weaknesses, performanceIssues, memoryIssues, batteryIssues, securityIssues) {
    // نقطة البداية هي 100
    let score = 100;

    // إضافة نقاط لنقاط القوة (بحد أقصى 20 نقطة إضافية)
    score += Math.min(strengths.length * 4, 20);

    // خصم نقاط للمشاكل المختلفة
    score -= weaknesses.length * 5;
    score -= performanceIssues.length * 6;
    score -= memoryIssues.length * 7;
    score -= batteryIssues.length * 6;
    score -= securityIssues.length * 8;  // المشاكل الأمنية لها وزن أكبر

    // التأكد من أن النتيجة في النطاق 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * إنشاء توصيات بناءً على المشاكل المكتشفة
 */
function generateRecommendations(weaknesses, performanceIssues, memoryIssues, batteryIssues, securityIssues) {
    const recommendations = [];

    // إضافة توصيات للمشاكل المكتشفة
    if (weaknesses.length > 0) {
        recommendations.push(`تحسين هيكل الكود: ${weaknesses[0]}`);
    }

    if (performanceIssues.length > 0) {
        recommendations.push(`تحسين الأداء: ${performanceIssues[0]}`);
    }

    if (memoryIssues.length > 0) {
        recommendations.push(`تقليل استخدام الذاكرة: ${memoryIssues[0]}`);
    }

    if (batteryIssues.length > 0) {
        recommendations.push(`تحسين عمر البطارية: ${batteryIssues[0]}`);
    }

    if (securityIssues.length > 0) {
        recommendations.push(`تحسين الأمان: ${securityIssues[0]}`);
    }

    return recommendations;
}

/**
 * تحليل الأداء في تطبيقات Xamarin
 */
async function analyzePerformance(repoPath) {
    // البحث عن ملفات C#
    const csharpFiles = await parseFiles(repoPath, '.cs');

    // تحليل مشاكل الأداء
    const issues = analyzePerformanceIssues(csharpFiles);

    // حساب درجة الأداء
    const score = 100 - (issues.length * 10);

    return {
        score: Math.max(0, Math.min(100, score)),
        issues
    };
}

/**
 * تحليل استخدام الذاكرة في تطبيقات Xamarin
 */
async function analyzeMemory(repoPath) {
    // البحث عن ملفات C#
    const csharpFiles = await parseFiles(repoPath, '.cs');

    // تحليل مشاكل الذاكرة
    const issues = analyzeMemoryIssues(csharpFiles);

    // حساب درجة استخدام الذاكرة
    const score = 100 - (issues.length * 10);

    return {
        score: Math.max(0, Math.min(100, score)),
        issues
    };
}

/**
 * تحليل استهلاك البطارية في تطبيقات Xamarin
 */
async function analyzeBattery(repoPath) {
    // البحث عن ملفات C#
    const csharpFiles = await parseFiles(repoPath, '.cs');

    // تحليل مشاكل البطارية
    const issues = analyzeBatteryIssues(csharpFiles);

    // حساب درجة استهلاك البطارية
    const score = 100 - (issues.length * 10);

    return {
        score: Math.max(0, Math.min(100, score)),
        issues
    };
}

/**
 * تحليل الأمان في تطبيقات Xamarin
 */
async function analyzeSecurity(repoPath) {
    // البحث عن ملفات C#
    const csharpFiles = await parseFiles(repoPath, '.cs');

    // تحليل مشاكل الأمان
    const issues = analyzeSecurityIssues(csharpFiles);

    // حساب درجة الأمان
    const score = 100 - (issues.length * 12);

    return {
        score: Math.max(0, Math.min(100, score)),
        issues
    };
}

module.exports = {
    analyzeCode,
    analyzePerformance,
    analyzeMemory,
    analyzeBattery,
    analyzeSecurity
};