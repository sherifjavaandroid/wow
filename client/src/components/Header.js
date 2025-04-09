import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { isAuthenticated, logout, getUser } from '../services/auth';
import logo from '../assets/logo.svg';

const Header = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const authenticated = isAuthenticated();
    const user = getUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header dir="rtl" className="bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <img src={logo} alt="Code Analyzer" className="h-8 ml-2" />
                            <span className="text-xl font-bold text-gray-900">تحليل الكود</span>
                        </Link>
                    </div>

                    {authenticated && (
                        <>
                            <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                                <Link
                                    to="/dashboard"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    لوحة التحكم
                                </Link>
                                <Link
                                    to="/analyze"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    تحليل مستودع
                                </Link>
                            </div>

                            <div className="hidden md:flex items-center">
                                <div className="relative group">
                                    <button className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                        <User size={16} className="ml-1" />
                                        {user?.username || 'المستخدم'}
                                    </button>
                                    <div className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 ease-in-out z-10">
                                        <div className="py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LogOut size={16} className="ml-2" />
                                                تسجيل الخروج
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:hidden flex items-center">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="text-gray-700 hover:text-blue-600 focus:outline-none"
                                >
                                    {isMenuOpen ? (
                                        <X size={24} />
                                    ) : (
                                        <Menu size={24} />
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {!authenticated && (
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                تسجيل الدخول
                            </Link>
                            <Link
                                to="/register"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                إنشاء حساب
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* القائمة المتنقلة */}
            {authenticated && isMenuOpen && (
                <div className="md:hidden bg-white">
                    <div className="container mx-auto px-4 py-2 border-t">
                        <Link
                            to="/dashboard"
                            className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            لوحة التحكم
                        </Link>
                        <Link
                            to="/analyze"
                            className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            تحليل مستودع
                        </Link>
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            className="flex items-center w-full text-right text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <LogOut size={16} className="ml-2" />
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;