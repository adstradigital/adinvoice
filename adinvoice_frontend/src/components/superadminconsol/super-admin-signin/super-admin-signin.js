"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import router
import { superAdminLogin } from "@../../../Api/api_superadmin";
import "./super-admin-signin.css";

export default function SuperAdminSignin() {
  const router = useRouter(); // Initialize router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await superAdminLogin(email, password);
      console.log("✅ Super Admin Logged in:", response);

      if (!response.is_superuser) {
        setError("Access denied: You are not a super admin.");
        setLoading(false);
        return;
      }

      if (response.access) {
        localStorage.setItem("access_token", response.access);
      }
     
      
      alert("Super Admin login successful!");
      
      print("jasgiugsauidgsauo",response.access)
      // Redirect to dashboard
      router.push("/super-admin-dashboard");
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2>Super Admin Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
