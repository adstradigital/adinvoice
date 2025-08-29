"use client";
import React from "react";
import "./Hero.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Hero() {
  return (
    <section className="hero d-flex align-items-center text-center">
      <div className="container">
        <h1 className="hero-title">Smart Invoice Management</h1>
        <p className="hero-subtitle">
          Simplify your billing process with ease and efficiency.
        </p>
        <div className="mt-4">
          <a href="/enquiry" className="btn btn-primary btn-lg me-3">
            Get Started
          </a>
          <a href="/gallery" className="btn btn-outline-light btn-lg">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
