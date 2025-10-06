// axiosInstance.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor (attach token) ---
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); // ✅ make sure you always use "access_token"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
