"use client";
import { useState, useEffect } from "react";
import "./Otpverify.css"; // Custom CSS

export default function OtpVerify() {
  const [emailOtp, setEmailOtp] = useState("");
  const [smsOtp, setSmsOtp] = useState("");
  const [emailValid, setEmailValid] = useState(null);
  const [smsValid, setSmsValid] = useState(null);
  const [timer, setTimer] = useState(30);

  // Countdown Timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const correctEmailOtp = "1234";
  const correctSmsOtp = "5678";

  const handleEmailVerify = () => {
    setEmailValid(emailOtp === correctEmailOtp);
  };

  const handleSmsVerify = () => {
    setSmsValid(smsOtp === correctSmsOtp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailValid && smsValid) {
      alert("OTP Verified ✅ Redirecting to Reset Password Page...");
    } else {
      alert("❌ Please verify both OTPs first.");
    }
  };

  return (
    <div className="otp-container">
      <h2 className="otp-title">OTP Verification</h2>
      <form onSubmit={handleSubmit} className="otp-form">

        {/* Email OTP */}
        <div className="otp-row">
          <label>Email OTP</label>
          <div className="otp-input-group">
            <input
              type="text"
              placeholder="Enter Email OTP"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value)}
              className="inputField"
            />
            <button
              type="button"
              className={`verify-btn ${emailValid ? "success" : emailValid === false ? "error" : ""}`}
              onClick={handleEmailVerify}
            >
              Verify
            </button>
          </div>
        </div>

        {/* SMS OTP */}
        <div className="otp-row">
          <label>SMS OTP</label>
          <div className="otp-input-group">
            <input
              type="text"
              placeholder="Enter SMS OTP"
              value={smsOtp}
              onChange={(e) => setSmsOtp(e.target.value)}
              className="inputField"
            />
            <button
              type="button"
              className={`verify-btn ${smsValid ? "success" : smsValid === false ? "error" : ""}`}
              onClick={handleSmsVerify}
            >
              Verify
            </button>
          </div>
        </div>

        {/* Timer */}
        <div className="otp-timer">
          {timer > 0 ? `Resend OTP in ${timer}s` : "You can resend OTP now"}
        </div>

        {/* Resend Button */}
        <div className="otp-resend-btn-container">
          <button
            type="button"
            className="resend-btn"
            disabled={timer > 0}
            onClick={() => setTimer(30)}
          >
            Resend OTP
          </button>
        </div>

        {/* Submit Button */}
        <div className="otp-submit">
          <button type="submit" className="next-btn">
            Next
          </button>
        </div>

      </form>
    </div>
  );
}
