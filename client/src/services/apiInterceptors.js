// src/services/apiInterceptors.js - إعداد معترضات API
import api from './api';
import { getToken, removeToken } from './auth';

// إعداد المعترضات
export const setupInterceptors = () => {
    // إضافة معترض طلبات لإضافة رمز الوصول إلى الرأس
    api.interceptors.request.use(
        (config) => {
            const token = getToken();
            if (token) {
                config.headers['x-auth-token'] = token;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // إضافة معترض استجابة للتعامل مع أخطاء المصادقة
    api.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response && error.response.status === 401) {
                // تسجيل الخروج عند انتهاء صلاحية الرمز
                removeToken();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
};