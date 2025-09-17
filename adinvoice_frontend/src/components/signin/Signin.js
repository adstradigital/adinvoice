"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // for redirecting after login
import { loginUser } from "../../../Api/index";

import "./SignIn.css";

export default function SignIn() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live validation
    if (name === "email") {
      if (!value) {
        setErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        setErrors((prev) => ({ ...prev, email: "Email is invalid" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (name === "password") {
      if (!value) {
        setErrors((prev) => ({ ...prev, password: "Password is required" }));
      } else if (value.length < 6) {
        setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));
      } else {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setServerError("");

    // ===== Call API =====
    const response = await loginUser(formData);

    if (response && response.access) {
      // Successful login, redirect to dashboard
      router.push("/dashboard");
    } else {
      // Login failed
      setServerError("Invalid email or password");
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">Welcome Back 👋</h2>
        <p className="signin-subtitle">Sign in to continue</p>

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

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
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {serverError && <p className="error-text">{serverError}</p>}

          <p className="forgot-password">
            <Link href={"/forget-password"}>Forgot Password?</Link>
          </p>

          <button type="submit" className="signin-btn">Sign In</button>

          <p className="signin-footer">
            Don’t have an account? <Link href="/signup">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
