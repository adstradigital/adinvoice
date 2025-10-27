// api.js
import axios from "axios";
// import { handleApiError } from "./errorHandler"

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
        console.log(res.data.tenant_id);
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
    console.error(
      "Error fetching users:",
      error.response?.data || error.message
    );
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
    console.error(
      "Error fetching client companies:",
      error.response?.data || error.message
    );
    return [];
  }
};

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
    console.error(
      "Error adding client company:",
      error.response?.data || error.message
    );
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
      params: { _method: "PUT" }, // Tell Django this is actually a PUT
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error updating client company:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to update client company" };
  }
};

// Delete client company
export const deleteClientCompany = async (clientId) => {
  try {
    const res = await API.delete(`/clients/delete/${clientId}/`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error deleting client company:",
      error.response?.data || error.message
    );
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
    const res = await API.get("/users/own-company/", {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching own company details:",
      error.response?.data || error.message
    );
    return null;
  }
};

// New API for updating all fields
export const updateCompanyDetails = async (companyData) => {
  try {
    const res = await API.patch("/users/own-company/update/", companyData, {
      headers: getAuthHeaders(),
      // withCredentials: true, // uncomment if backend uses session auth
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error updating all company details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// ===== PROPOSALS =====
export const getAllProposals = async () => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) {
    console.error("Tenant ID not found. Please login again.");
    return [];
  }

  try {
    const res = await API.post(
      "/proposals/get_my_proposals/",
      { tenant: tenantId },
      { headers: getAuthHeaders() }
    );
    return res.data.proposals || [];
  } catch (error) {
    console.error(
      "Error fetching proposals:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Updated API function for direct client filtering
export const getProposalsByClient = async (clientId) => {
  const tenantId = localStorage.getItem("tenant_id");

  if (!tenantId) {
    console.error("Tenant ID not found. Please login again.");
    return [];
  }

  try {
    const res = await API.get(`/proposal/client/${clientId}/`, {
      headers: getAuthHeaders(),
      params: { tenant: tenantId }, // ✅ send tenant in query params
    });

    console.log("✅ Proposals by Client:", res.data.proposals);
    return res.data.proposals || [];
  } catch (error) {
    console.error(
      "❌ Error fetching proposals by client:",
      error.response?.data || error.message
    );
    return [];
  }
};

// ✅ Upload Document
export async function uploadDocument(file, docType) {
  try {
    const token = localStorage.getItem("access_token"); // make sure it's access_token
    const formData = new FormData();
    formData.append("document_file", file);
    formData.append("doc_type", docType);

    const res = await axios.post(
      `${API_URL}/users/own-company/upload-document/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

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
    const res = await axios.delete(
      `${API_URL}/users/own-company/delete-document/${docId}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Delete failed:", err);
    throw err;
  }
};

// ===== MERCHANTS =====
export const getPendingMerchants = async () => {
  try {
    const res = await API.get("/users/pending-users/", {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching pending merchants:",
      error.response?.data || error.message
    );
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
    console.error(
      "Error updating merchant status:",
      error.response?.data || error.message
    );
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
      { tenant: tenant_id }, // send tenant_id in body
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
    const res = await API.post("/products/create/", payload, {
      headers: getAuthHeaders(),
    });
    return res.data.item;
  } catch (error) {
    console.error(
      "Error adding product:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to add product/service" };
  }
};

// Update Product/Service
export const updateProduct = async (id, productData) => {
  const tenantId = localStorage.getItem("tenant_id"); // ✅ get tenant ID
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  const payload = { ...productData, tenant: tenantId };

  try {
    const res = await API.put(`/products/${id}/update/`, payload, {
      headers: getAuthHeaders(),
    });
    return res.data.item;
  } catch (error) {
    console.error(
      "Error updating product/service:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || { detail: "Failed to update product/service" }
    );
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
    console.error(
      "Error deleting product/service:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || { detail: "Failed to delete product/service" }
    );
  }
};

// ===== CATEGORIES =====
export const listCategories = async () => {
  try {
    const tenantId = localStorage.getItem("tenant_id");
    const res = await API.get("products/categories/", {
      headers: getAuthHeaders(),
      params: { tenantId }, // ✅ tenantId sent as query param
    });
    return res.data.items || [];
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error.response?.data || error.message
    );
    return [];
  }
};

export const createCategory = async (name) => {
  try {
    const tenantId = localStorage.getItem("tenant_id");
    const res = await API.post(
      "products/categories/create/",
      { name, tenantId }, // ✅ include tenantId in body
      { headers: getAuthHeaders() }
    );
    return res.data.item;
  } catch (error) {
    console.error(
      "Error creating category:",
      error.response?.data || error.message
    );
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

// ===== PROPOSALS (Using Axios) =====

// Save Proposal
export const saveProposal = async (proposalData) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  try {
    // Format dates to YYYY-MM-DD
    const formattedData = {
      ...proposalData,
      date: formatDateForAPI(proposalData.date),
      due_date: proposalData.due_date
        ? formatDateForAPI(proposalData.due_date)
        : null,
      tenant: tenantId,
    };

    console.log("📤 Saving proposal:", formattedData);

    const res = await API.post("/proposal/create/", formattedData, {
      headers: getAuthHeaders(),
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error saving proposal:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to save proposal" };
  }
};

// Get Proposals
export const getProposals = async () => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  try {
    console.log("📥 Fetching proposals for tenant:", tenantId);

    const res = await API.post(
      "/proposal/list/",
      {
        tenant: tenantId,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching proposals:",
      error.response?.data || error.message
    );

    // Return empty array instead of throwing to prevent UI break
    return {
      success: "Proposals fetched successfully (fallback)",
      count: 0,
      proposals: [],
    };
  }
};

// Update Proposal
export const updateProposal = async (id, proposalData) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  try {
    const res = await API.put(
      `/proposal/${id}/update/`,
      {
        ...proposalData,
        tenant: tenantId,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Error updating proposal:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to update proposal" };
  }
};

// Delete Proposal
export const deleteProposal = async (id) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  try {
    const res = await API.delete(`/proposal/${id}/delete/`, {
      headers: getAuthHeaders(),
      data: { tenant: tenantId },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error deleting proposal:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to delete proposal" };
  }
};

// Helper function to format dates for API
const formatDateForAPI = (dateString) => {
  if (!dateString) return null;

  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Convert from other formats to YYYY-MM-DD
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString);
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Get Single Proposal
export const getProposalDetail = async (id) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  try {
    const res = await API.post(
      `/proposal/${id}/`,
      {
        // ✅ Changed to singular
        tenant: tenantId,
      },
      { headers: getAuthHeaders() }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching proposal:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to fetch proposal" };
  }
};

// Update Proposal Status
export const updateProposalStatus = async (id, status) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  try {
    const res = await API.post(
      `/proposal/${id}/status/`,
      {
        // ✅ Changed to singular
        tenant: tenantId,
        status: status,
      },
      { headers: getAuthHeaders() }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Error updating proposal status:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || { detail: "Failed to update proposal status" }
    );
  }
};

// Get Proposal Statistics
export const getProposalStats = async () => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  try {
    const res = await API.post(
      "/proposal/stats/",
      {
        // ✅ Changed to singular
        tenant: tenantId,
      },
      { headers: getAuthHeaders() }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching proposal stats:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to fetch proposal stats" };
  }
};

// getproposalitems - FIXED VERSION
export const getProposalItems = async (proposalId) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) {
    throw new Error("Tenant ID not found. Please login again.");
  }

  try {
    const response = await API.get(`/proposal/${proposalId}/items/`, {
      headers: getAuthHeaders(),
      params: { tenant: tenantId }, // Send tenant as query parameter
    });

    console.log("📦 Proposal items API response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching proposal items:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to fetch proposal items" };
  }
};

export const saveInvoice = async (invoiceData) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) {
    throw new Error("Tenant ID not found. Please login again.");
  }
  try {
    const dataToSend = { ...invoiceData, tenant: tenantId };

    const res = await API.post("/invoices/create/", dataToSend, {
      headers: getAuthHeaders(),
    });

    console.log("✅ Invoice saved successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "Error saving invoice:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to save invoice" };
  }
};

// Get All Invoices - FIXED VERSION
export const getInvoices = async () => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  try {
    console.log("📋 Fetching invoices for tenant:", tenantId);

    // ✅ CHANGE FROM POST TO GET
    const res = await API.get("/invoices/list/", {
      params: { tenant: tenantId }, // Send tenant as query parameter
      headers: getAuthHeaders(),
    });

    console.log("📋 Invoices API response:", res.data);

    // Handle different response formats
    if (res.data && res.data.invoices) {
      return res.data;
    } else if (res.data && Array.isArray(res.data)) {
      // If response is directly an array
      return { invoices: res.data };
    } else if (res.data && res.data.success) {
      // If response has success structure
      return res.data;
    } else {
      console.warn("⚠️ Unexpected API response format:", res.data);
      return { invoices: [] };
    }
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);

    // More detailed error logging
    if (error.response) {
      console.error(
        "📋 Response error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("📋 Request error:", error.request);
    } else {
      console.error("📋 Error message:", error.message);
    }

    throw error.response?.data || { detail: "Failed to fetch invoices" };
  }
};

// Get Single Invoice
export const getInvoiceDetail = async (invoiceId) => {
  const tenantId = localStorage.getItem("tenant_id");

  try {
    const res = await API.get(`/invoices/${invoiceId}/`, {
      headers: getAuthHeaders(),
      params: { tenant: tenantId },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching invoice:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to fetch invoice" };
  }
};

// Update Invoice Status
export const updateInvoiceStatus = async (invoiceId, status) => {
  const tenantId = localStorage.getItem("tenant_id");

  try {
    const res = await API.patch(
      `/invoices/${invoiceId}/status/`,
      {
        status: status,
        tenant: tenantId,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Error updating invoice status:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to update invoice status" };
  }
};

// ✅ FIXED FETCH DRAFT INVOICES FUNCTION
const fetchDraftInvoices = async () => {
  try {
    console.log("🔄 Fetching draft invoices...");

    const invoicesData = await getInvoices();
    console.log("📋 Raw invoices data:", invoicesData);

    let invoices = [];

    // Handle different response formats
    if (invoicesData && invoicesData.invoices) {
      invoices = invoicesData.invoices;
    } else if (invoicesData && Array.isArray(invoicesData)) {
      invoices = invoicesData;
    } else if (invoicesData && invoicesData.data) {
      invoices = invoicesData.data.invoices || invoicesData.data || [];
    }

    console.log("📋 Processed invoices:", invoices);

    // Filter for draft invoices
    const drafts = invoices.filter((invoice) => {
      // Handle case where status might be undefined or null
      const status = invoice.status || "draft";
      return status.toLowerCase() === "draft";
    });

    console.log("📋 Draft invoices found:", drafts.length);
    setDraftInvoices(drafts);
  } catch (err) {
    console.error("❌ Error fetching draft invoices:", err);

    // More detailed error information
    if (err.response) {
      console.error(
        "📋 Server responded with:",
        err.response.status,
        err.response.data
      );
    } else if (err.request) {
      console.error("📋 No response received:", err.request);
    } else {
      console.error("📋 Error details:", err.message);
    }

    // Set empty array to avoid breaking the UI
    setDraftInvoices([]);
  }
};

// In Api/index.js - Add these functions

// ✅ FIXED GET INVOICE BY ID - Using consistent axios approach
export const getInvoiceById = async (invoiceId) => {
  try {
    const tenantId = localStorage.getItem("tenant_id");
    if (!tenantId) {
      throw new Error("Tenant ID not found. Please login again.");
    }

    console.log(`🔍 Fetching invoice ${invoiceId} for tenant:`, tenantId);

    const res = await API.get(`/invoices/${invoiceId}/`, {
      headers: getAuthHeaders(),
      params: { tenant: tenantId },
    });

    console.log("✅ Invoice data received:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching invoice:", error);

    if (error.response?.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      throw new Error("Authentication failed. Please log in again.");
    }

    throw error.response?.data || { detail: "Failed to fetch invoice" };
  }
};

// In your Api/index.js - Update the updateInvoice function
export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const tenantId = localStorage.getItem("tenant_id");
    if (!tenantId) {
      throw new Error("Tenant ID not found. Please login again.");
    }

    const dataToSend = {
      ...invoiceData,
      tenant: tenantId,
    };

    console.log("📤 Updating invoice:", invoiceId);

    // ✅ MOST LIKELY CORRECT PATTERN:
    const res = await API.put(`/invoices/${invoiceId}/update/`, dataToSend, {
      headers: getAuthHeaders(),
    });

    console.log("✅ Invoice updated successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error updating invoice:", error);

    if (error.response?.status === 404) {
      // Get the base URL for debugging
      const baseURL = API.defaults.baseURL || "http://localhost:8000";
      throw new Error(
        `Update endpoint not found. Tried: ${baseURL}/api/invoices/${invoiceId}/update/\n\nPlease check:\n1. Main urls.py includes\n2. Invoice app URL patterns\n3. Backend server is running`
      );
    }

    throw error.response?.data || { detail: "Failed to update invoice" };
  }
};

// In your Api/index.js - Add receipt functions

// Create Receipt
// In your Api/index.js - Add these multi-tenant receipt functions
export const createReceipt = async (receiptData) => {
  try {
    const tenantId = localStorage.getItem("tenant_id");
    if (!tenantId) {
      throw new Error("Tenant ID not found. Please login again.");
    }

    const dataToSend = {
      ...receiptData,
      tenant: tenantId, // ✅ ADD TENANT ID LIKE PROPOSALS
    };

    console.log("📤 Creating receipt with tenant:", dataToSend);

    const res = await API.post("/receipts/create/", dataToSend, {
      headers: getAuthHeaders(),
    });

    console.log("✅ Receipt created successfully:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error creating receipt:", error);
    throw error.response?.data || { detail: "Failed to create receipt" };
  }
};

export const getReceipts = async () => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found. Please login again.");

  try {
    const res = await API.get(
      "/receipts/list/",
      {
        tenant: tenantId, // ✅ ADD TENANT ID LIKE PROPOSALS
      },
      {
        headers: getAuthHeaders(),
      }
    );

    return res.data;
  } catch (error) {
    console.error("❌ Error fetching receipts:", error);
    throw error.response?.data || { detail: "Failed to fetch receipts" };
  }
};

// Get Receipt by ID
export const getReceiptById = async (receiptId) => {
  try {
    const tenantId = localStorage.getItem("tenant_id");
    if (!tenantId) {
      throw new Error("Tenant ID not found. Please login again.");
    }

    const res = await API.get(`/receipts/${receiptId}/`, {
      headers: getAuthHeaders(),
      params: { tenant: tenantId },
    });

    return res.data;
  } catch (error) {
    console.error("❌ Error fetching receipt:", error);
    throw error.response?.data || { detail: "Failed to fetch receipt" };
  }
};

// Update Receipt
export const updateReceipt = async (receiptId, receiptData) => {
  try {
    const tenantId = localStorage.getItem("tenant_id");
    if (!tenantId) {
      throw new Error("Tenant ID not found. Please login again.");
    }

    const dataToSend = {
      ...receiptData,
      tenant: tenantId,
    };

    const res = await API.put(`/receipts/${receiptId}/update/`, dataToSend, {
      headers: getAuthHeaders(),
    });

    return res.data;
  } catch (error) {
    console.error("❌ Error updating receipt:", error);
    throw error.response?.data || { detail: "Failed to update receipt" };
  }
};

// Delete Receipt
export const deleteReceipt = async (receiptId) => {
  try {
    const tenantId = localStorage.getItem("tenant_id");
    if (!tenantId) {
      throw new Error("Tenant ID not found. Please login again.");
    }

    const res = await API.delete(`/receipts/${receiptId}/delete/`, {
      headers: getAuthHeaders(),
      data: { tenant: tenantId },
    });

    return res.data;
  } catch (error) {
    console.error("❌ Error deleting receipt:", error);
    throw error.response?.data || { detail: "Failed to delete receipt" };
  }
};

//  Fetch all notifications for the current client admin tenant

export const fetchClientAdminNotifications = async () => {
  try {
    // ✅ Get JWT token from localStorage
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("User not authenticated");

    // Axios GET request with Authorization header
    const response = await axios.get(`${API_URL}/notifications/list/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Include token
      },
    });

    console.log("✅ Notifications fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch notifications:", error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }

    throw error.response?.data || { detail: "Failed to fetch notifications" };
  }
};

// Tenant Support Ticket submission
export const submitSupportTicket = async (formData, file = null) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("User not authenticated");

    const data = new FormData();
    data.append("subject", formData.subject);
    data.append("description", formData.description);
    if (file) data.append("file", file);

    const response = await axios.post(
      `${API_URL}/support/create/`, // Make sure this URL is correct
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // ✅ send token
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error submitting ticket:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to submit ticket" };
  }
};

export const fetchClientAdminAnalytics = async () => {
  try {
    const tenantId = localStorage.getItem("tenant_id");
    if (!tenantId) throw new Error("Tenant ID not found");

    const response = await axios.get(
      `${API_URL}/analytic/client-admin/analytics/${tenantId}/`,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching analytics:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to fetch analytics" };
  }
};






// api_clientadmin.js
const BASE_URL = "http://127.0.0.1:8000/api/users/";

// Users
export const fetchUsers = async (tenantId) => {
  const res = await fetch(`${BASE_URL}user/${tenantId}/`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const createUser = async (tenantId, data) => {
  const res = await fetch(`${BASE_URL}user/create/${tenantId}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const updateUser = async (userId, data) => {
  const tenantId = localStorage.getItem("tenant_id");
  const res = await fetch(`${BASE_URL}user/${userId}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...data, tenant: tenantId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const deleteUser = async (userId) => {
  const tenantId = localStorage.getItem("tenant_id");
  const res = await fetch(`${BASE_URL}user/${userId}/delete/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tenant: tenantId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

// Roles
export const fetchRoles = async (tenantId) => {
  const res = await fetch(`${BASE_URL}roles/${tenantId}/`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const createRole = async (tenantId, data) => {
  const res = await fetch(`${BASE_URL}roles/${tenantId}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...data, tenant: tenantId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const updateRole = async (roleId, data) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found");

  const res = await fetch(`${BASE_URL}roles/${roleId}/update/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...data, tenant: tenantId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

// Delete Role
export const deleteRole = async (roleId) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) throw new Error("Tenant ID not found");

  const res = await fetch(`${BASE_URL}roles/${roleId}/delete/?tenant=${tenantId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};


// Permissions
export const fetchPermissions = async (tenantId) => {
  const res = await fetch(`${BASE_URL}permissions/?tenant=${tenantId}`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const createPermission = async (tenantId, data) => {
  const res = await fetch(`${BASE_URL}permissions/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...data, tenant: tenantId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.code?.[0] || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const updatePermission = async (permId, data) => {
  const tenantId = localStorage.getItem("tenant_id");
  const res = await fetch(`${BASE_URL}permissions/${permId}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ ...data, tenant: tenantId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.code?.[0] || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};

export const deletePermission = async (permId) => {
  const tenantId = localStorage.getItem("tenant_id");
  const res = await fetch(`${BASE_URL}permissions/${permId}/`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tenant: tenantId }),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || `HTTP error! Status: ${res.status}`);
  }
  return res.json();
};