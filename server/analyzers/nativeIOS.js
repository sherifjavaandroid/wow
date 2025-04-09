// analyzers/nativeIOS.js - محلل كود iOS الأصلي
const fs = require('fs');
const path = require('path');
const { parseFiles, findPatterns, countLines } = require('../utils/codeParser');

/**
 * تحليل كود iOS الأصلي
 */
async function analyzeCode(repoPath) {
    // البحث عن ملفات Swift و Objective-C
    const swiftFiles = await parseFiles(repoPath, '.swift');
    const objcFiles = await parseFiles(repoPath, ['.m', '.h']);

    // دمج جميع ملفات الكود
    const codeFiles = [...swiftFiles, ...objcFiles];

    // تحليل نقاط القوة
    const strengths = [];

    // التحقق من استخدام معمارية MVVM أو MVC
    if (findPatterns(codeFiles, ['ViewModel', 'Controller'])) {
        strengths.push('استخدام معمارية MVVM أو MVC لفصل المنطق عن واجهة المستخدم');
    }

    // التحقق من استخدام SwiftUI
    if (findPatterns(swiftFiles, ['SwiftUI', 'View', 'struct\\s+\\w+\\s*:\\s*View'])) {
        strengths.push('استخدام SwiftUI لبناء واجهات المستخدم الحديثة');
    }

    // التحقق من استخدام Combine
    if (findPatterns(swiftFiles, ['Combine', 'Publisher', 'subscribe'])) {
        strengths.push('استخدام Combine للبرمجة التفاعلية وإدارة تدفق البيانات');
    }

    // التحقق من استخدام CoreData
    if (findPatterns(codeFiles, ['CoreData', 'NSManagedObject', 'NSPersistentContainer'])) {
        strengths.push('استخدام CoreData لإدارة قاعدة البيانات المحلية');
    }

    // التحقق من استخدام Swift Concurrency
    if (findPatterns(swiftFiles, ['async', 'await', 'Task'])) {
        strengths.push('استخدام Swift Concurrency للبرمجة المتزامنة بشكل آمن');
    }

    // تحليل نقاط الضعف
    const weaknesses = [];

    // التحقق من استخدام مؤشرات غير آمنة
    if (findPatterns(codeFiles, ['unsafe', 'UnsafePointer', 'UnsafeMutablePointer'])) {
        weaknesses.push('استخدام مؤشرات غير آمنة قد يؤدي إلى أخطاء في إدارة الذاكرة');
    }

    // التحقق من نقص التعليقات
    if (!checkAdequateComments(codeFiles)) {
        weaknesses.push('نقص التعليقات في الأجزاء المعقدة من الكود');
    }

    // التحقق من استخدام force unwrapping في Swift
    if (findPatterns(swiftFiles, ['!\\s*\\)'])) {
        weaknesses.push('استخدام مفرط لـ force unwrapping في Swift مما قد يسبب أخطاء وقت التشغيل');
    }

    // التحقق من استخدام localization
    if (!checkLocalization(codeFiles, repoPath)) {
        weaknesses.push('عدم استخدام ملفات الترجمة (localization) للنصوص');
    }

    // تحليل مشاكل الأداء
    const performanceIssues = analyzePerformanceIssues(codeFiles);

    // تحليل مشاكل الذاكرة
    const memoryIssues = analyzeMemoryIssues(codeFiles);

    // تحليل مشاكل البطارية
    const batteryIssues = analyzeBatteryIssues(codeFiles);

    // تحليل مشاكل الأمان
    const securityIssues = analyzeSecurityIssues(codeFiles);

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
function checkAdequateComments(codeFiles) {
    // حساب نسبة التعليقات إلى الكود
    let totalLines = 0;
    let commentLines = 0;

    for (const file of codeFiles) {
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
 * التحقق من استخدام الترجمة
 */
function checkLocalization(codeFiles, repoPath) {
    // التحقق من وجود ملفات الترجمة
    const stringsDir = path.join(repoPath, 'Localizable.strings');
    const localizableDirExists = fs.existsSync(stringsDir);

    // التحقق من استخدام وظائف الترجمة
    const usesNSLocalizedString = findPatterns(codeFiles, ['NSLocalizedString', 'String.localized']);

    return localizableDirExists || usesNSLocalizedString;
}

/**
 * تحليل مشاكل الأداء في تطبيقات iOS
 */
function analyzePerformanceIssues(codeFiles) {
    const issues = [];

    // التحقق من استخدام عمليات مكلفة في Main Thread
    if (findPatterns(codeFiles, ['DispatchQueue.main.async', 'viewDidLoad', 'viewWillAppear']) &&
        findPatterns(codeFiles, ['for\\s*\\(', 'while\\s*\\(', '\\.data', '\\.load', 'UIImage\\('])) {
        issues.push('تنفيذ عمليات مكلفة في واجهة المستخدم الرئيسية (Main Thread)');
    }

    // التحقق من استخدام reuse للخلايا
    if (findPatterns(codeFiles, ['UITableView', 'UICollectionView']) &&
        !findPatterns(codeFiles, ['dequeueReusableCell', 'dequeueReusableCellWithIdentifier'])) {
        issues.push('عدم استخدام إعادة استخدام الخلايا في TableView/CollectionView');
    }

    // التحقق من عدم استخدام تخزين مؤقت للصور
    if (findPatterns(codeFiles, ['UIImage']) &&
        !findPatterns(codeFiles, ['NSCache', 'Kingfisher', 'SDWebImage'])) {
        issues.push('عدم استخدام آلية للتخزين المؤقت للصور');
    }

    // التحقق من عدم استخدام lazy loading
    if (findPatterns(codeFiles, ['UIImageView']) &&
        !findPatterns(codeFiles, ['lazy\\s+var', 'URLSession'])) {
        issues.push('عدم استخدام التحميل الكسول (lazy loading) للموارد');
    }

    return issues;
}

/**
 * تحليل مشاكل الذاكرة في تطبيقات iOS
 */
function analyzeMemoryIssues(codeFiles) {
    const issues = [];

    // التحقق من دورات الاحتفاظ (retain cycles)
    if (!findPatterns(codeFiles, ['\\[weak self\\]', '\\[unowned self\\]', 'weak var', 'weak let']) &&
        findPatterns(codeFiles, ['\\{\\s*\\(', '\\{\\s*_', '\\{\\s*self'])) {
        issues.push('احتمال وجود دورات احتفاظ (retain cycles) في إغلاقات (closures) باستخدام self');
    }

    // التحقق من تسريبات الذاكرة في الإشعارات
    if (findPatterns(codeFiles, ['addObserver', 'NotificationCenter']) &&
        !findPatterns(codeFiles, ['removeObserver'])) {
        issues.push('عدم إلغاء تسجيل المراقبين من NotificationCenter مما قد يسبب تسرب الذاكرة');
    }

    // التحقق من استخدام AutoreleasePool
    if (findPatterns(codeFiles, ['for\\s+\\w+\\s+in\\s+\\d+\\.\\.<\\d+'] &&
        !findPatterns(codeFiles, ['autoreleasepool']))) {
        issues.push('عدم استخدام autorelease pool في الحلقات الكبيرة');
    }

    // التحقق من تسريبات المؤشرات في Objective-C
    if (findPatterns(objcFiles, ['alloc', 'new']) &&
        !findPatterns(objcFiles, ['release', 'autorelease', 'ARC'])) {
        issues.push('احتمال تسرب ذاكرة في كود Objective-C غير مدار تلقائيًا');
    }

    return issues;
}

/**
 * تحليل مشاكل البطارية في تطبيقات iOS
 */
function analyzeBatteryIssues(codeFiles) {
    const issues = [];

    // التحقق من استخدام تتبع الموقع المستمر
    if (findPatterns(codeFiles, ['CLLocationManager', 'startUpdatingLocation']) &&
        !findPatterns(codeFiles, ['stopUpdatingLocation', 'pausesLocationUpdatesAutomatically'])) {
        issues.push('استخدام خدمات الموقع بشكل مستمر دون توقف مما يستهلك البطارية');
    }

    // التحقق من استخدام المؤقتات بشكل مفرط
    if (findPatterns(codeFiles, ['Timer.scheduledTimer', 'NSTimer', 'setInterval']) &&
        findPatterns(codeFiles, ['\\d+\\.\\d+'])) {
        issues.push('استخدام مؤقتات متكررة بفترات قصيرة');
    }

    // التحقق من عمليات تحديث الواجهة المتكررة
    if (findPatterns(codeFiles, ['setNeedsDisplay', 'setNeedsLayout', 'layoutIfNeeded'])) {
        issues.push('استدعاء متكرر لتحديث واجهة المستخدم مما يزيد من استهلاك البطارية');
    }

    // التحقق من طلبات الشبكة المتكررة
    if (findPatterns(codeFiles, ['URLSession', 'dataTask', 'uploadTask']) &&
        findPatterns(codeFiles, ['DispatchQueue.global', 'OperationQueue'])) {
        issues.push('تنفيذ طلبات شبكة متعددة في الخلفية');
    }

    return issues;
}

/**
 * تحليل مشاكل الأمان في تطبيقات iOS
 */
function analyzeSecurityIssues(codeFiles) {
    const issues = [];

    // التحقق من تخزين البيانات الحساسة
    if (findPatterns(codeFiles, ['UserDefaults.standard', 'NSUserDefaults']) &&
        findPatterns(codeFiles, ['password', 'token', 'key', 'secret'])) {
        issues.push('تخزين بيانات حساسة في UserDefaults بدلاً من Keychain');
    }

    // التحقق من استخدام HTTP بدلًا من HTTPS
    if (findPatterns(codeFiles, ['http://'])) {
        issues.push('استخدام بروتوكول HTTP غير الآمن بدلاً من HTTPS');
    }

    // التحقق من استخدام SQL غير المحصن
    if (findPatterns(codeFiles, ['executeQuery', 'executeUpdate']) &&
        findPatterns(codeFiles, ['String\\(format:'])) {
        issues.push('استخدام استعلامات SQL مباشرة مما قد يعرض التطبيق لهجمات حقن SQL');
    }

    // التحقق من استخدام ATS
    if (findPatterns(codeFiles, ['NSAppTransportSecurity']) &&
        findPatterns(codeFiles, ['NSAllowsArbitraryLoads'])) {
        issues.push('تعطيل App Transport Security (ATS) مما يسمح بالاتصالات غير الآمنة');
    }

    return issues;
}

/**
 * حساب النتيجة الإجمالية بناءً على المشاكل المكتشفة
 */
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
    const allIssues = [
        ...weaknesses.map(issue => ({ text: issue, type: 'weakness', priority: 1 })),
        ...performanceIssues.map(issue => ({ text: issue, type: 'performance', priority: 2 })),
        ...memoryIssues.map(issue => ({ text: issue, type: 'memory', priority: 2 })),
        ...batteryIssues.map(issue => ({ text: issue, type: 'battery', priority: 2 })),
        ...securityIssues.map(issue => ({ text: issue, type: 'security', priority: 3 }))
    ];

    // ترتيب المشاكل حسب الأولوية
    const sortedIssues = allIssues.sort((a, b) => b.priority - a.priority);

    // إنشاء توصيات للمشاكل الأعلى أولوية
    const recommendations = sortedIssues.slice(0, 10).map(issue => {
        switch (issue.type) {
            case 'weakness':
                return `تحسين: ${issue.text}`;
            case 'performance':
                return `لتحسين الأداء: معالجة ${issue.text}`;
            case 'memory':
                return `لتقليل استخدام الذاكرة: معالجة ${issue.text}`;
            case 'battery':
                return `لتحسين عمر البطارية: معالجة ${issue.text}`;
            case 'security':
                return `للتحسين الأمني: معالجة ${issue.text}`;
            default:
                return issue.text;
        }
    });

    return recommendations;
}

/**
 * تحليل الأداء في تطبيقات iOS
 */
async function analyzePerformance(repoPath) {
    // البحث عن ملفات Swift و Objective-C
    const swiftFiles = await parseFiles(repoPath, '.swift');
    const objcFiles = await parseFiles(repoPath, ['.m', '.h']);

    // دمج جميع ملفات الكود
    const codeFiles = [...swiftFiles, ...objcFiles];

    // تحليل مشاكل الأداء
    const issues = analyzePerformanceIssues(codeFiles);

    // حساب درجة الأداء
    const score = 100 - (issues.length * 10);

    return {
        score: Math.max(0, Math.min(100, score)),
        issues
    };
}

/**
 * تحليل استخدام الذاكرة في تطبيقات iOS
 */
async function analyzeMemory(repoPath) {
    // البحث عن ملفات Swift و Objective-C
    const swiftFiles = await parseFiles(repoPath, '.swift');
    const objcFiles = await parseFiles(repoPath, ['.m', '.h']);

    // دمج جميع ملفات الكود
    const codeFiles = [...swiftFiles, ...objcFiles];

    // تحليل مشاكل الذاكرة
    const issues = analyzeMemoryIssues(codeFiles);

    // حساب درجة استخدام الذاكرة
    const score = 100 - (issues.length * 10);

    return {
        score: Math.max(0, Math.min(100, score)),
        issues
    };
}

/**
 * تحليل استهلاك البطارية في تطبيقات iOS
 */
async function analyzeBattery(repoPath) {
    // البحث عن ملفات Swift و Objective-C
    const swiftFiles = await parseFiles(repoPath, '.swift');
    const objcFiles = await parseFiles(repoPath, ['.m', '.h']);

    // دمج جميع ملفات الكود
    const codeFiles = [...swiftFiles, ...objcFiles];

    // تحليل مشاكل البطارية
    const issues = analyzeBatteryIssues(codeFiles);

    // حساب درجة استهلاك البطارية
    const score = 100 - (issues.length * 10);

    return {
        score: Math.max(0, Math.min(100, score)),
        issues
    };
}

/**
 * تحليل الأمان في تطبيقات iOS
 */
async function analyzeSecurity(repoPath) {
    // البحث عن ملفات Swift و Objective-C
    const swiftFiles = await parseFiles(repoPath, '.swift');
    const objcFiles = await parseFiles(repoPath, ['.m', '.h']);

    // دمج جميع ملفات الكود
    const codeFiles = [...swiftFiles, ...objcFiles];

    // تحليل مشاكل الأمان
    const issues = analyzeSecurityIssues(codeFiles);

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