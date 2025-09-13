"use client";
import { useState } from "react";
import "./ForgetPassword.css"; // Keep your existing design

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setEmail(value);
      if (!value) {
        setErrors((prev) => ({ ...prev, email: "Email is required" }));
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        setErrors((prev) => ({ ...prev, email: "Email is invalid" }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }

    if (name === "mobile") {
      setMobile(value);
      if (!value) {
        setErrors((prev) => ({ ...prev, mobile: "Mobile number is required" }));
      } else if (!/^\d{10}$/.test(value)) {
        setErrors((prev) => ({ ...prev, mobile: "Mobile number must be 10 digits" }));
      } else {
        setErrors((prev) => ({ ...prev, mobile: "" }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(mobile)) newErrors.mobile = "Mobile number must be 10 digits";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      alert(`OTP sent to Email: ${email} and Mobile: ${mobile}`);
      setEmail("");
      setMobile("");
    }
  };

  return (
    <div className="fp-container">
      <div className="fp-card">
        <h2 className="fp-title">Forgot Password?</h2>
        <p className="fp-subtitle">
          Enter your email or mobile number and we’ll send you an OTP to reset your password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="fp-input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="fp-input-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={handleChange}
              maxLength="10"
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          <button type="submit" className="fp-button">
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
}

