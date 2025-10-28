"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signupUser } from "../../../Api/api_clientadmin"; 
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

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "first_name":
      case "last_name":
        if (!value.trim()) error = `${name === "first_name" ? "First" : "Last"} name is required`;
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Invalid email format";
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
        break;
      case "company_name":
        if (!value.trim()) error = "Company name is required";
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      alert("Please fix the errors before submitting.");
      return;
    }

    try {
      setLoading(true);

      const response = await signupUser(formData);
      console.log("API Response:", response);

      alert(response.success || "Application submitted successfully ✅");

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
      const errMsg =
        error.error ||
        error.message ||
        "Failed to register. Please try again!";
      alert(errMsg);
      console.error("API Error:", error);
    } finally {
      setLoading(false);
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
        <div className="signup-left">
          <h1>Welcome to AdInvoice 🚀</h1>
          <p>
            Simplify your invoicing process and manage your clients effortlessly.
            <br />
            Sign up today and take the first step towards smarter business
            management.
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

        <div className="signup-right">
          <form className="signup-form" onSubmit={handleSubmit}>
            <h2>Create an Account</h2>

            {Object.keys(formData).map((field) => (
              <div className="form-group" key={field}>
                <label>
                  {field.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </label>
                <input
                  type={
                    field === "email"
                      ? "email"
                      : field === "phone"
                      ? "tel"
                      : field === "date_of_birth"
                      ? "date"
                      : "text"
                  }
                  name={field}
                  placeholder={`Enter your ${field.replace("_", " ")}`}
                  value={formData[field]}
                  onChange={handleChange}
                  className={errors[field] ? "input-error" : ""}
                />
                {errors[field] && (
                  <span className="error-text">{errors[field]}</span>
                )}
              </div>
            ))}

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
