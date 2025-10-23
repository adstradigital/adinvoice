import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/"; // 🔗 Common base URL

// Helper to get JWT access token
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("User not authenticated");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * 📩 Create (send) a new notification from Super Admin
 */
export const createNotificationSuperAdmin = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}notifications/create/`,
      data,
      { headers: getAuthHeaders() }
    );
    console.log("✅ Notification sent successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to send notification:", error);
    throw error.response?.data || { detail: "Failed to send notification" };
  }
};

/**
 * 🎫 Fetch all support tickets (for Super Admin)
 */
export const fetchTicketsSuperAdmin = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}superadmin/support-reports/`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error(
      "❌ Failed to fetch tickets:",
      error.response?.data || error.message
    );
    throw error.response?.data || { detail: "Failed to fetch tickets" };
  }
};

/**
 * 🔄 Update ticket status (pending / resolved)
 */
export const updateTicketStatus = async (ticketId, status) => {
  try {
    const response = await fetch(
      `${BASE_URL}superadmin/support-reports/${ticketId}/update-status/`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );

    if (response.status === 401) {
      throw new Error("Unauthorized: token invalid or expired");
    }

    if (!response.ok) throw new Error("Failed to update status");

    return await response.json();
  } catch (err) {
    console.error("Update ticket status error:", err);
    throw err;
  }
};

/**
 * 🔐 Super Admin login (only for is_superuser=True users)
 */
export const superAdminLogin = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text}`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Super Admin login failed:", error);
    throw error;
  }
};

