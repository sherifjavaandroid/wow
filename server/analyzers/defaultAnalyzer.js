// analyzers/defaultAnalyzer.js - محلل كود افتراضي للإطارات غير المدعومة بشكل خاص
const fs = require('fs');
const path = require('path');
const { parseFiles, findPatterns, countLines } = require('../utils/codeParser');

/**
 * تحليل افتراضي للكود
 */
async function analyzeCode(repoPath) {
    // البحث عن جميع ملفات الكود المدعومة
    const jsFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx']);
    const dartFiles = await parseFiles(repoPath, '.dart');
    const csharpFiles = await parseFiles(repoPath, '.cs');
    const javaFiles = await parseFiles(repoPath, '.java');
    const kotlinFiles = await parseFiles(repoPath, '.kt');
    const swiftFiles = await parseFiles(repoPath, '.swift');
    const objcFiles = await parseFiles(repoPath, ['.m', '.h']);
    const pythonFiles = await parseFiles(repoPath, '.py');
    const phpFiles = await parseFiles(repoPath, '.php');

    // دمج جميع ملفات الكود
    const codeFiles = [...jsFiles, ...dartFiles, ...csharpFiles, ...javaFiles, ...kotlinFiles, ...swiftFiles, ...objcFiles, ...pythonFiles, ...phpFiles];

    // البحث عن ملفات التكوين
    const configFiles = await parseFiles(repoPath, ['.json', '.yaml', '.yml', '.xml', '.config', '.properties']);

    // تحليل نقاط القوة
    const strengths = [];

    // التحقق من وجود اختبارات
    if (await hasTestFiles(repoPath)) {
        strengths.push('تنفيذ اختبارات للكود');
    }

    // التحقق من استخدام أدوات بناء / حزم
    if (await hasBuildTools(repoPath)) {
        strengths.push('استخدام أدوات بناء وتعليب للمشروع');
    }

    // التحقق من وجود وثائق
    if (await hasDocumentation(repoPath)) {
        strengths.push('توفير وثائق للكود والمشروع');
    }

    // التحقق من هيكل المشروع
    if (await hasGoodProjectStructure(repoPath)) {
        strengths.push('هيكل منظم للمشروع');
    }

    // تحليل نقاط الضعف
    const weaknesses = [];

    // التحقق من نقص التعليقات
    if (!checkAdequateComments(codeFiles)) {
        weaknesses.push('نقص التعليقات في الكود');
    }

    // التحقق من وجود دوال طويلة
    if (hasLongFunctions(codeFiles)) {
        weaknesses.push('وجود دوال طويلة جدًا تحتاج إلى تقسيم');
    }

    // التحقق من وجود تكرار في الكود
    if (hasCodeDuplication(codeFiles)) {
        weaknesses.push('وجود تكرار في الكود يمكن تحسينه');
    }

    // التحقق من ثبات أسلوب الكتابة
    if (!hasConsistentStyle(codeFiles)) {
        weaknesses.push('عدم اتساق أسلوب كتابة الكود');
    }

    // تحليل مشاكل الأداء
    const performanceIssues = analyzePerformanceIssues(codeFiles);

    // تحليل مشاكل الذاكرة
    const memoryIssues = analyzeMemoryIssues(codeFiles);

    // تحليل مشاكل البطارية
    const batteryIssues = analyzeBatteryIssues(codeFiles);

    // تحليل مشاكل الأمان
    const securityIssues = analyzeSecurityIssues(codeFiles, configFiles);

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
 * التحقق من وجود ملفات اختبار
 */
async function hasTestFiles(repoPath) {
    // البحث عن مجلدات الاختبار الشائعة
    const testDirs = ['test', 'tests', 'spec', 'specs', '__tests__'];
    for (const dir of testDirs) {
        const testDir = path.join(repoPath, dir);
        if (fs.existsSync(testDir) && fs.statSync(testDir).isDirectory()) {
            return true;
        }
    }

    // البحث عن ملفات اختبار
    const testFiles = await parseFiles(repoPath, ['.test.js', '.spec.js', 'Test.java', 'Test.kt', 'Test.swift', 'test_', 'spec_']);
    return testFiles.length > 0;
}

/**
 * التحقق من وجود أدوات بناء
 */
async function hasBuildTools(repoPath) {
    // البحث عن ملفات تكوين لأدوات البناء الشائعة
    const buildFiles = ['package.json', 'webpack.config.js', 'build.gradle', 'pom.xml', 'Makefile', 'CMakeLists.txt', 'Podfile', 'pubspec.yaml'];
    for (const file of buildFiles) {
        const filePath = path.join(repoPath, file);
        if (fs.existsSync(filePath)) {
            return true;
        }
    }

    return false;
}

/**
 * التحقق من وجود وثائق
 */
async function hasDocumentation(repoPath) {
    // البحث عن ملفات وثائق شائعة
    const docFiles = ['README.md', 'CONTRIBUTING.md', 'DOCUMENTATION.md', 'docs', 'doc', 'javadoc', 'doxygen'];
    for (const file of docFiles) {
        const filePath = path.join(repoPath, file);
        if (fs.existsSync(filePath)) {
            return true;
        }
    }

    // البحث عن تعليقات توثيق
    const codeFiles = await parseFiles(repoPath, ['.js', '.java', '.kt', '.swift', '.dart', '.cs', '.py', '.php']);
    for (const file of codeFiles) {
        if (file.content.includes('/**') || file.content.includes('///') || file.content.includes('"""')) {
            return true;
        }
    }

    return false;
}

/**
 * التحقق من وجود هيكل جيد للمشروع
 */
async function hasGoodProjectStructure(repoPath) {
    // البحث عن مجلدات هيكلية شائعة
    const structureDirs = ['src', 'lib', 'app', 'source', 'assets', 'resources', 'components', 'utils', 'helpers', 'models', 'controllers', 'views'];
    let dirCount = 0;

    for (const dir of structureDirs) {
        const dirPath = path.join(repoPath, dir);
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            dirCount++;
        }
    }

    // إذا وجدنا أكثر من 3 مجلدات هيكلية، نعتبر هذا هيكلًا جيدًا
    return dirCount >= 3;
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
            if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*') ||
                line.trim().startsWith('#') || line.trim().startsWith('///') || line.trim().startsWith('"""')) {
                commentLines++;
            }
        }
    }

    // نسبة التعليقات يجب أن تكون على الأقل 5%
    return totalLines > 0 ? (commentLines / totalLines) >= 0.05 : true;
}

