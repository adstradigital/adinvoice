"use client";
import { useState } from "react";
import "./ForgetPassword.css"; // Import CSS file

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`OTP sent to Email: ${email} and Mobile: ${mobile}`);
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
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="fp-input-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              pattern="[0-9]{10}"
              maxLength="10"
            />
          </div>

          <button type="submit" className="fp-button">
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
}
