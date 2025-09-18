// api.js
import axios from "axios";

// Base URL of your Django backend
const API_URL = "http://127.0.0.1:8000/api";

// Create axios instance
const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== AUTH HELPERS =====
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

// ===== AUTH =====

// Login
export const loginUser = async (credentials) => {
  try {
    const res = await API.post("/users/signin/", {
      email: credentials.email, // ⚠️ backend expects "email" (even if it's username value)
      password: credentials.password,
    });

    // Store tokens if available
    if (res.data.access) {
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
    }

    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Login failed" };
  }
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ===== USERS =====

// Get all users
export const getUsers = async () => {
  try {
    const res = await API.get("/users/", { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    return [];
  }
};

// Signup
export const signupUser = async (userData) => {
  try {
    const res = await API.post("/users/register/", userData);
    return res.data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Signup failed" };
  }
};

export const getProducts = async () => {
  try {
    const res = await API.get("/products/list/", { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error fetching products:", error.response?.data || error.message);
    return [];
  }
};

// Add new product/service
export const addProduct = async (productData) => {
  try {
    const res = await API.post("/products/create/", productData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error adding product:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to add product" };
  }
};

// Delete product/service
export const deleteProduct = async (productId) => {
  try {
    const res = await API.delete(`/products/${productId}/`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error deleting product:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to delete product" };
  }
};

// Get all products/services
export const getProductsServices = async () => {
  try {
    const res = await API.get("/products/", { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error fetching products/services:", error.response?.data || error.message);
    return [];
  }
};

// Get all client companies
export const getClientsCompanies = async () => {
  try {
    const res = await API.get("/clients/companies/", { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error fetching client companies:", error.response?.data || error.message);
    return [];
  }
};

// Add new client company
export const addClientCompany = async (companyData) => {
  try {
    const res = await API.post("/clients/create/", companyData, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error adding client company:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to add client company" };
  }
};

// Update client company
export const updateClientCompany = async (clientId, companyData) => {
  try {
    const res = await API.put(`/clients/update/${clientId}/`, companyData, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error updating client company:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to update client company" };
  }
};
