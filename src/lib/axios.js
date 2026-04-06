import axios from "axios";
import { loadingEmitter } from "@/utils/loadingEmitter";

const baseURL = import.meta.env.VITE_API_URL || "https://backendbilliard.onrender.com/api/";

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    loadingEmitter.start();
    console.log("API Request:", config.method.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    loadingEmitter.stop();
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    loadingEmitter.stop();
    console.log("API Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    loadingEmitter.stop();

    if (error.response) {
      console.error("Response Error:", error.response.status, error.response.data);

      if (error.response.status === 401) {
        const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        if (currentPath && currentPath !== "/auth/login") {
          sessionStorage.setItem("postLoginRedirect", currentPath);
        }

        localStorage.removeItem("token");
        window.location.href = "/auth/login";
      }
    } else if (error.request) {
      console.error("No Response:", error.message);
    } else {
      console.error("Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
