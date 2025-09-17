import axios from "axios";

// Base URL of your Django backend
const API_URL = "http://127.0.0.1:8000/api";

// ===== Helper for Auth Headers =====
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token"); // get saved access token
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

// ===== USERS =====

// Login
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/users/signin/`, credentials, {
      headers: { "Content-Type": "application/json" },
    });

    // Save access token to localStorage
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// Get all users
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/`, userData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};

// ===== TENANTS =====

export const getTenants = async () => {
  try {
    const response = await axios.get(`${API_URL}/tenants/`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return [];
  }
};

export const createTenant = async (tenantData) => {
  try {
    const response = await axios.post(`${API_URL}/tenants/`, tenantData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error creating tenant:", error);
    return null;
  }
};

// ===== INVOICES =====

export const getInvoices = async () => {
  try {
    const response = await axios.get(`${API_URL}/invoices/`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const response = await axios.post(`${API_URL}/invoices/`, invoiceData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error creating invoice:", error);
    return null;
  }
};

export const updateInvoice = async (id, invoiceData) => {
  try {
    const response = await axios.put(`${API_URL}/invoices/${id}/`, invoiceData, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error updating invoice:", error);
    return null;
  }
};

export const deleteInvoice = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/invoices/${id}/`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return null;
  }
};


