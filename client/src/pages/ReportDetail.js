import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Award, AlertTriangle, Zap, Code, Battery, Lock,
    Download, Share, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../services/api';
import Loader from '../components/loader';

const ReportDetail = () => {
    const { reportId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedSections, setExpandedSections] = useState({
        strengths: true,
        weaknesses: true,
        performance: true,
        memory: false,
        battery: false,
        security: false,
        recommendations: true
    });

    useEffect(() => {
        fetchReport();
    }, [reportId]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/report/${reportId}`);
            setReport(response.data.report);
            setError('');
        } catch (error) {
            console.error('خطأ في استرداد التقرير:', error);
            setError('حدث خطأ أثناء استرداد تفاصيل التقرير');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const exportToPDF = () => {
        alert('سيتم تنفيذ تصدير التقرير كملف PDF قريبًا');
    };

    const shareReport = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('تم نسخ رابط التقرير إلى الحافظة');
    };

    if (loading) {
        return <Loader message="جاري تحميل التقرير..." />;
    }

    if (error) {
        return (
            <div dir="rtl" className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
                <Link
                    to="/dashboard"
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                >
                    <ArrowLeft size={16} className="ml-1" />
                    العودة إلى لوحة التحكم
                </Link>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    const ProgressBar = ({ value, label, color }) => (
        <div className="mb-4">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm font-medium">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={color}
                    style={{ width: `${value}%`, height: '0.625rem' }}
                ></div>
            </div>
        </div>
    );

    const Section = ({ title, items, icon, section, iconColor }) => (
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <button
                className="w-full flex items-center justify-between p-4 focus:outline-none"
                onClick={() => toggleSection(section)}
            >
                <div className="flex items-center">
                    <div className={`p-2 rounded-full ${iconColor} mr-2`}>
                        {icon}
                    </div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                {expandedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {expandedSections[section] && (
                <div className="p-4 pt-0 border-t">
                    <ul className="list-disc list-inside">
                        {items.map((item, index) => (
                            <li key={index} className="mb-2 text-gray-700">{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <div dir="rtl" className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link
                        to="/dashboard"
                        className="text-blue-600 hover:text-blue-900 flex items-center mb-2"
                    >
                        <ArrowLeft size={16} className="ml-1" />
                        العودة إلى لوحة التحكم
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">تقرير تحليل المستودع</h1>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                    <button
                        onClick={exportToPDF}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                    >
                        <Download size={16} className="ml-1" />
                        تصدير PDF
                    </button>
                    <button
                        onClick={shareReport}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition flex items-center"
                    >
                        <Share size={16} className="ml-1" />
                        مشاركة
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">{report.repoName}</h2>
                        <div className="flex items-center mt-2">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded mr-2">
                {report.framework}
              </span>
                            <span className="text-gray-500 text-sm">
                تاريخ التحليل: {formatDate(report.analysisDate)}
              </span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full">
                            <div className="text-3xl font-bold text-blue-600">{report.codeQuality}</div>
                            <div className="text-sm text-blue-600 mr-1">/100</div>
                        </div>
                        <div className="text-sm font-medium mt-1">التقييم العام</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <ProgressBar
                            value={report.performance.score}
                            label="الأداء"
                            color="bg-green-600"
                        />
                        <ProgressBar
                            value={report.security.score}
                            label="الأمان"
                            color="bg-purple-600"
                        />
                    </div>
                    <div>
                        <ProgressBar
                            value={report.memory.score}
                            label="استخدام الذاكرة"
                            color="bg-yellow-500"
                        />
                        <ProgressBar
                            value={report.battery.score}
                            label="استهلاك البطارية"
                            color="bg-red-500"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Section
                    title="نقاط القوة"
                    items={report.strengths}
                    icon={<Award size={20} className="text-white" />}
                    section="strengths"
                    iconColor="bg-green-500"
                />

                <Section
                    title="نقاط الضعف"
                    items={report.weaknesses}
                    icon={<AlertTriangle size={20} className="text-white" />}
                    section="weaknesses"
                    iconColor="bg-red-500"
                />

                <Section
                    title="مشاكل الأداء"
                    items={report.performance.issues}
                    icon={<Zap size={20} className="text-white" />}
                    section="performance"
                    iconColor="bg-yellow-500"
                />

                <Section
                    title="مشاكل الذاكرة"
                    items={report.memory.issues}
                    icon={<Code size={20} className="text-white" />}
                    section="memory"
                    iconColor="bg-blue-500"
                />

                <Section
                    title="مشاكل البطارية"
                    items={report.battery.issues}
                    icon={<Battery size={20} className="text-white" />}
                    section="battery"
                    iconColor="bg-orange-500"
                />

                <Section
                    title="مشاكل الأمان"
                    items={report.security.issues}
                    icon={<Lock size={20} className="text-white" />}
                    section="security"
                    iconColor="bg-purple-500"
                />
            </div>

            <Section
                title="التوصيات"
                items={report.recommendations}
                icon={<Award size={20} className="text-white" />}
                section="recommendations"
                iconColor="bg-blue-600"
            />
        </div>
    );
};

export default ReportDetail;