import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer dir="rtl" className="bg-white border-t">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-sm text-gray-600">
                            &copy; {currentYear} نظام تحليل جودة الكود. جميع الحقوق محفوظة.
                        </p>
                    </div>
                    <div className="flex space-x-6 space-x-reverse">
                        <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                            سياسة الخصوصية
                        </a>
                        <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                            شروط الاستخدام
                        </a>
                        <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                            اتصل بنا
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;