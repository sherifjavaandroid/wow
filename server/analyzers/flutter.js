// analyzers/flutter.js - محلل كود Flutter
const fs = require('fs');
const path = require('path');
const { parseFiles, findPatterns, countLines } = require('../utils/codeParser');

/**
 * تحليل كود Flutter
 */
async function analyzeCode(repoPath) {
    // البحث عن ملفات Dart
    const dartFiles = await parseFiles(repoPath, '.dart');

    // تحليل ملف pubspec.yaml للتعرف على الاعتماديات
    const dependencies = await analyzePubspec(repoPath);

    // تحليل نقاط القوة
    const strengths = [];

    // التحقق من استخدام BLoC pattern
    if (findPatterns(dartFiles, ['BlocProvider', 'BlocBuilder', 'BlocListener']) || dependencies.includes('flutter_bloc')) {
        strengths.push('استخدام نمط BLoC لإدارة الحالة بشكل فعال');
    }

    // التحقق من استخدام Provider
    if (findPatterns(dartFiles, ['ChangeNotifierProvider', 'Consumer<']) || dependencies.includes('provider')) {
        strengths.push('استخدام Provider لإدارة حالة التطبيق');
    }

    // التحقق من استخدام الاختبارات
    if (findPatterns(dartFiles, ['test(', 'testWidgets(', 'group(']) || await hasDirectory(repoPath, ['test'])) {
        strengths.push('تنفيذ اختبارات الوحدة والواجهة');
    }

    // التحقق من هيكل التطبيق
    if (await hasGoodProjectStructure(repoPath)) {
        strengths.push('هيكل ملفات منظم وموجه للميزات');
    }

    // التحقق من استخدام Widgets المخصصة
    if (findPatterns(dartFiles, ['extends StatelessWidget', 'extends StatefulWidget'], 5)) {
        strengths.push('استخدام Widgets مخصصة قابلة لإعادة الاستخدام');
    }

    // التحقق من التوطين
    if (findPatterns(dartFiles, ['MaterialApp(', 'localizationsDelegates']) || dependencies.includes('flutter_localizations')) {
        strengths.push('دعم للتوطين وتعدد اللغات');
    }

    // تحليل نقاط الضعف
    const weaknesses = [];

    // التحقق من تداخل الـ Widgets
    if (findExcessiveWidgetNesting(dartFiles)) {
        weaknesses.push('تداخل مفرط للـ Widgets يؤثر على قابلية القراءة والصيانة');
    }

    // التحقق من نقص التعليقات
    if (!checkAdequateComments(dartFiles)) {
        weaknesses.push('نقص التعليقات في الأجزاء المعقدة من الكود');
    }

    // التحقق من استخدام الموارد
    if (findLargeAssets(repoPath)) {
        weaknesses.push('استخدام صور وموارد كبيرة الحجم دون تحسين');
    }

    // التحقق من استخدام الـ StatefulWidget
    if (findExcessiveStatefulWidgets(dartFiles)) {
        weaknesses.push('استخدام مفرط للـ StatefulWidget بدلاً من StatelessWidget');
    }

    // تحليل مشاكل الأداء
    const performanceIssues = await analyzePerformanceIssues(dartFiles, repoPath);

    // تحليل مشاكل الذاكرة
    const memoryIssues = analyzeMemoryIssues(dartFiles);

    // تحليل مشاكل البطارية
    const batteryIssues = analyzeBatteryIssues(dartFiles);

    // تحليل مشاكل الأمان
    const securityIssues = analyzeSecurityIssues(dartFiles);

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
 * تحليل ملف pubspec.yaml للتعرف على الاعتماديات
 */
async function analyzePubspec(repoPath) {
    try {
        const pubspecPath = path.join(repoPath, 'pubspec.yaml');
        if (!fs.existsSync(pubspecPath)) {
            return [];
        }

        const pubspecContent = await fs.promises.readFile(pubspecPath, 'utf8');

        // استخراج الاعتماديات من ملف pubspec.yaml
        const dependenciesMatch = pubspecContent.match(/dependencies:([\s\S]*?)(?:dev_dependencies:|flutter:|$)/);

        if (!dependenciesMatch) {
            return [];
        }

        const dependenciesSection = dependenciesMatch[1];
        const dependencyRegex = /^\s+([a-zA-Z0-9_]+):/gm;

        const dependencies = [];
        let match;

        while ((match = dependencyRegex.exec(dependenciesSection)) !== null) {
            dependencies.push(match[1]);
        }

        return dependencies;
    } catch (error) {
        console.error('خطأ في تحليل ملف pubspec.yaml:', error);
        return [];
    }
}

/**
 * فحص تداخل الـ Widgets المفرط
 */
function findExcessiveWidgetNesting(dartFiles) {
    // البحث عن تداخل أكثر من 5 مستويات من الـ Widgets
    const nestedWidgetsPattern = /(?:Container|Column|Row|Stack|Padding)\(\s*child:\s*(?:Container|Column|Row|Stack|Padding)\(\s*child:\s*(?:Container|Column|Row|Stack|Padding)\(\s*child:\s*(?:Container|Column|Row|Stack|Padding)\(\s*child:\s*(?:Container|Column|Row|Stack|Padding)\(/;

    return dartFiles.some(file => nestedWidgetsPattern.test(file.content));
}

/**
 * فحص التعليقات الكافية في الكود
 */
function checkAdequateComments(dartFiles) {
    // حساب نسبة التعليقات إلى الكود
    let totalLines = 0;
    let commentLines = 0;

    for (const file of dartFiles) {
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
 * البحث عن الموارد كبيرة الحجم
 */
async function findLargeAssets(repoPath) {
    try {
        const assetsDir = path.join(repoPath, 'assets');
        if (!fs.existsSync(assetsDir)) {
            return false;
        }

        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        const largeImages = [];

        async function scanDirectory(directory) {
            const entries = await fs.promises.readdir(directory, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(directory, entry.name);

                if (entry.isDirectory()) {
                    await scanDirectory(fullPath);
                } else if (imageExtensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
                    const stats = await fs.promises.stat(fullPath);
                    // تحقق من حجم الصورة (أكبر من 200KB)
                    if (stats.size > 200 * 1024) {
                        largeImages.push(entry.name);
                    }
                }
            }
        }

        await scanDirectory(assetsDir);

        return largeImages.length > 0;
    } catch (error) {
        console.error('خطأ في فحص الموارد الكبيرة:', error);
        return false;
    }
}

/**
 * فحص استخدام StatefulWidget المفرط
 */
function findExcessiveStatefulWidgets(dartFiles) {
    let statefulCount = 0;
    let statelessCount = 0;

    for (const file of dartFiles) {
        const statefulMatches = file.content.match(/class\s+\w+\s+extends\s+StatefulWidget/g);
        const statelessMatches = file.content.match(/class\s+\w+\s+extends\s+StatelessWidget/g);

        statefulCount += statefulMatches ? statefulMatches.length : 0;
        statelessCount += statelessMatches ? statelessMatches.length : 0;
    }

    // إذا كان أكثر من 60% من الـ Widgets هي StatefulWidget، فهذا يمكن اعتباره مفرطًا
    return statefulCount > 0 && statefulCount / (statefulCount + statelessCount) > 0.6;
}

/**
 * تحليل مشاكل الأداء في Flutter
 */
async function analyzePerformanceIssues(dartFiles, repoPath) {
    const issues = [];

    // البحث عن استخدام setState في وظائف مكلفة
    if (findPatterns(dartFiles, ['setState\\(\\(\\)\\s*{[\\s\\S]*?for\\s*\\('])) {
        issues.push('استخدام setState داخل حلقات تكرارية يؤثر على الأداء');
    }

    // البحث عن استخدام غير فعال للقوائم
    if (findPatterns(dartFiles, ['ListView\\(']) && !findPatterns(dartFiles, ['ListView\\.builder'])) {
        issues.push('استخدام ListView بدلاً من ListView.builder للقوائم الديناميكية');
    }

    // البحث عن رسم متكرر
    if (findPatterns(dartFiles, ['markNeedsBuild', 'markNeedsLayout'])) {
        issues.push('استدعاء متكرر لـ markNeedsBuild أو markNeedsLayout');
    }

    // البحث عن استدعاء الشبكة في onScroll
    if (findPatterns(dartFiles, ['onScroll', 'fetch', 'http.get'])) {
        issues.push('تنفيذ طلبات الشبكة في مستمعي التمرير');
    }

    // فحص الصور المضمنة
    const pubspecPath = path.join(repoPath, 'pubspec.yaml');
    if (fs.existsSync(pubspecPath)) {
        const pubspecContent = await fs.promises.readFile(pubspecPath, 'utf8');
        if (!pubspecContent.includes('cached_network_image')) {
            issues.push('عدم استخدام cached_network_image لتخزين الصور مؤقتًا');
        }
    }

    return issues;
}

/**
 * تحليل مشاكل الذاكرة في Flutter
 */
function analyzeMemoryIssues(dartFiles) {
    const issues = [];

    // البحث عن تسريبات محتملة للمراقبين
    if (findPatterns(dartFiles, ['addListener', 'initState']) && !findPatterns(dartFiles, ['removeListener', 'dispose'])) {
        issues.push('احتمال تسرب ذاكرة بسبب عدم إزالة المستمعين في dispose');
    }

    // البحث عن استخدام مفرط للتخزين المؤقت
    if (findPatterns(dartFiles, ['cache', 'cached'])) {
        issues.push('استخدام مفرط للتخزين المؤقت قد يستهلك الذاكرة');
    }

    // البحث عن عدم التخلص من الموارد
    if (findPatterns(dartFiles, ['initState']) && !findPatterns(dartFiles, ['dispose'])) {
        issues.push('عدم تنفيذ dispose للتخلص من الموارد');
    }

    // البحث عن تسرب الموارد الخارجية
    if (findPatterns(dartFiles, ['Camera', 'File', 'Socket']) && !findPatterns(dartFiles, ['close', 'dispose'])) {
        issues.push('عدم إغلاق الموارد الخارجية مثل الكاميرا أو الملفات أو الاتصالات');
    }

    return issues;
}

/**
 * تحليل مشاكل البطارية في Flutter
 */
function analyzeBatteryIssues(dartFiles) {
    const issues = [];

    // البحث عن استخدام مفرط لخدمات الموقع
    if (findPatterns(dartFiles, ['Geolocator', 'LocationServices', 'getCurrentPosition'])) {
        issues.push('استخدام خدمات الموقع بشكل مستمر يستهلك البطارية');
    }

    // البحث عن مؤقتات متكررة
    if (findPatterns(dartFiles, ['Timer.periodic'])) {
        issues.push('استخدام Timer.periodic بدون آلية توقف مؤقت عند عدم الاستخدام');
    }

    // البحث عن استعلامات متكررة لقاعدة البيانات
    if (findPatterns(dartFiles, ['query', 'select', 'from', 'database'])) {
        issues.push('استعلامات متكررة لقاعدة البيانات في الخلفية');
    }

    // البحث عن خدمات الخلفية
    if (findPatterns(dartFiles, ['BackgroundFetch', 'WorkManager', 'BackgroundService'])) {
        issues.push('استخدام خدمات الخلفية بدون تحسين استهلاك البطارية');
    }

    return issues;
}

/**
 * تحليل مشاكل الأمان في Flutter
 */
function analyzeSecurityIssues(dartFiles) {
    const issues = [];

    // البحث عن تخزين البيانات الحساسة
    if (findPatterns(dartFiles, ['password', 'token', 'key', 'secret']) && !findPatterns(dartFiles, ['encrypt', 'hash', 'FlutterSecureStorage'])) {
        issues.push('تخزين بيانات حساسة دون تشفير أو استخدام FlutterSecureStorage');
    }

    // البحث عن استخدام بيانات اعتماد ثابتة
    if (findPatterns(dartFiles, ['const\\s+.*API_KEY', 'const\\s+.*SECRET', 'const\\s+.*PASSWORD'])) {
        issues.push('استخدام بيانات اعتماد API ثابتة في الكود');
    }

    // البحث عن نقص التحقق من صحة المدخلات
    if (findPatterns(dartFiles, ['TextFormField', 'TextField']) && !findPatterns(dartFiles, ['validator'])) {
        issues.push('نقص التحقق من صحة المدخلات في نماذج المستخدم');
    }

    // البحث عن استخدام WebView غير آمن
    if (findPatterns(dartFiles, ['WebView']) && !findPatterns(dartFiles, ['javascriptMode: JavascriptMode.disabled'])) {
        issues.push('استخدام WebView دون إعدادات الأمان المناسبة');
    }

    // البحث عن عدم استخدام HTTPS
    if (findPatterns(dartFiles, ['http://', 'HttpClient']) && !findPatterns(dartFiles, ['https://'])) {
        issues.push('استخدام HTTP بدلاً من HTTPS للاتصالات الشبكية');
    }

    return issues;
}

/**
 * التحقق من هيكل المشروع الجيد
 */
async function hasGoodProjectStructure(repoPath) {
    try {
        // التحقق من وجود هيكل موجه للميزات
        const libDir = path.join(repoPath, 'lib');
        if (!fs.existsSync(libDir)) {
            return false;
        }

        const libEntries = await fs.promises.readdir(libDir, { withFileTypes: true });

        // البحث عن مجلدات مثل models، views، controllers، screens، widgets، services
        const expectedFolders = ['models', 'views', 'screens', 'widgets', 'services', 'utils', 'providers', 'blocs'];

        const existingFolders = libEntries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name.toLowerCase());

        // إذا وجدنا على الأقل 3 من المجلدات المتوقعة، فهذا يشير إلى هيكل جيد
        return expectedFolders.filter(folder => existingFolders.includes(folder)).length >= 3;
    } catch (error) {
        console.error('خطأ في التحقق من هيكل المشروع:', error);
        return false;
    }
}

/**
 * التحقق من وجود مجلد
 */
async function hasDirectory(repoPath, dirNames) {
    try {
        for (const dirName of dirNames) {
            const dirPath = path.join(repoPath, dirName);
            if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('خطأ في التحقق من وجود المجلد:', error);
        return false;
    }
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
 * تحليل الأداء في تطبيقات Flutter
 */
async function analyzePerformance(repoPath) {
    // البحث عن ملفات Dart
    const dartFiles = await parseFiles(repoPath, '.dart');

    // تحليل مشاكل الأداء
    const issues = await analyzePerformanceIssues(dartFiles, repoPath);

    // حساب درجة الأداء
    const score = calculatePerformanceScore(issues, dartFiles);

    return {
        score,
        issues
    };
}

/**
 * حساب درجة الأداء
 */
function calculatePerformanceScore(issues, files) {
    // درجة الأساس هي 100
    let score = 100;

    // خصم نقاط لكل مشكلة أداء (وزن أكبر للمشاكل الأكثر خطورة)
    score -= issues.length * 8;

    // خصم نقاط إضافية للملفات الكبيرة جدًا
    const largeFiles = files.filter(file => file.content.length > 10000);
    score -= largeFiles.length * 3;

    // التأكد من أن النتيجة في النطاق 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * تحليل استخدام الذاكرة في تطبيقات Flutter
 */
async function analyzeMemory(repoPath) {
    // البحث عن ملفات Dart
    const dartFiles = await parseFiles(repoPath, '.dart');

    // تحليل مشاكل الذاكرة
    const issues = analyzeMemoryIssues(dartFiles);

    // حساب درجة استخدام الذاكرة
    const score = calculateMemoryScore(issues, dartFiles);

    return {
        score,
        issues
    };
}

/**
 * حساب درجة استخدام الذاكرة
 */
function calculateMemoryScore(issues, files) {
    // درجة الأساس هي 100
    let score = 100;

    // خصم نقاط لكل مشكلة ذاكرة
    score -= issues.length * 10;

    // التأكد من أن النتيجة في النطاق 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * تحليل استهلاك البطارية في تطبيقات Flutter
 */
async function analyzeBattery(repoPath) {
    // البحث عن ملفات Dart
    const dartFiles = await parseFiles(repoPath, '.dart');

    // تحليل مشاكل البطارية
    const issues = analyzeBatteryIssues(dartFiles);

    // حساب درجة استهلاك البطارية
    const score = calculateBatteryScore(issues, dartFiles);

    return {
        score,
        issues
    };
}

/**
 * حساب درجة استهلاك البطارية
 */
function calculateBatteryScore(issues, files) {
    // درجة الأساس هي 100
    let score = 100;

    // خصم نقاط لكل مشكلة بطارية
    score -= issues.length * 10;

    // التأكد من أن النتيجة في النطاق 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * تحليل الأمان في تطبيقات Flutter
 */
async function analyzeSecurity(repoPath) {
    // البحث عن ملفات Dart
    const dartFiles = await parseFiles(repoPath, '.dart');

    // تحليل مشاكل الأمان
    const issues = analyzeSecurityIssues(dartFiles);

    // حساب درجة الأمان
    const score = calculateSecurityScore(issues, dartFiles);

    return {
        score,
        issues
    };
}

/**
 * حساب درجة الأمان
 */
function calculateSecurityScore(issues, files) {
    // درجة الأساس هي 100
    let score = 100;

    // خصم نقاط لكل مشكلة أمان (وزن أكبر للمشاكل الأمنية)
    score -= issues.length * 12;

    // التأكد من أن النتيجة في النطاق 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = {
    analyzeCode,
    analyzePerformance,
    analyzeMemory,
    analyzeBattery,
    analyzeSecurity
};