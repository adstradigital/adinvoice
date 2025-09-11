"use client";
import React from "react";
import "./SignIn.css";
import Link from "next/link";
import forgetPassword from "@/app/forget-password/page";

export default function SignIn() {
  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2 className="signin-title">Welcome Back 👋</h2>
        <p className="signin-subtitle">Sign in to continue</p>

        <form className="signin-form">
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />

          {/* 🔹 Forgot Password Link */}
          <p className="forgot-password">
            
            <Link href={"./forget-password"}>Forgot Password?</Link>
          </p>

          <button type="submit" className="signin-btn">Sign In</button>

          <p className="signin-footer">
            Don’t have an account? <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
}
