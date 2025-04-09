// analyzers/nativeAndroid.js - محلل كود Android الأصلي
const fs = require('fs');
const path = require('path');
const { parseFiles, findPatterns, countLines } = require('../utils/codeParser');

/**
 * تحليل كود Android الأصلي
 */
async function analyzeCode(repoPath) {
    // البحث عن ملفات Java و Kotlin
    const javaFiles = await parseFiles(repoPath, '.java');
    const kotlinFiles = await parseFiles(repoPath, '.kt');

    // دمج جميع ملفات الكود
    const codeFiles = [...javaFiles, ...kotlinFiles];

    // تحليل ملفات الموارد
    const xmlFiles = await parseFiles(repoPath, '.xml');

    // تحليل نقاط القوة
    const strengths = [];

    // التحقق من استخدام معمارية MVVM أو MVP
    if (findPatterns(codeFiles, ['ViewModel', 'LiveData', 'Presenter'])) {
        strengths.push('استخدام معمارية MVVM أو MVP لفصل المنطق عن واجهة المستخدم');
    }

    // التحقق من استخدام Dependency Injection
    if (findPatterns(codeFiles, ['@Inject', 'Dagger', 'Hilt', 'koin'])) {
        strengths.push('استخدام حقن التبعيات (DI) لتحسين قابلية الاختبار والصيانة');
    }

    // التحقق من استخدام Jetpack Compose
    if (findPatterns(kotlinFiles, ['@Composable', 'setContent'])) {
        strengths.push('استخدام Jetpack Compose لبناء واجهات المستخدم الحديثة');
    }

    // التحقق من استخدام Room Database
    if (findPatterns(codeFiles, ['@Entity', '@Dao', 'RoomDatabase'])) {
        strengths.push('استخدام Room Database للتعامل الآمن مع قواعد البيانات');
    }

    // التحقق من استخدام Kotlin Coroutines
    if (findPatterns(kotlinFiles, ['suspend', 'coroutineScope', 'launch', 'async'])) {
        strengths.push('استخدام Kotlin Coroutines للبرمجة المتزامنة بشكل فعال');
    }

    // تحليل نقاط الضعف
    const weaknesses = [];

    // التحقق من استخدام Thread بدلاً من Coroutines
    if (findPatterns(codeFiles, ['new Thread', 'Runnable', 'Handler'], 0, ['coroutine'])) {
        weaknesses.push('استخدام Threads التقليدية بدلاً من Coroutines أو RxJava');
    }

    // التحقق من نقص التعليقات
    if (!checkAdequateComments(codeFiles)) {
        weaknesses.push('نقص التعليقات في الأجزاء المعقدة من الكود');
    }

    // التحقق من عدم استخدام ViewBinding
    if (!findPatterns(codeFiles, ['viewBinding', 'dataBinding', 'binding'])) {
        weaknesses.push('عدم استخدام ViewBinding أو DataBinding للتعامل الآمن مع عناصر الواجهة');
    }

    // التحقق من استخدام hard-coded strings
    if (!checkStringsInResources(codeFiles, xmlFiles)) {
        weaknesses.push('استخدام نصوص مضمنة بدلاً من ملفات الموارد (string resources)');
    }

    // تحليل مشاكل الأداء
    const performanceIssues = analyzePerformanceIssues(codeFiles, xmlFiles);

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
 * التحقق من استخدام موارد النصوص
 */
/**
 * التحقق من استخدام موارد النصوص
 */
function checkStringsInResources(codeFiles, xmlFiles) {
    // البحث عن ملف strings.xml
    const stringsXml = xmlFiles.find(file => file.name === 'strings.xml');

    if (!stringsXml) {
        return false;
    }

    // البحث عن سلاسل نصية مضمنة في الكود
    const hardcodedStringPattern = /setText\s*\(\s*"[^"]+"|\s*android:text\s*=\s*"[^@][^"]+"|\s*=\s*"[^@][^\s"]{10,}"/g;

    // عدد السلاسل النصية المضمنة
    let hardcodedStrings = 0;

    for (const file of codeFiles.concat(xmlFiles)) {
        const matches = file.content.match(hardcodedStringPattern);
        if (matches) {
            hardcodedStrings += matches.length;
        }
    }

    // إذا كان هناك أكثر من 5 سلاسل نصية مضمنة، نعتبر ذلك مشكلة
    return hardcodedStrings <= 5;
}

/**
 * تحليل مشاكل الأداء في تطبيقات Android
 */
function analyzePerformanceIssues(codeFiles, xmlFiles) {
    const issues = [];

    // التحقق من استخدام ViewHolder مع RecyclerView/ListView
    if (findPatterns(codeFiles, ['ListView', 'RecyclerView']) && !findPatterns(codeFiles, ['ViewHolder', 'onBindViewHolder'])) {
        issues.push('عدم استخدام نمط ViewHolder مع RecyclerView/ListView');
    }

    // التحقق من استخدام عمليات مكلفة في UI Thread
    if (findPatterns(codeFiles, ['runOnUiThread', 'onDraw', 'onCreateView']) &&
        findPatterns(codeFiles, ['for\\s*\\(', 'while\\s*\\(', '\\.save', '\\.load', 'SQLite', 'Bitmap\\.'])) {
        issues.push('تنفيذ عمليات مكلفة في واجهة المستخدم الرئيسية (UI Thread)');
    }

    // التحقق من استخدام تسلسل العرض المفرط
    if (findPatterns(xmlFiles, ['<LinearLayout', '<RelativeLayout']) &&
        findPatterns(xmlFiles, ['android:layout_width="match_parent"[\\s\\S]{0,100}<LinearLayout', '<RelativeLayout[\\s\\S]{0,100}<LinearLayout'])) {
        issues.push('تسلسل عميق للعناصر المرئية (view hierarchy) مما يؤثر على الأداء');
    }

    // التحقق من عدم استخدام Glide/Picasso للصور
    if (findPatterns(codeFiles, ['ImageView', 'setImageBitmap', 'setImageResource']) &&
        !findPatterns(codeFiles, ['Glide', 'Picasso', 'Coil'])) {
        issues.push('عدم استخدام مكتبات تحميل الصور بكفاءة مثل Glide أو Picasso');
    }

    return issues;
}

/**
 * تحليل مشاكل الذاكرة في تطبيقات Android
 */
function analyzeMemoryIssues(codeFiles) {
    const issues = [];

    // التحقق من تسريبات الذاكرة المحتملة من الـ Context
    if (findPatterns(codeFiles, ['static[\\s\\S]{0,50}Context', 'static[\\s\\S]{0,50}Activity'])) {
        issues.push('احتفاظ ثابت (static) بمرجع Context أو Activity مما قد يسبب تسرب ذاكرة');
    }

    // التحقق من عدم التخلص من الموارد
    if (findPatterns(codeFiles, ['Cursor', 'InputStream', 'OutputStream'], 0, ['close', 'recycle'])) {
        issues.push('عدم إغلاق الموارد مثل Cursors أو Streams بعد الانتهاء منها');
    }

    // التحقق من استخدام تسجيل الدخول غير المدارة
    if (findPatterns(codeFiles, ['Log\\.d', 'Log\\.v', 'System\\.out\\.print', 'printStackTrace'])) {
        issues.push('استخدام مفرط للتسجيل (logging) في الإصدار النهائي');
    }

    // التحقق من استخدام Bitmap بشكل غير فعال
    if (findPatterns(codeFiles, ['BitmapFactory\\.decode'], 0, ['inSampleSize', 'createScaledBitmap'])) {
        issues.push('تحميل صور كبيرة دون عينات أو تغيير الحجم');
    }

    return issues;
}

/**
 * تحليل مشاكل البطارية في تطبيقات Android
 */
function analyzeBatteryIssues(codeFiles) {
    const issues = [];

    // التحقق من استخدام استشعار الموقع بشكل مستمر
    if (findPatterns(codeFiles, ['LocationManager', 'FusedLocationProviderClient', 'requestLocationUpdates'])) {
        issues.push('استخدام خدمات الموقع بشكل مستمر يستهلك البطارية');
    }

    // التحقق من استخدام WakeLock
    if (findPatterns(codeFiles, ['WakeLock', 'PowerManager'])) {
        issues.push('استخدام WakeLock قد يمنع الجهاز من الدخول في وضع النوم');
    }

    // التحقق من استخدام Alarm Manager مع تكرار عالي
    if (findPatterns(codeFiles, ['AlarmManager.INTERVAL_FIFTEEN_MINUTES', 'AlarmManager.RTC_WAKEUP', 'AlarmManager.setRepeating'])) {
        issues.push('استخدام AlarmManager بفترات متكررة قصيرة');
    }

    // التحقق من استعلامات الشبكة المتكررة
    if (findPatterns(codeFiles, ['retrofit', 'OkHttp', 'HttpURLConnection', 'Volley']) &&
        findPatterns(codeFiles, ['Timer', 'Handler', 'postDelayed'])) {
        issues.push('إجراء طلبات شبكة متكررة في الخلفية');
    }

    return issues;
}

/**
 * تحليل مشاكل الأمان في تطبيقات Android
 */
function analyzeSecurityIssues(codeFiles) {
    const issues = [];

    // التحقق من استخدام SQL غير المحصن
    if (findPatterns(codeFiles, ['rawQuery', 'execSQL'])) {
        issues.push('استخدام استعلامات SQL مباشرة قد يعرض التطبيق لهجمات حقن SQL');
    }

    // التحقق من استخدام SharedPreferences للبيانات الحساسة
    if (findPatterns(codeFiles, ['SharedPreferences.Editor.put'], 0, ['EncryptedSharedPreferences', 'encrypt'])) {
        issues.push('تخزين بيانات في SharedPreferences دون تشفير');
    }

    // التحقق من استخدام HTTP بدلًا من HTTPS
    if (findPatterns(codeFiles, ['http://'])) {
        issues.push('استخدام بروتوكول HTTP غير الآمن بدلاً من HTTPS');
    }

    // التحقق من WebView غير الآمن
    if (findPatterns(codeFiles, ['WebView']) && findPatterns(codeFiles, ['setJavaScriptEnabled\\(true', 'addJavascriptInterface'])) {
        issues.push('استخدام WebView مع تكوين غير آمن يمكن أن يؤدي إلى ثغرات XSS أو RCE');
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
 * تحليل الأداء في تطبيقات Android
 */
async function analyzePerformance(repoPath) {
    // البحث عن ملفات Java و Kotlin
    const javaFiles = await parseFiles(repoPath, '.java');
    const kotlinFiles = await parseFiles(repoPath, '.kt');
    const xmlFiles = await parseFiles(repoPath, '.xml');

    // دمج جميع ملفات الكود
    const codeFiles = [...javaFiles, ...kotlinFiles];

    // تحليل مشاكل الأداء
    const issues = analyzePerformanceIssues(codeFiles, xmlFiles);

    // حساب درجة الأداء
    const score = 100 - (issues.length * 10);

    return {
        score: Math.max(0, Math.min(100, score)),
        issues
    };
}

/**
 * تحليل استخدام الذاكرة في تطبيقات Android
 */
async function analyzeMemory(repoPath) {
    // البحث عن ملفات Java و Kotlin
    const javaFiles = await parseFiles(repoPath, '.java');
    const kotlinFiles = await parseFiles(repoPath, '.kt');

    // دمج جميع ملفات الكود
    const codeFiles = [...javaFiles, ...kotlinFiles];

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
 * تحليل استهلاك البطارية في تطبيقات Android
 */
async function analyzeBattery(repoPath) {
    // البحث عن ملفات Java و Kotlin
    const javaFiles = await parseFiles(repoPath, '.java');
    const kotlinFiles = await parseFiles(repoPath, '.kt');

    // دمج جميع ملفات الكود
    const codeFiles = [...javaFiles, ...kotlinFiles];

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
 * تحليل الأمان في تطبيقات Android
 */
async function analyzeSecurity(repoPath) {
    // البحث عن ملفات Java و Kotlin
    const javaFiles = await parseFiles(repoPath, '.java');
    const kotlinFiles = await parseFiles(repoPath, '.kt');

    // دمج جميع ملفات الكود
    const codeFiles = [...javaFiles, ...kotlinFiles];

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