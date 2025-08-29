"use client";
import { useState } from "react";
import "./ResetPassword.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(null);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(value.length >= 12);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!passwordValid) {
      alert("Password must be at least 12 characters!");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert("✅ Password reset successful!");
    // Redirect or API call here
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Your Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={handlePasswordChange}
            required
            className={passwordValid === false ? "error" : passwordValid ? "success" : ""}
          />
          {password && passwordValid === false && (
            <p className="password-error">
              Password must be at least 12 characters
            </p>
          )}
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
}
