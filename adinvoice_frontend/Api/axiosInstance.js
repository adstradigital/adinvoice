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


// Add request interceptor to attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or tenant_id if needed
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      alert("Your session has expired. Please login again.");
      localStorage.removeItem("token"); // remove token
      window.location.href = "/login"; // redirect to login
    }
    return Promise.reject(error);
  }
);


export default API;
