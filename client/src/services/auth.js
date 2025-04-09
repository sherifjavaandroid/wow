// src/services/auth.js - خدمة المصادقة
import api from './api';

export const TOKEN_KEY = '@code-analyzer:token';
export const USER_KEY = '@code-analyzer:user';

// حفظ رمز الوصول والمستخدم في التخزين المحلي
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const setUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// الحصول على رمز الوصول والمستخدم من التخزين المحلي
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
        return JSON.parse(user);
    }
    return null;
};

// إزالة رمز الوصول والمستخدم من التخزين المحلي
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const removeUser = () => {
    localStorage.removeItem(USER_KEY);
};

// التحقق من حالة المصادقة
export const isAuthenticated = () => {
    return getToken() !== null;
};

// تسجيل الدخول
export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
};

// تسجيل مستخدم جديد
export const register = async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
};

// تسجيل الخروج
export const logout = () => {
    removeToken();
    removeUser();
};