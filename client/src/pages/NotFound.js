import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div dir="rtl" className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
                <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">الصفحة غير موجودة</h2>
                <p className="text-gray-600 mb-8">
                    عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها أو حذفها.
                </p>
                <Link
                    to="/dashboard"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm inline-flex items-center"
                >
                    <Home size={16} className="ml-1" />
                    العودة إلى الصفحة الرئيسية
                </Link>
            </div>
        </div>
    );
};

export default NotFound;