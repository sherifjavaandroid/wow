import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Github, ArrowLeft, Search, AlertCircle } from 'lucide-react';
import api from '../services/api';

const AnalyzeRepo = () => {
    const navigate = useNavigate();
    const [repoUrl, setRepoUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [jobId, setJobId] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!repoUrl.trim()) {
            setError('الرجاء إدخال رابط مستودع GitHub');
            return;
        }

        if (!repoUrl.includes('github.com')) {
            setError('الرجاء إدخال رابط مستودع GitHub صحيح');
            return;
        }

        try {
            setIsAnalyzing(true);

            const response = await api.post('/repository/analyze', { repoUrl });

            if (response.data.redirect) {
                // تم تحليل هذا المستودع مسبقًا
                navigate(`/report/${response.data.reportId}`);
                return;
            }

            setJobId(response.data.jobId);
            pollJobStatus(response.data.jobId);
        } catch (error) {
            console.error('خطأ في طلب تحليل المستودع:', error);
            setError('حدث خطأ أثناء معالجة الطلب');
            setIsAnalyzing(false);
        }
    };

    const pollJobStatus = async (id) => {
        try {
            const response = await api.get(`/repository/status/${id}`);
            const { status } = response.data;

            if (status.status === 'completed') {
                navigate(`/report/${status.result.reportId}`);
                return;
            } else if (status.status === 'failed') {
                setError(`فشل تحليل المستودع: ${status.failedReason}`);
                setIsAnalyzing(false);
                return;
            }

            // تحديث التقدم
            setProgress(status.progress);

            // استمرار الاستطلاع
            setTimeout(() => pollJobStatus(id), 2000);
        } catch (error) {
            console.error('خطأ في التحقق من حالة المهمة:', error);
            setError('حدث خطأ أثناء التحقق من حالة التحليل');
            setIsAnalyzing(false);
        }
    };

    return (
        <div dir="rtl" className="container mx-auto px-4 py-8">
            <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-900 flex items-center mb-6"
            >
                <ArrowLeft size={16} className="ml-1" />
                العودة إلى لوحة التحكم
            </Link>

            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">تحليل مستودع جديد</h1>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="repoUrl" className="block text-gray-700 font-medium mb-2">
                                رابط مستودع GitHub
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Github size={20} className="text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    id="repoUrl"
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    disabled={isAnalyzing}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                                    placeholder="https://github.com/username/repository"
                                    dir="ltr"
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                أدخل الرابط الكامل لمستودع GitHub الذي تريد تحليله
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 mb-4 flex items-start">
                                <AlertCircle size={20} className="ml-2 mt-0.5" />
                                <div>
                                    <p className="font-bold">خطأ</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isAnalyzing}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center disabled:bg-blue-300"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    جاري التحليل...
                                </>
                            ) : (
                                <>
                                    تحليل المستودع <Search size={16} className="mr-2" />
                                </>
                            )}
                        </button>
                    </form>

                    {isAnalyzing && (
                        <div className="mt-6">
                            <h3 className="text-md font-semibold mb-2">تقدم التحليل</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-500">
                                يرجى الانتظار، قد تستغرق عملية التحليل بضع دقائق اعتمادًا على حجم المستودع.
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 border-r-4 border-blue-500 text-blue-700 p-4 mt-6">
                    <h3 className="font-bold mb-2">التقنيات المدعومة:</h3>
                    <ul className="list-disc list-inside">
                        <li>Flutter</li>
                        <li>React Native</li>
                        <li>Xamarin</li>
                        <li>Native Android</li>
                        <li>Native iOS</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AnalyzeRepo;