"use client";

import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header>
      <nav className="nav container">
        {/* Brand Section */}
        <div className="brand">
          <img
          src="/assets/adinvoicelogo.jpg"
          alt="Adinvoice Logo"
          className="logo-img"
          />
          <div className="brand-text">
            <div className="brand-title">ADInvoice</div>
            <small className="brand-subtitle">
              Automate. Accelerate. AdInvoice
            </small>
          </div>
        </div>

        {/* Nav Links + CTA */}
        <div className={`navlinks ${isOpen ? "open" : ""}`}>
          <a href="#top">Home</a>
          <a href="#why">About Us</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>

          {/* Sign In Button */}
          <a href="/signin" className="signin-btn">
            Sign In
          </a>

          {/* CTA Button */}
          <a href="#pricing" className="cta">
            <span>Start Billing Smarter</span>
            <span className="price">
              ₹4,500<span>/year</span>
            </span>
          </a>
        </div>

        {/* Burger Menu */}
        <button
          className="burger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>
    </header>
  );
}
