// src/api/axiosConfig.js
import axios from "axios";
import { loadingEmitter } from "@/utils/loadingEmitter";

const baseURL = "http://localhost:9999/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 seconds
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Bắt đầu loading
    loadingEmitter.start();
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    
    return config;
  },
  (error) => {
    loadingEmitter.stop();
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Kết thúc loading
    loadingEmitter.stop();
    console.log('📥 API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    // Kết thúc loading ngay cả khi có lỗi
    loadingEmitter.stop();
    
    if (error.response) {
      console.error('❌ Response Error:', error.response.status, error.response.data);
      
      // Xử lý lỗi 401 (Unauthorized)
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
    } else if (error.request) {
      console.error('❌ No Response:', error.message);
    } else {
      console.error('❌ Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;