/**
 * التحقق من وجود دوال طويلة
 */
function hasLongFunctions(codeFiles) {
    const maxFunctionLength = 100; // الحد الأقصى لعدد أسطر الدالة

    for (const file of codeFiles) {
        // تعبيرات منتظمة بسيطة للبحث عن تعريفات الدوال
        const funcRegexes = [
            /function\s+\w+\s*\([\s\S]*?\{[\s\S]*?\}/g,  // JavaScript/TypeScript
            /def\s+\w+\s*\([\s\S]*?\)[\s\S]*?:/g,        // Python
            /public\s+(?:static\s+)?(?:\w+\s+)+\w+\s*\([\s\S]*?\)[\s\S]*?\{[\s\S]*?\}/g, // Java/C#
            /func\s+\w+\s*\([\s\S]*?\)[\s\S]*?\{[\s\S]*?\}/g, // Swift
            /sub\s+\w+[\s\S]*?end\s+sub/gi,              // VB.NET
            /method\s+\w+[\s\S]*?endmethod/gi,           // ABAP
            /void\s+\w+\s*\([\s\S]*?\)[\s\S]*?\{[\s\S]*?\}/g // C/C++
        ];

        for (const regex of funcRegexes) {
            const matches = file.content.match(regex) || [];
            for (const match of matches) {
                const lineCount = match.split('\n').length;
                if (lineCount > maxFunctionLength) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * التحقق من وجود تكرار في الكود
 */
function hasCodeDuplication(codeFiles) {
    // هذه طريقة بسيطة جدًا للكشف عن التكرار
    // في تطبيق حقيقي، يجب استخدام خوارزمية أكثر تعقيدًا

    // البحث عن أنماط متكررة من الكود (تتابع 3 أسطر على الأقل مكررة)
    const segments = [];
    const minSegmentLength = 3;

    for (const file of codeFiles) {
        const lines = file.content.split('\n');

        for (let i = 0; i <= lines.length - minSegmentLength; i++) {
            const segment = lines.slice(i, i + minSegmentLength).join('\n');
            if (segment.trim().length > 50) { // تجاهل الأجزاء القصيرة جدًا
                segments.push(segment);
            }
        }
    }

    // البحث عن التكرار
    const uniqueSegments = new Set(segments);
    return uniqueSegments.size < segments.length * 0.9; // إذا كان هناك أكثر من 10% تكرار
}

/**
 * التحقق من اتساق أسلوب الكتابة
 */
function hasConsistentStyle(codeFiles) {
    // التحقق من اتساق المسافات البادئة
    let usesSpaces = 0;
    let usesTabs = 0;

    for (const file of codeFiles) {
        const lines = file.content.split('\n');

        for (const line of lines) {
            if (line.startsWith(' ')) usesSpaces++;
            if (line.startsWith('\t')) usesTabs++;
        }
    }

    // إذا كان المشروع يستخدم كلا النوعين من المسافات البادئة بكثرة، فهذا يشير إلى عدم اتساق
    const total = usesSpaces + usesTabs;
    if (total > 0) {
        const spacesRatio = usesSpaces / total;
        const tabsRatio = usesTabs / total;

        if (spacesRatio > 0.15 && tabsRatio > 0.15) {
            return false;
        }
    }

    return true;
}

/**
 * تحليل مشاكل الأداء العامة
 */
function analyzePerformanceIssues(codeFiles) {
    const issues = [];

    // البحث عن عمليات متكررة داخل حلقات
    if (findPatterns(codeFiles, ['for\\s*\\(.*\\)', 'while\\s*\\(.*\\)']) &&
        findPatterns(codeFiles, ['\\.[a-zA-Z]+\\(\\)', '\\.length', '\\.size\\(\\)'])) {
        issues.push('عمليات متكررة داخل حلقات يمكن تحسينها');
    }

    // البحث عن استخدام خوارزميات غير فعالة
    if (findPatterns(codeFiles, ['O\\(n\\^2\\)', 'nested\\s+for', 'for.*\\{[\\s\\S]*?for'])) {
        issues.push('استخدام خوارزميات ذات تعقيد زمني عالٍ');
    }

    // البحث عن استخدام DOM بشكل مفرط
    if (findPatterns(codeFiles, ['document\\.getElement', 'document\\.query', '\\$\\('])) {
        issues.push('استخدام مفرط لعمليات DOM قد تؤثر على الأداء');
    }

    return issues;
}

/**
 * تحليل مشاكل الذاكرة العامة
 */
function analyzeMemoryIssues(codeFiles) {
    const issues = [];

    // البحث عن تسريبات الذاكرة المحتملة
    if (findPatterns(codeFiles, ['addEventListener', 'addListener'], 0, ['removeEventListener', 'removeListener'])) {
        issues.push('احتمالية تسرب ذاكرة بسبب عدم إزالة مستمعي الأحداث');
    }

    // البحث عن كائنات كبيرة في الذاكرة
    if (findPatterns(codeFiles, ['new Array\\(\\d{5,}\\)', 'new \\w+\\[\\d{5,}\\]'])) {
        issues.push('إنشاء مصفوفات/كائنات كبيرة جدًا في الذاكرة');
    }

    // البحث عن عدم التخلص من الموارد
    if (findPatterns(codeFiles, ['open', 'connect', 'load'], 0, ['close', 'disconnect', 'dispose'])) {
        issues.push('عدم التخلص من الموارد بعد استخدامها');
    }

    return issues;
}

/**
 * تحليل مشاكل البطارية العامة
 */
function analyzeBatteryIssues(codeFiles) {
    const issues = [];

    // البحث عن استخدام خدمات الموقع
    if (findPatterns(codeFiles, ['getLocation', 'LocationManager', 'CLLocationManager', 'navigator\\.geolocation'])) {
        issues.push('استخدام خدمات الموقع التي قد تستهلك البطارية');
    }

    // البحث عن استخدام مؤقتات متكررة
    if (findPatterns(codeFiles, ['setInterval', 'setTimeout', 'Timer', 'NSTimer', 'DispatchQueue'])) {
        issues.push('استخدام مؤقتات قد تستهلك البطارية عند التكرار');
    }

    // البحث عن استخدام أجهزة استشعار
    if (findPatterns(codeFiles, ['Accelerometer', 'Gyroscope', 'Compass', 'Sensor'])) {
        issues.push('استخدام أجهزة استشعار قد تستهلك البطارية');
    }

    return issues;
}

/**
 * تحليل مشاكل الأمان العامة
 */
function analyzeSecurityIssues(codeFiles, configFiles) {
    const issues = [];

    // البحث عن بيانات اعتماد مضمنة
    if (findPatterns(codeFiles.concat(configFiles), ['api[_\\s]?key', 'password', 'secret', 'token'])) {
        issues.push('بيانات اعتماد مضمنة في الكود قد تشكل مخاطر أمنية');
    }

    // البحث عن استخدام تقنيات غير آمنة
    if (findPatterns(codeFiles, ['eval\\(', 'exec\\(', 'system\\(', 'dangerouslySetInnerHTML'])) {
        issues.push('استخدام وظائف غير آمنة مثل eval أو exec');
    }

    // البحث عن نقاط ضعف XSS
    if (findPatterns(codeFiles, ['innerHTML', 'document\\.write'])) {
        issues.push('احتمالية وجود ثغرات XSS باستخدام innerHTML أو document.write');
    }

    // البحث عن استخدام HTTP بدلًا من HTTPS
    if (findPatterns(codeFiles.concat(configFiles), ['http://'])) {
        issues.push('استخدام بروتوكول HTTP غير المشفر');
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
 * تحليل الأداء العام
 */
async function analyzePerformance(repoPath) {
    // البحث عن جميع ملفات الكود المدعومة
    const codeFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx', '.dart', '.cs', '.java', '.kt', '.swift', '.m', '.h', '.py', '.php']);

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
 * تحليل استخدام الذاكرة العام
 */
async function analyzeMemory(repoPath) {
    // البحث عن جميع ملفات الكود المدعومة
    const codeFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx', '.dart', '.cs', '.java', '.kt', '.swift', '.m', '.h', '.py', '.php']);

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
 * تحليل استهلاك البطارية العام
 */
async function analyzeBattery(repoPath) {
    // البحث عن جميع ملفات الكود المدعومة
    const codeFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx', '.dart', '.cs', '.java', '.kt', '.swift', '.m', '.h', '.py', '.php']);

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
 * تحليل الأمان العام
 */
async function analyzeSecurity(repoPath) {
    // البحث عن جميع ملفات الكود المدعومة
    const codeFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx', '.dart', '.cs', '.java', '.kt', '.swift', '.m', '.h', '.py', '.php']);

    // البحث عن ملفات التكوين
    const configFiles = await parseFiles(repoPath, ['.json', '.yaml', '.yml', '.xml', '.config', '.properties']);

    // تحليل مشاكل الأمان
    const issues = analyzeSecurityIssues(codeFiles, configFiles);

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