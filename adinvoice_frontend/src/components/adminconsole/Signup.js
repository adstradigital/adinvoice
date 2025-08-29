"use client";
import React, { useState } from "react";
import "./Signup.css";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
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
            Simplify your invoicing process and manage your clients
            effortlessly.
            <br />
            Sign up today and take the first step towards smarter business
            management.
          </p>
          <img src="/assets/invoice.jpg" alt="Illustration" />
        </div>

        {/* Right Form */}
        <div className="signup-right">
          <form className="signup-form" onSubmit={handleSubmit}>
            <h2>Create an Account</h2>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
           
            {/* ✅ Mobile Number Field */}
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                placeholder="Enter your mobile number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="signup-btn">
              Sign Up
            </button>
            <p className="login-link">
              Already have an account? <a href="/signin">Sign In</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
