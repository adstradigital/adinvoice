"use client";
import React, { useState } from "react";
import Image from "next/image";  // ✅ Import Image
import Link from "next/link";    // ✅ Use Link for internal navigation
import "./Signup.css";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Live validation function
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Full name is required";
        else if (value.trim().length < 3) error = "Name must be at least 3 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Email is invalid";
        break;
      case "mobile":
        if (!value) error = "Mobile number is required";
        else if (!/^\d{10}$/.test(value)) error = "Mobile must be 10 digits";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 6) error = "Password must be at least 6 characters";
        else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value))
          error = "Password must contain letters and numbers";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live validation
    validateField(name, value);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields on submit
    const formErrors = {};
    Object.keys(formData).forEach((field) => {
      validateField(field, formData[field]);
      if (errors[field]) formErrors[field] = errors[field];
    });

    if (Object.values(errors).every((err) => err === "")) {
      console.log("Form submitted:", formData);
      alert("SignUp Successful!");
      setFormData({ name: "", email: "", mobile: "", password: "" });
      setErrors({});
    } else {
      console.log("Fix errors before submitting:", errors);
    }
  };

  return (
    <div className="signup-page">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>

      <div className="signup-content">
        {/* Left Content */}
        <div className="signup-left">
          <h1>Welcome to AdInvoice 🚀</h1>
          <p>
            Simplify your invoicing process and manage your clients effortlessly.
            <br />
            Sign up today and take the first step towards smarter business management.
          </p>

          {/* ✅ Optimized Image */}
          <Image
            src="/assets/invoice.jpg"
            alt="Illustration"
            width={400}
            height={300}
            priority
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>

        {/* Right Form */}
        <div className="signup-right">
          <form className="signup-form" onSubmit={handleSubmit}>
            <h2>Create an Account</h2>

            {/* Name */}
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

<<<<<<< HEAD
            {/* ✅ Mobile Number Field */}
=======
            {/* Mobile */}
>>>>>>> 61716fc1f4f5aa0f1f38654f2c90377621fa65f6
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                placeholder="Enter your mobile number"
                value={formData.mobile}
                onChange={handleChange}
                className={errors.mobile ? "input-error" : ""}
              />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" className="signup-btn">
              Sign Up
            </button>

            <p className="login-link">
              Already have an account?{" "}
              <Link href="/signin">Sign In</Link>  {/* ✅ Use Link instead of <a> */}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
