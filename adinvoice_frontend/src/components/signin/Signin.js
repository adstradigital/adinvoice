"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "../../../Api/index";
import "./SignIn.css";

export default function SignIn() {
  const router = useRouter();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Handle input change with live validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (!value) {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} is required`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    // Simple validation
    if (!formData.username || !formData.password) {
      setErrors({
        username: !formData.username ? "Username is required" : "",
        password: !formData.password ? "Password is required" : "",
      });
      return;
    }

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
      };

      const response = await loginUser(payload);

      if (response?.access) {
        // Save tokens
        localStorage.setItem("accessToken", response.access);
        if (response.refresh) {
          localStorage.setItem("refreshToken", response.refresh);
        }

        // ✅ Redirect to client admin dashboard
        router.push("/client-admin-dashboard");
      } else {
        setServerError("Invalid username or password");
      }
    } catch (err) {
      setServerError(
        err.response?.data?.detail || err.error || "Login failed, try again"
      );
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">Welcome Back 👋</h2>
        <p className="signin-subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="signin-form">
          {/* Username */}
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username or Email"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "input-error" : ""}
              required
            />
            {errors.username && (
              <span className="error-text">{errors.username}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              required
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          {serverError && <p className="error-text">{serverError}</p>}

          <p className="forgot-password">
            <Link href={"/forget-password"}>Forgot Password?</Link>
          </p>

          <button type="submit" className="signin-btn">
            Sign In
          </button>

          <p className="signin-footer">
            Don’t have an account? <Link href="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
