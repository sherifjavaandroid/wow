// analyzers/reactNative.js - محلل كود React Native
const fs = require('fs');
const path = require('path');
const { parseFiles, findPatterns, countLines } = require('../utils/codeParser');

/**
 * تحليل كود React Native
 */
async function analyzeCode(repoPath) {
    // البحث عن ملفات JavaScript و JSX
    const jsFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx']);

    // تحليل نقاط القوة
    const strengths = [];

    // التحقق من استخدام Redux
    if (findPatterns(jsFiles, ['createStore', 'useReducer', 'Provider', 'connect'])) {
        strengths.push('استخدام Redux لإدارة حالة التطبيق بشكل فعال');
    }

    // التحقق من استخدام الـ Hooks
    if (findPatterns(jsFiles, ['useState', 'useEffect', 'useCallback', 'useMemo'])) {
        strengths.push('استخدام React Hooks لكتابة كود أكثر وضوحًا وأقل تعقيدًا');
    }

    // التحقق من استخدام الـ TypeScript
    if (await hasFiles(repoPath, ['.ts', '.tsx'])) {
        strengths.push('استخدام TypeScript للتحقق الثابت من الأنواع وتحسين قابلية الصيانة');
    }

    // التحقق من وجود اختبارات
    if (findPatterns(jsFiles, ['test(', 'describe(', 'it(', 'expect(']) || await hasDirectory(repoPath, ['__tests__', 'tests'])) {
        strengths.push('تنفيذ اختبارات للمكونات والوظائف');
    }

    // التحقق من استخدام التنقل
    if (findPatterns(jsFiles, ['createStackNavigator', 'createBottomTabNavigator', 'NavigationContainer'])) {
        strengths.push('استخدام React Navigation لتنظيم هيكل التطبيق');
    }

    // تحليل نقاط الضعف
    const weaknesses = [];

    // التحقق من المكونات الكبيرة جدًا
    const largeComponents = findLargeComponents(jsFiles);
    if (largeComponents.length > 0) {
        weaknesses.push('وجود مكونات كبيرة جدًا تحتاج إلى تقسيم: ' + largeComponents.join(', '));
    }

    // التحقق من كثرة التعليق الشرطي
    if (findPatterns(jsFiles, ['console.log', 'console.warn', 'console.error'], 10)) {
        weaknesses.push('استخدام مفرط لـ console.log يجب إزالته في الإنتاج');
    }

    // التحقق من استخدام الـ inline styles
    if (findPatterns(jsFiles, ['style={{'], 20)) {
        weaknesses.push('استخدام مفرط للأنماط المضمنة بدلاً من StyleSheet');
    }

    // تحليل مشاكل الأداء
    const performanceIssues = analyzePerformanceIssues(jsFiles);

    // تحليل مشاكل الذاكرة
    const memoryIssues = analyzeMemoryIssues(jsFiles);

    // تحليل مشاكل البطارية
    const batteryIssues = analyzeBatteryIssues(jsFiles);

    // تحليل مشاكل الأمان
    const securityIssues = analyzeSecurityIssues(jsFiles);

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
 * تحليل مشاكل الأداء في React Native
 */
function analyzePerformanceIssues(jsFiles) {
    const issues = [];

    // التحقق من استخدام مكرر للدوال في الـ render
    if (findPatterns(jsFiles, ['render(', '=>', 'function('], 5)) {
        issues.push('تعريف الدوال داخل دالة render يتسبب في إعادة إنشائها مع كل تحديث');
    }

    // التحقق من عدم استخدام PureComponent أو React.memo
    if (!findPatterns(jsFiles, ['PureComponent', 'React.memo'])) {
        issues.push('عدم استخدام PureComponent أو React.memo لتجنب عمليات التصيير غير الضرورية');
    }

    // التحقق من عدم استخدام FlatList للقوائم الطويلة
    if (findPatterns(jsFiles, ['ScrollView'], 5) && !findPatterns(jsFiles, ['FlatList', 'VirtualizedList'], 5)) {
        issues.push('استخدام ScrollView بدلاً من FlatList للقوائم الطويلة');
    }

    // التحقق من عدم استخدام useCallback و useMemo
    if (!findPatterns(jsFiles, ['useCallback', 'useMemo'])) {
        issues.push('عدم استخدام useCallback و useMemo لتحسين الأداء وتجنب إعادة الرسم غير الضرورية');
    }

    // التحقق من استخدام setState في حلقات التكرار
    if (findPatterns(jsFiles, ['setState', 'for'])) {
        issues.push('استخدام setState داخل حلقات تكرارية يؤثر على الأداء');
    }

    return issues;
}

/**
 * تحليل مشاكل الذاكرة في React Native
 */
function analyzeMemoryIssues(jsFiles) {
    const issues = [];

    // التحقق من تسربات الذاكرة المحتملة في استخدام addEventListener
    if (findPatterns(jsFiles, ['addEventListener', '!removeEventListener'])) {
        issues.push('احتمال تسرب ذاكرة بسبب عدم إزالة مستمعي الأحداث');
    }

    // التحقق من استخدام مفرط للصور كبيرة الحجم
    if (findPatterns(jsFiles, ['Image', 'source={require'])) {
        issues.push('احتمال استخدام صور كبيرة الحجم دون تحسين');
    }

    // التحقق من استخدام useEffect دون تنظيف
    if (findPatterns(jsFiles, ['useEffect', '!return'])) {
        issues.push('استخدام useEffect دون تنفيذ دالة التنظيف قد يؤدي إلى تسرب الذاكرة');
    }

    // التحقق من عدم إلغاء الاشتراكات في الـ observable
    if (findPatterns(jsFiles, ['subscribe', '!unsubscribe'])) {
        issues.push('عدم إلغاء الاشتراكات في الـ observables (مثل RxJS) قد يؤدي إلى تسرب الذاكرة');
    }

    return issues;
}

/**
 * تحليل مشاكل البطارية في React Native
 */
function analyzeBatteryIssues(jsFiles) {
    const issues = [];

    // التحقق من استخدام مفرط لخدمات الموقع
    if (findPatterns(jsFiles, ['getCurrentPosition', 'watchPosition', 'Geolocation'])) {
        issues.push('استخدام خدمات الموقع بشكل مستمر يستهلك البطارية بسرعة');
    }

    // التحقق من استخدام مؤقتات متكررة
    if (findPatterns(jsFiles, ['setInterval'], 3)) {
        issues.push('استخدام مفرط لـ setInterval قد يؤدي إلى استنزاف البطارية');
    }

    // التحقق من الاتصالات الشبكية المتكررة
    if (findPatterns(jsFiles, ['fetch', 'axios', 'ajax'], 10)) {
        issues.push('عمليات شبكية متكررة قد تؤثر على استهلاك البطارية');
    }

    // التحقق من المزامنة الخلفية المفرطة
    if (findPatterns(jsFiles, ['BackgroundFetch', 'headless', 'background'])) {
        issues.push('استخدام مهام خلفية دون تحسين قد يؤدي إلى استنزاف البطارية');
    }

    return issues;
}

/**
 * تحليل مشاكل الأمان في React Native
 */
function analyzeSecurityIssues(jsFiles) {
    const issues = [];

    // التحقق من تخزين المعلومات الحساسة
    if (findPatterns(jsFiles, ['API_KEY', 'SECRET', 'PASSWORD', 'TOKEN'], 0, ['process.env'])) {
        issues.push('تخزين معلومات حساسة (مفاتيح API، كلمات مرور) بشكل مباشر في الكود');
    }

    // التحقق من استخدام eval أو مماثلاتها
    if (findPatterns(jsFiles, ['eval(', 'Function(', 'new Function'])) {
        issues.push('استخدام eval() أو دوال مماثلة تشكل مخاطر أمنية');
    }

    // التحقق من نقص التحقق من المدخلات
    if (findPatterns(jsFiles, ['fetch', 'axios.get', 'axios.post']) && !findPatterns(jsFiles, ['try', 'catch', 'validate'])) {
        issues.push('نقص التحقق من صحة المدخلات أو معالجة الأخطاء في طلبات الشبكة');
    }

    // التحقق من استخدام WebView غير آمن
    if (findPatterns(jsFiles, ['WebView']) && !findPatterns(jsFiles, ['originWhitelist'])) {
        issues.push('استخدام WebView دون قيود الأمان المناسبة');
    }

    return issues;
}

/**
 * العثور على المكونات الكبيرة التي تحتاج إلى تقسيم
 */
function findLargeComponents(jsFiles) {
    const largeComponents = [];

    for (const file of jsFiles) {
        const componentNames = extractComponentNames(file.content);
        for (const name of componentNames) {
            const componentCode = extractComponentCode(file.content, name);
            if (componentCode && countLines(componentCode) > 300) {
                largeComponents.push(name);
            }
        }
    }

    return largeComponents;
}

/**
 * استخراج أسماء المكونات من ملف
 */
function extractComponentNames(content) {
    const classComponentRegex = /class\s+(\w+)\s+extends\s+React\.Component/g;
    const funcComponentRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{/g;
    const arrowComponentRegex = /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g;

    const componentNames = [];
    let match;

    while ((match = classComponentRegex.exec(content)) !== null) {
        componentNames.push(match[1]);
    }

    while ((match = funcComponentRegex.exec(content)) !== null) {
        componentNames.push(match[1]);
    }

    while ((match = arrowComponentRegex.exec(content)) !== null) {
        componentNames.push(match[1]);
    }

    return componentNames;
}

/**
 * استخراج كود المكون من المحتوى
 */
function extractComponentCode(content, componentName) {
    const classRegex = new RegExp(`class\\s+${componentName}\\s+extends\\s+React\\.Component[\\s\\S]*?\\n\\}`, 'g');
    const funcRegex = new RegExp(`function\\s+${componentName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\}`, 'g');
    const arrowRegex = new RegExp(`const\\s+${componentName}\\s*=\\s*\\([^)]*\\)\\s*=>[\\s\\S]*?\\n\\}`, 'g');

    let match = classRegex.exec(content) || funcRegex.exec(content) || arrowRegex.exec(content);
    return match ? match[0] : null;
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
 * التحقق من وجود ملفات بامتدادات محددة
 */
async function hasFiles(repoPath, extensions) {
    try {
        const files = await fs.promises.readdir(repoPath, { recursive: true });
        return files.some(file => extensions.some(ext => file.endsWith(ext)));
    } catch (error) {
        console.error('خطأ في التحقق من وجود الملفات:', error);
        return false;
    }
}

/**
 * التحقق من وجود مجلدات محددة
 */
async function hasDirectory(repoPath, dirNames) {
    try {
        const directories = await fs.promises.readdir(repoPath, { withFileTypes: true });
        return directories
            .filter(dirent => dirent.isDirectory())
            .some(dir => dirNames.includes(dir.name));
    } catch (error) {
        console.error('خطأ في التحقق من وجود المجلدات:', error);
        return false;
    }
}

/**
 * تحليل الأداء في تطبيقات React Native
 */
async function analyzePerformance(repoPath) {
    // البحث عن ملفات JavaScript و JSX
    const jsFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx']);

    // تحليل مشاكل الأداء
    const issues = analyzePerformanceIssues(jsFiles);

    // حساب درجة الأداء
    const score = calculatePerformanceScore(issues, jsFiles);

    return {
        score,
        issues
    };
}

/**
 * تحليل استخدام الذاكرة في تطبيقات React Native
 */
async function analyzeMemory(repoPath) {
    // البحث عن ملفات JavaScript و JSX
    const jsFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx']);

    // تحليل مشاكل الذاكرة
    const issues = analyzeMemoryIssues(jsFiles);

    // حساب درجة استخدام الذاكرة
    const score = calculateMemoryScore(issues, jsFiles);

    return {
        score,
        issues
    };
}

/**
 * تحليل استهلاك البطارية في تطبيقات React Native
 */
async function analyzeBattery(repoPath) {
    // البحث عن ملفات JavaScript و JSX
    const jsFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx']);

    // تحليل مشاكل البطارية
    const issues = analyzeBatteryIssues(jsFiles);

    // حساب درجة استهلاك البطارية
    const score = calculateBatteryScore(issues, jsFiles);

    return {
        score,
        issues
    };
}

/**
 * تحليل الأمان في تطبيقات React Native
 */
async function analyzeSecurity(repoPath) {
    // البحث عن ملفات JavaScript و JSX
    const jsFiles = await parseFiles(repoPath, ['.js', '.jsx', '.ts', '.tsx']);

    // تحليل مشاكل الأمان
    const issues = analyzeSecurityIssues(jsFiles);

    // حساب درجة الأمان
    const score = calculateSecurityScore(issues, jsFiles);

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