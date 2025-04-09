// src/App.js - ملف التطبيق الرئيسي
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// المكونات
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// الصفحات
import Dashboard from './pages/Dashboard';
import ReportDetail from './pages/ReportDetail';
import AnalyzeRepo from './pages/AnalyzeRepo';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// األنماط
import './styles/tailwind.css';

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow bg-gray-50">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/report/:reportId" element={<ReportDetail />} />
                            <Route path="/analyze" element={<AnalyzeRepo />} />
                        </Route>

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Footer />
                <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            </div>
        </Router>
    );
}

export default App;
