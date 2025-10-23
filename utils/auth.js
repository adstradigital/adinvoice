import jwt_decode from "jwt-decode";

export const checkSession = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return { expired: true, message: "No session found" };

  try {
    const decoded = jwt_decode(token);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      return { expired: true, message: "Session expired. Please login again." };
    }
    return { expired: false };
  } catch (error) {
    return { expired: true, message: "Invalid session. Please login again." };
  }
};
