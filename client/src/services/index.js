// src/services/index.js - نقطة دخول للخدمات
import api from './api';
import { setupInterceptors } from './apiInterceptors';
import * as auth from './auth';

// إعداد معترضات API
setupInterceptors();

// تصدير الخدمات
export { api, auth };