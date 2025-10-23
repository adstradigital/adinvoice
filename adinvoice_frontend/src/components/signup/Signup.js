"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signupUser } from "../../../Api/api_clientadmin"; // <-- API helper
import "./Signup.css";

export default function SignUp() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: "",
    company_name: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Live validation
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "first_name":
      case "last_name":
        if (!value.trim()) error = `${name === "first_name" ? "First" : "Last"} name is required`;
        else if (value.trim().length < 2) error = "Must be at least 2 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Email is invalid";
        break;
      case "phone":
        if (!value) error = "Phone number is required";
        else if (!/^\+?\d{7,15}$/.test(value)) error = "Enter valid phone number";
        break;
      case "address":
        if (!value.trim()) error = "Address is required";
        break;
      case "date_of_birth":
        if (!value) error = "Date of birth is required";
        else {
          const today = new Date();
          const dob = new Date(value);
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
          if (age < 18) error = "You must be 18 or older";
        }
        break;
      case "company_name":
        if (!value.trim()) error = "Company name is required";
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
    validateField(name, value);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    Object.keys(formData).forEach((field) => validateField(field, formData[field]));

    if (Object.values(errors).every((err) => err === "")) {
      try {
        setLoading(true);

        // <-- API call
        const response = await signupUser(formData);
        console.log("API response:", response);

        alert("SignUp Successful!");

        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          address: "",
          date_of_birth: "",
          company_name: "",
        });
        setErrors({});
      } catch (error) {
        console.error("API Error:", error.response ? error.response.data : error.message);
        alert(error.response?.data?.error || "Failed to register. Please try again!");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please fix the errors before submitting.");
    }
  };

  return (
    <div className="signup-page">
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

            {/* First Name */}
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={handleChange}
                className={errors.first_name ? "input-error" : ""}
              />
              {errors.first_name && <span className="error-text">{errors.first_name}</span>}
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={handleChange}
                className={errors.last_name ? "input-error" : ""}
              />
              {errors.last_name && <span className="error-text">{errors.last_name}</span>}
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

            {/* Phone */}
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "input-error" : ""}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            {/* Address */}
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? "input-error" : ""}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={errors.date_of_birth ? "input-error" : ""}
              />
              {errors.date_of_birth && <span className="error-text">{errors.date_of_birth}</span>}
            </div>

            {/* Company Name */}
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="company_name"
                placeholder="Enter your company name"
                value={formData.company_name}
                onChange={handleChange}
                className={errors.company_name ? "input-error" : ""}
              />
              {errors.company_name && <span className="error-text">{errors.company_name}</span>}
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Submitting..." : "Sign Up"}
            </button>

            <p className="login-link">
              Already have an account? <Link href="/signin">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
