// api.js
import axios from "axios";
import { handleApiError } from "./errorHandler"

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
export const loginUser = async (credentials) => {
  try {
    const res = await API.post("/users/signin/", {
      username: credentials.username,
      password: credentials.password,
    });

    if (res.data.access) {
    
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

  
      if (res.data.tenant_id) {
        localStorage.setItem("tenant_id", res.data.tenant_id);
        console.log( res.data.tenant_id)
        
      }
    }

    return res.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Login failed" };
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ===== USERS =====
export const getUsers = async () => {
  try {
    const res = await API.get("/users/", { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    return [];
  }
};

export const signupUser = async (userData) => {
  try {
    const res = await API.post("/users/register/", userData);
    return res.data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Signup failed" };
  }
};

// ===== CLIENT COMPANIES =====

// List client companies (tenant_id included in URL)
export const getClientsCompanies = async () => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) {
    console.error("Tenant ID not found. Please login again.");
    return [];
  }

  try {
    const res = await API.get(`/clients/list/${tenantId}/`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching client companies:", error.response?.data || error.message);
    return [];
  }
};

// Add client company (tenant included in payload)
// export const addClientCompany = async (companyData) => {
//   const tenantId = localStorage.getItem("tenant_id");
//   if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

//   const payload = { ...companyData, tenant: tenantId };

//   try {
//     const res = await API.post("/clients/create/", payload, { headers: getAuthHeaders() });
//     return res.data;
//   } catch (error) {
//     console.error("Error adding client company:", error.response?.data || error.message);
//     throw error.response?.data || { detail: "Failed to add client company" };
//   }
// };

// // Update client company (tenant included in payload)
// export const updateClientCompany = async (clientId, companyData) => {
//   const tenantId = localStorage.getItem("tenant_id");
//   if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

//   const payload = { ...companyData, tenant: tenantId };

//   try {
//     const res = await API.put(`/clients/update/${clientId}/`, payload, { headers: getAuthHeaders() });
//     return res.data;
//   } catch (error) {
//     console.error("Error updating client company:", error.response?.data || error.message);
//     throw error.response?.data || { detail: "Failed to update client company" };
//   }
// };

// Add client company
export const addClientCompany = async (formData) => {
  try {
    const res = await API.post("/clients/create/", formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data", // important for file uploads
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error adding client company:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to add client company" };
  }
};

// Update client company
export const updateClientCompany = async (clientId, formData) => {
  try {
    const res = await API.post(`/clients/update/${clientId}/`, formData, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
      params: { _method: "PUT" },  // Tell Django this is actually a PUT
    });
    return res.data;
  } catch (error) {
    console.error("Error updating client company:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to update client company" };
  }
};



// Delete client company
export const deleteClientCompany = async (clientId) => {
  try {
    const res = await API.delete(`/clients/delete/${clientId}/`, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error deleting client company:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to delete client company" };
  }
};

// Toggle client status
export const toggleClientStatus = async (clientId, tenantId) => {
  const token = localStorage.getItem("access_token");

  const res = await axios.patch(
    `${API_URL}/clients/toggle-status/${clientId}/`,
    { tenant: tenantId },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

// ===== OWN COMPANY =====
export const getOwnCompanyDetails = async () => {
  try {
    const res = await API.get("/users/own-company/", { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error fetching own company details:", error.response?.data || error.message);
    return null;
  }
};

export const updateOwnCompanyDetails = async (companyData) => {
  try {
    const res = await API.put("/users/own-company/", companyData, { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error updating company details:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Upload Document
export async function uploadDocument(file, docType) {
  try {
    const token = localStorage.getItem("access_token"); // make sure it's access_token
    const formData = new FormData();
    formData.append("document_file", file);
    formData.append("doc_type", docType);

    const res = await axios.post(`${API_URL}/users/own-company/upload-document/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err) {
    console.error("Error uploading document:", err);
    throw err;
  }
}


// Delete document API
export const deleteDocument = async (docId) => {
  try {
    const token = localStorage.getItem("access_token");
    const res = await axios.delete(`${API_URL}/users/own-company/delete-document/${docId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Delete failed:", err);
    throw err;
  }
};


// ===== MERCHANTS =====
export const getPendingMerchants = async () => {
  try {
    const res = await API.get("/users/pending-users/", { headers: getAuthHeaders() });
    return res.data;
  } catch (error) {
    console.error("Error fetching pending merchants:", error.response?.data || error.message);
    throw error;
  }
};

export const updateMerchantStatus = async (id, action) => {
  try {
    const res = await API.put(
      `/tenants/update/${id}/`,
      { action }, // "enable" or "disable"
      { headers: getAuthHeaders() }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating merchant status:", error.response?.data || error.message);
    throw error;
  }
};

// ===== PRODUCTS & SERVICES =====

// Add JWT token automatically if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get entrepreneur’s products/services (using POST to send tenant_id in body)
export const getProductsServices = async () => {
  const tenant_id = localStorage.getItem("tenant_id"); // get tenant_id from localStorage
  try {
    const res = await API.post(
      "/products/my/", 
      { tenant: tenant_id },       // send tenant_id in body
      { headers: getAuthHeaders() } // include auth headers
    );
    return res.data.items || [];
  } catch (error) {
    console.error(
      "Error fetching products/services:", 
      error.response?.data || error.message
    );
    return [];
  }
};

// Add Product/Service
export const addProduct = async (productData) => {
  const tenantId = localStorage.getItem("tenant_id"); // ✅ get tenant ID from localStorage
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  // include tenant in payload
  const payload = { ...productData, tenant: tenantId };

  try {
    const res = await API.post("/products/create/", payload, { headers: getAuthHeaders() });
    return res.data.item;
  } catch (error) {
    console.error("Error adding product:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to add product/service" };
  }
};

// Update Product/Service
export const updateProduct = async (id, productData) => {
  const tenantId = localStorage.getItem("tenant_id"); // ✅ get tenant ID
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  const payload = { ...productData, tenant: tenantId };

  try {
    const res = await API.put(`/products/${id}/update/`, payload, { headers: getAuthHeaders() });
    return res.data.item;
  } catch (error) {
    console.error("Error updating product/service:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to update product/service" };
  }
};


// Delete Product/Service
export const deleteProduct = async (id) => {
  const tenantId = localStorage.getItem("tenant_id"); // get tenant ID from localStorage
  try {
    const res = await API.delete(`/products/${id}/delete/`, {
      headers: getAuthHeaders(),
      data: { tenant: tenantId }, // send tenant ID in request body
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting product/service:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to delete product/service" };
  }
};

// Function to submit a support ticket
export const submitSupportTicket = async (formData, file) => {
  const token = localStorage.getItem("access_token");
  const tenantId = localStorage.getItem("tenant_id"); // ✅ must include tenant

  if (!token) throw new Error("User not authenticated. Please login.");
  if (!tenantId) throw new Error("Tenant ID not found. Please re-login.");

  const payload = new FormData();
  payload.append("tenant", tenantId);              // ✅ include tenant
  payload.append("subject", formData.subject);
  payload.append("description", formData.description);
  if (file) payload.append("file", file);

  const response = await axios.post(`${API_URL}/support/tickets/`, payload, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


// ===== CATEGORIES =====
export const listCategories = async () => {
  try {
    const res = await API.get("products/categories/", { headers: getAuthHeaders() });
    return res.data.items || [];
  } catch (error) {
    console.error("Error fetching categories:", error.response?.data || error.message);
    return [];
  }
};

export const createCategory = async (name) => {
  try {
    const res = await API.post(
      "products/categories/create/",
      { name },
      { headers: getAuthHeaders() }
    );
    return res.data.item;
  } catch (error) {
    console.error("Error creating category:", error.response?.data || error.message);
    throw error.response?.data || { detail: "Failed to create category" };
  }
};

// Interceptor for session expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch a custom event when session expires
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sessionExpired"));
      }
    }
    return Promise.reject(error);
  }
);


