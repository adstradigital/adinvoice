"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "../../../Api/index";
import "./SignIn.css";

export default function SignIn() {
  const router = useRouter();

  const [formData, setFormData] = useState({ email: "", password: "" });
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
    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? "Email is required" : "",
        password: !formData.password ? "Password is required" : "",
      });
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      const response = await loginUser(payload);

      if (response?.access) {
        localStorage.setItem("accessToken", response.access);
        if (response.refresh) {
          localStorage.setItem("refreshToken", response.refresh);
        }
        router.push("/dashboard");
      } else {
        setServerError("Invalid email or password");
      }
    } catch (err) {
      setServerError(err.response?.data?.detail || "Login failed, try again");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">Welcome Back 👋</h2>
        <p className="signin-subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="signin-form">
          {/* Email */}
          <div className="form-group">
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
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
