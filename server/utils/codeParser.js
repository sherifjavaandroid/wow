// utils/codeParser.js - أدوات تحليل الكود
const fs = require('fs');
const path = require('path');
const glob = require('glob'); // استيراد glob مباشرة بدون promisify

/**
 * قراءة وتحليل الملفات بامتداد معين من مسار المستودع
 * @param {string} repoPath - مسار المستودع
 * @param {string|string[]} extensions - امتداد أو امتدادات الملفات المطلوبة
 * @returns {Promise<Array>} - مصفوفة من الملفات مع محتواها
 */
async function parseFiles(repoPath, extensions) {
    try {
        // تحويل الامتداد إلى مصفوفة إذا كان نصًا
        const extArray = Array.isArray(extensions) ? extensions : [extensions];

        // إنشاء نمط البحث عن الملفات
        const pattern = `${repoPath}/**/*{${extArray.join(',')}}`;

        // البحث عن جميع الملفات المطابقة باستخدام glob
        const files = await new Promise((resolve, reject) => {
            glob(pattern, { nodir: true }, (err, files) => {
                if (err) reject(err);
                else resolve(files);
            });
        });

        // قراءة محتوى كل ملف
        const parsedFiles = await Promise.all(
            files.map(async (filePath) => {
                try {
                    const content = await fs.promises.readFile(filePath, 'utf8');
                    return {
                        path: filePath,
                        name: path.basename(filePath),
                        extension: path.extname(filePath),
                        content
                    };
                } catch (error) {
                    console.error(`خطأ في قراءة الملف ${filePath}:`, error);
                    return null;
                }
            })
        );

        // إزالة الملفات التي لم يتم قراءتها بنجاح
        return parsedFiles.filter(file => file !== null);
    } catch (error) {
        console.error('خطأ في تحليل الملفات:', error);
        return [];
    }
}

/**
 * البحث عن أنماط محددة في الملفات
 * @param {Array} files - مصفوفة من الملفات مع محتواها
 * @param {string|string[]} patterns - نمط أو أنماط للبحث عنها
 * @param {number} minOccurrences - الحد الأدنى لعدد مرات الظهور (0 للبحث عن أي ظهور)
 * @param {string[]} exclusionPatterns - أنماط للاستبعاد
 * @returns {boolean} - إذا تم العثور على الأنماط
 */
function findPatterns(files, patterns, minOccurrences = 0, exclusionPatterns = []) {
    try {
        // تحويل الأنماط إلى مصفوفة إذا كانت نصًا
        const patternArray = Array.isArray(patterns) ? patterns : [patterns];
        const exclusionArray = Array.isArray(exclusionPatterns) ? exclusionPatterns : [exclusionPatterns];

        // عدد مرات ظهور كل نمط
        const occurrences = {};

        // البحث في كل ملف
        for (const file of files) {
            for (const pattern of patternArray) {
                const regex = new RegExp(pattern, 'g');
                const matches = file.content.match(regex);

                if (matches) {
                    // التحقق من أنماط الاستبعاد
                    if (exclusionArray.length > 0) {
                        let excluded = false;
                        for (const exclusion of exclusionArray) {
                            const exclusionRegex = new RegExp(exclusion, 'g');
                            if (exclusionRegex.test(file.content)) {
                                excluded = true;
                                break;
                            }
                        }

                        if (excluded) {
                            continue;
                        }
                    }

                    // زيادة عدد مرات الظهور
                    occurrences[pattern] = (occurrences[pattern] || 0) + matches.length;
                }
            }
        }

        // التحقق من الحد الأدنى لعدد مرات الظهور
        if (minOccurrences === 0) {
            // إذا كان الحد الأدنى 0، فنحن نبحث فقط عن وجود أي نمط
            return Object.keys(occurrences).length > 0;
        } else {
            // التحقق من أن عدد مرات الظهور يتجاوز الحد الأدنى
            return Object.values(occurrences).some(count => count >= minOccurrences);
        }
    } catch (error) {
        console.error('خطأ في البحث عن الأنماط:', error);
        return false;
    }
}

/**
 * حساب عدد الأسطر في النص
 * @param {string} content - محتوى النص
 * @returns {number} - عدد الأسطر
 */
function countLines(content) {
    if (!content) return 0;
    return content.split('\n').length;
}

/**
 * استخراج جميع التعليقات من الكود
 * @param {string} content - محتوى الكود
 * @returns {Array} - مصفوفة من التعليقات
 */
function extractComments(content) {
    // تعليقات السطر الواحد
    const singleLineRegex = /\/\/(.+?)(?=\n|$)/g;

    // تعليقات متعددة الأسطر
    const multiLineRegex = /\/\*[\s\S]*?\*\//g;

    // تعليقات JSDoc/Dart Doc
    const docRegex = /\/\*\*[\s\S]*?\*\//g;

    const comments = [];

    // استخراج جميع أنواع التعليقات
    let match;

    while ((match = singleLineRegex.exec(content)) !== null) {
        comments.push(match[0]);
    }

    while ((match = multiLineRegex.exec(content)) !== null) {
        comments.push(match[0]);
    }

    while ((match = docRegex.exec(content)) !== null) {
        comments.push(match[0]);
    }

    return comments;
}

/**
 * استخراج جميع الدوال من الكود
 * @param {string} content - محتوى الكود
 * @param {string} fileType - نوع الملف (js، dart، إلخ)
 * @returns {Array} - مصفوفة من كائنات الدوال مع أسمائها ومحتواها
 */
function extractFunctions(content, fileType) {
    const functions = [];

    // تعريفات الدوال المختلفة حسب نوع الملف
    let functionRegex;

    switch (fileType) {
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            // JavaScript/TypeScript: الدوال العادية والسهمية والمنهجية
            functionRegex = [
                // دوال عادية: function name() {}
                /function\s+(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)(?=\n\})/g,
                // دوال سهمية: const name = () => {}
                /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{([\s\S]*?)(?=\n\})/g,
                // طرق الكائنات: name() {}
                /(\w+)\s*\([^)]*\)\s*\{([\s\S]*?)(?=\n\s*\})/g
            ];
            break;
        case 'dart':
            // Dart: دوال عادية ودوال الفئات
            functionRegex = [
                // دوال عادية: void name() {}
                /(?:void|String|int|double|bool|dynamic|Widget|Future)\s+(\w+)\s*\([^)]*\)\s*(?:async\s*)?\{([\s\S]*?)(?=\n\})/g,
                // طرق الفئات: name() {}
                /\s+(\w+)\s*\([^)]*\)\s*(?:async\s*)?\{([\s\S]*?)(?=\n\s*\})/g
            ];
            break;
        default:
            functionRegex = [];
    }

    // استخراج الدوال لكل نمط
    for (const regex of functionRegex) {
        let match;
        while ((match = regex.exec(content)) !== null) {
            functions.push({
                name: match[1],
                content: match[0],
                lines: countLines(match[0])
            });
        }
    }

    return functions;
}

module.exports = {
    parseFiles,
    findPatterns,
    countLines,
    extractComments,
    extractFunctions
};
