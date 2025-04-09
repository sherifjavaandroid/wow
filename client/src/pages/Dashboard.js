// src/pages/Dashboard.js - صفحة لوحة التحكم
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, FileCode, ChevronRight, Filter, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/loader';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('analysisDate');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchRepositories();
    }, []);

    const fetchRepositories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/repository');
            setRepositories(response.data.repositories);
            setError('');
        } catch (error) {
            console.error('خطأ في استرداد المستودعات:', error);
            setError('حدث خطأ أثناء استرداد قائمة المستودعات');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const handleFilter = (e) => {
        setFilter(e.target.value);
    };

    const filteredRepositories = repositories.filter(repo =>
        repo.repoName.toLowerCase().includes(filter.toLowerCase()) ||
        repo.framework.toLowerCase().includes(filter.toLowerCase())
    );

    const sortedRepositories = [...filteredRepositories].sort((a, b) => {
        if (sortBy === 'codeQuality') {
            return sortOrder === 'asc'
                ? a.codeQuality - b.codeQuality
                : b.codeQuality - a.codeQuality;
        } else if (sortBy === 'analysisDate') {
            return sortOrder === 'asc'
                ? new Date(a.analysisDate) - new Date(b.analysisDate)
                : new Date(b.analysisDate) - new Date(a.analysisDate);
        } else {
            return sortOrder === 'asc'
                ? a[sortBy].localeCompare(b[sortBy])
                : b[sortBy].localeCompare(a[sortBy]);
        }
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div dir="rtl" className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم المستودعات</h1>
                <Link
                    to="/analyze"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    تحليل مستودع جديد
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="p-4 border-b">
                    <div className="flex items-center">
                        <Filter size={18} className="text-gray-500 mr-2" />
                        <input
                            type="text"
                            placeholder="البحث عن المستودعات..."
                            value={filter}
                            onChange={handleFilter}
                            className="w-full border-0 focus:ring-0 outline-none"
                        />
                    </div>
                </div>

                {loading ? (
                    <Loader message="جاري تحميل المستودعات..." />
                ) : sortedRepositories.length === 0 ? (
                    <EmptyState
                        icon={<Folder size={48} />}
                        title="لا توجد مستودعات"
                        message="لم يتم تحليل أي مستودعات بعد. قم بتحليل مستودع جديد للبدء."
                        actionLink="/analyze"
                        actionText="تحليل مستودع جديد"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                            <tr className="bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-3">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('repoName')}
                                    >
                                        المستودع
                                        {sortBy === 'repoName' && (
                                            sortOrder === 'asc' ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('framework')}
                                    >
                                        التقنية
                                        {sortBy === 'framework' && (
                                            sortOrder === 'asc' ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('codeQuality')}
                                    >
                                        جودة الكود
                                        {sortBy === 'codeQuality' && (
                                            sortOrder === 'asc' ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3">
                                    <button
                                        className="flex items-center"
                                        onClick={() => handleSort('analysisDate')}
                                    >
                                        تاريخ التحليل
                                        {sortBy === 'analysisDate' && (
                                            sortOrder === 'asc' ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-3"></th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {sortedRepositories.map((repo) => (
                                <tr key={repo._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <FileCode size={20} className="text-gray-500 ml-2" />
                                            <div className="text-sm font-medium text-gray-900">
                                                {repo.repoName}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {repo.framework}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`w-14 text-center rounded-full py-1 text-xs font-medium
                          ${repo.codeQuality >= 80 ? 'bg-green-100 text-green-800' :
                                                repo.codeQuality >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}
                                            >
                                                {repo.codeQuality}/100
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock size={14} className="text-gray-400 ml-1" />
                                            {formatDate(repo.analysisDate)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left">
                                        <Link
                                            to={`/report/${repo._id}`}
                                            className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                                        >
                                            عرض التقرير
                                            <ChevronRight size={16} className="mr-1" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

// // src/pages/ReportDetail.js - صفحة تفاصيل التقرير
// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import {
//     ArrowLeft, Award, AlertTriangle, Zap, Code, Battery, Lock,
//     Download, Share, ChevronDown, ChevronUp
// } from 'lucide-react';
// import api from '../services/api';
// import Loader from '../components/Loader';
//
// const ReportDetail = () => {
//     const { reportId } = useParams();
//     const [report, setReport] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [expandedSections, setExpandedSections] = useState({
//         strengths: true,
//         weaknesses: true,
//         performance: true,
//         memory: false,
//         battery: false,
//         security: false,
//         recommendations: true
//     });
//
//     useEffect(() => {
//         fetchReport();
//     }, [reportId]);
//
//     const fetchReport = async () => {
//         try {
//             setLoading(true);
//             const response = await api.get(`/report/${reportId}`);
//             setReport(response.data.report);
//             setError('');
//         } catch (error) {
//             console.error('خطأ في استرداد التقرير:', error);
//             setError('حدث خطأ أثناء استرداد تفاصيل التقرير');
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const toggleSection = (section) => {
//         setExpandedSections(prev => ({
//             ...prev,
//             [section]: !prev[section]
//         }));
//     };
//
//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return new Intl.DateTimeFormat('ar-EG', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         }).format(date);
//     };
//
//     const exportToPDF = () => {
//         alert('سيتم تنفيذ تصدير التقرير كملف PDF قريبًا');
//     };
//
//     const shareReport = () => {
//         navigator.clipboard.writeText(window.location.href);
//         alert('تم نسخ رابط التقرير إلى الحافظة');
//     };
//
//     if (loading) {
//         return <Loader message="جاري تحميل التقرير..." />;
//     }
//
//     if (error) {
//         return (
//             <div dir="rtl" className="container mx-auto px-4 py-8">
//                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//                     {error}
//                 </div>
//                 <Link
//                     to="/dashboard"
//                     className="text-blue-600 hover:text-blue-900 flex items-center"
//                 >
//                     <ArrowLeft size={16} className="ml-1" />
//                     العودة إلى لوحة التحكم
//                 </Link>
//             </div>
//         );
//     }
//
//     if (!report) {
//         return null;
//     }
//
//     const ProgressBar = ({ value, label, color }) => (
//         <div className="mb-4">
//             <div className="flex justify-between mb-1">
//                 <span className="text-sm font-medium">{label}</span>
//                 <span className="text-sm font-medium">{value}%</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5">
//                 <div
//                     className={color}
//                     style={{ width: `${value}%`, height: '0.625rem' }}
//                 ></div>
//             </div>
//         </div>
//     );
//
//     const Section = ({ title, items, icon, section, iconColor }) => (
//         <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
//             <button
//                 className="w-full flex items-center justify-between p-4 focus:outline-none"
//                 onClick={() => toggleSection(section)}
//             >
//                 <div className="flex items-center">
//                     <div className={`p-2 rounded-full ${iconColor} mr-2`}>
//                         {icon}
//                     </div>
//                     <h3 className="text-lg font-semibold">{title}</h3>
//                 </div>
//                 {expandedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//             </button>
//
//             {expandedSections[section] && (
//                 <div className="p-4 pt-0 border-t">
//                     <ul className="list-disc list-inside">
//                         {items.map((item, index) => (
//                             <li key={index} className="mb-2 text-gray-700">{item}</li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
//
//     return (
//         <div dir="rtl" className="container mx-auto px-4 py-8">
//             <div className="flex justify-between items-center mb-6">
//                 <div>
//                     <Link
//                         to="/dashboard"
//                         className="text-blue-600 hover:text-blue-900 flex items-center mb-2"
//                     >
//                         <ArrowLeft size={16} className="ml-1" />
//                         العودة إلى لوحة التحكم
//                     </Link>
//                     <h1 className="text-2xl font-bold text-gray-800">تقرير تحليل المستودع</h1>
//                 </div>
//                 <div className="flex space-x-2 space-x-reverse">
//                     <button
//                         onClick={exportToPDF}
//                         className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
//                     >
//                         <Download size={16} className="ml-1" />
//                         تصدير PDF
//                     </button>
//                     <button
//                         onClick={shareReport}
//                         className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center"
//                     >
//                         <Share size={16} className="ml-1" />
//                         مشاركة
//                     </button>
//                 </div>
//             </div>
//
//             <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//                 <div className="flex justify-between items-center mb-6">
//                     <div>
//                         <h2 className="text-2xl font-bold">{report.repoName}</h2>
//                         <div className="flex items-center mt-2">
//               <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-2">
//                 {report.framework}
//               </span>
//                             <span className="text-gray-500 text-sm">
//                 تاريخ التحليل: {formatDate(report.analysisDate)}
//               </span>
//                         </div>
//                     </div>
//                     <div className="text-center">
//                         <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full">
//                             <div className="text-3xl font-bold text-blue-600">{report.codeQuality}</div>
//                             <div className="text-sm text-blue-600 mr-1">/100</div>
//                         </div>
//                         <div className="text-sm font-medium mt-1">التقييم العام</div>
//                     </div>
//                 </div>
//
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div>
//                         <ProgressBar
//                             value={report.performance.score}
//                             label="الأداء"
//                             color="bg-green-600"
//                         />
//                         <ProgressBar
//                             value={report.security.score}
//                             label="الأمان"
//                             color="bg-purple-600"
//                         />
//                     </div>
//                     <div>
//                         <ProgressBar
//                             value={report.memory.score}
//                             label="استخدام الذاكرة"
//                             color="bg-yellow-500"
//                         />
//                         <ProgressBar
//                             value={report.battery.score}
//                             label="استهلاك البطارية"
//                             color="bg-red-500"
//                         />
//                     </div>
//                 </div>
//             </div>
//
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//                 <Section
//                     title="نقاط القوة"
//                     items={report.strengths}
//                     icon={<Award size={20} className="text-white" />}
//                     section="strengths"
//                     iconColor="bg-green-500"
//                 />
//
//                 <Section
//                     title="نقاط الضعف"
//                     items={report.weaknesses}
//                     icon={<AlertTriangle size={20} className="text-white" />}
//                     section="weaknesses"
//                     iconColor="bg-red-500"
//                 />
//
//                 <Section
//                     title="مشاكل الأداء"
//                     items={report.performance.issues}
//                     icon={<Zap size={20} className="text-white" />}
//                     section="performance"
//                     iconColor="bg-yellow-500"
//                 />
//
//                 <Section
//                     title="مشاكل الذاكرة"
//                     items={report.memory.issues}
//                     icon={<Code size={20} className="text-white" />}
//                     section="memory"
//                     iconColor="bg-blue-500"
//                 />
//
//                 <Section
//                     title="مشاكل البطارية"
//                     items={report.battery.issues}
//                     icon={<Battery size={20} className="text-white" />}
//                     section="battery"
//                     iconColor="bg-orange-500"
//                 />
//
//                 <Section
//                     title="مشاكل الأمان"
//                     items={report.security.issues}
//                     icon={<Lock size={20} className="text-white" />}
//                     section="security"
//                     iconColor="bg-purple-500"
//                 />
//             </div>
//
//             <Section
//                 title="التوصيات"
//                 items={report.recommendations}
//                 icon={<Award size={20} className="text-white" />}
//                 section="recommendations"
//                 iconColor="bg-blue-600"
//             />
//         </div>
//     );
// };
//
// export default ReportDetail;

// // src/pages/AnalyzeRepo.js - صفحة تحليل مستودع جديد
// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Github, ArrowLeft, Search, AlertCircle } from 'lucide-react';
// import api from '../services/api';
//
// const AnalyzeRepo = () => {
//     const navigate = useNavigate();
//     const [repoUrl, setRepoUrl] = useState('');
//     const [isAnalyzing, setIsAnalyzing] = useState(false);
//     const [error, setError] = useState('');
//     const [jobId, setJobId] = useState(null);
//     const [progress, setProgress] = useState(0);
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//
//         if (!repoUrl.trim()) {
//             setError('الرجاء إدخال رابط مستودع GitHub');
//             return;
//         }
//
//         if (!repoUrl.includes('github.com')) {
//             setError('الرجاء إدخال رابط مستودع GitHub صحيح');
//             return;
//         }
//
//         try {
//             setIsAnalyzing(true);
//
//             const response = await api.post('/repository/analyze', { repoUrl });
//
//             if (response.data.redirect) {
//                 // تم تحليل هذا المستودع مسبقًا
//                 navigate(`/report/${response.data.reportId}`);
//                 return;
//             }
//
//             setJobId(response.data.jobId);
//             pollJobStatus(response.data.jobId);
//         } catch (error) {
//             console.error('خطأ في طلب تحليل المستودع:', error);
//             setError('حدث خطأ أثناء معالجة الطلب');
//             setIsAnalyzing(false);
//         }
//     };
//
//     const pollJobStatus = async (id) => {
//         try {
//             const response = await api.get(`/repository/status/${id}`);
//             const { status } = response.data;
//
//             if (status.status === 'completed') {
//                 navigate(`/report/${status.result.reportId}`);
//                 return;
//             } else if (status.status === 'failed') {
//                 setError(`فشل تحليل المستودع: ${status.failedReason}`);
//                 setIsAnalyzing(false);
//                 return;
//             }
//
//             // تحديث التقدم
//             setProgress(status.progress);
//
//             // استمرار الاستطلاع
//             setTimeout(() => pollJobStatus(id), 2000);
//         } catch (error) {
//             console.error('خطأ في التحقق من حالة المهمة:', error);
//             setError('حدث خطأ أثناء التحقق من حالة التحليل');
//             setIsAnalyzing(false);
//         }
//     };
//
//     return (
//         <div dir="rtl" className="container mx-auto px-4 py-8">
//             <Link
//                 to="/dashboard"
//                 className="text-blue-600 hover:text-blue-900 flex items-center mb-6"
//             >
//                 <ArrowLeft size={16} className="ml-1" />
//                 العودة إلى لوحة التحكم
//             </Link>
//
//             <div className="max-w-2xl mx-auto">
//                 <h1 className="text-2xl font-bold text-gray-800 mb-6">تحليل مستودع جديد</h1>
//
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                     <form onSubmit={handleSubmit}>
//                         <div className="mb-4">
//                             <label htmlFor="repoUrl" className="block text-gray-700 font-medium mb-2">
//                                 رابط مستودع GitHub
//                             </label>
//                             <div className="relative">
//                                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                                     <Github size={20} className="text-gray-500" />
//                                 </div>
//                                 <input
//                                     type="text"
//                                     id="repoUrl"
//                                     value={repoUrl}
//                                     onChange={(e) => setRepoUrl(e.target.value)}
//                                     disabled={isAnalyzing}
//                                     className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
//                                     placeholder="https://github.com/username/repository"
//                                     dir="ltr"
//                                 />
//                             </div>
//                             <p className="mt-1 text-sm text-gray-500">
//                                 أدخل الرابط الكامل لمستودع GitHub الذي تريد تحليله
//                             </p>
//                         </div>
//
//                         {error && (
//                             <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 mb-4 flex items-start">
//                                 <AlertCircle size={20} className="ml-2 mt-0.5" />
//                                 <div>
//                                     <p className="font-bold">خطأ</p>
//                                     <p>{error}</p>
//                                 </div>
//                             </div>
//                         )}
//
//                         <button
//                             type="submit"
//                             disabled={isAnalyzing}
//                             className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center disabled:bg-blue-300"
//                         >
//                             {isAnalyzing ? (
//                                 <>
//                                     <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
//                                     جاري التحليل...
//                                 </>
//                             ) : (
//                                 <>
//                                     تحليل المستودع <Search size={16} className="mr-2" />
//                                 </>
//                             )}
//                         </button>
//                     </form>
//
//                     {isAnalyzing && (
//                         <div className="mt-6">
//                             <h3 className="text-md font-semibold mb-2">تقدم التحليل</h3>
//                             <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
//                                 <div
//                                     className="bg-blue-600 h-2.5 rounded-full"
//                                     style={{ width: `${progress}%` }}
//                                 ></div>
//                             </div>
//                             <p className="text-sm text-gray-500">
//                                 يرجى الانتظار، قد تستغرق عملية التحليل بضع دقائق اعتمادًا على حجم المستودع.
//                             </p>
//                         </div>
//                     )}
//                 </div>
//
//                 <div className="bg-blue-50 border-r-4 border-blue-500 text-blue-700 p-4 mt-6">
//                     <h3 className="font-bold mb-2">التقنيات المدعومة:</h3>
//                     <ul className="list-disc list-inside">
//                         <li>Flutter</li>
//                         <li>React Native</li>
//                         <li>Xamarin</li>
//                         <li>Native Android</li>
//                         <li>Native iOS</li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default AnalyzeRepo;