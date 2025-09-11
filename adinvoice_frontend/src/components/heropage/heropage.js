"use client";
import { useEffect } from "react";
import "./heropage.css";

export default function Hero() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target); // Animate only once
          }
        });
      },
      { threshold: 0.2 }
    );

    reveals.forEach((el) => observer.observe(el));
  }, []);

  return (
    <section className="hero" id="top">
      <div className="container grid">
        <div className="reveal">
          <div className="eyebrow">Built with Purpose. Powered by Trust.</div>
          <h1>Online Billing Platform by Adstra Digital</h1>
          <p className="lead">
            We understand the real challenges of running a business—chasing
            deadlines, managing clients, and keeping your finances in order.
            That’s why we built this platform with <strong>empathy</strong>, not
            just efficiency.
          </p>
          <ul className="bullets">
            <li>Simple enough for first-time users</li>
            <li>Smart enough for seasoned professionals</li>
            <li>Beautiful enough to make your brand shine</li>
          </ul>
          <p className="subheadline reveal">
            This isn’t just software. It’s <strong>support</strong>—with
            clarity, care, and commitment.
          </p>
          <div className="hero-cta reveal">
            <a href="#start" className="cta">Get Started</a>
            <a href="#why" className="cta-outline">Why this platform?</a>
          </div>
        </div>

        <div className="panel device-mock reveal">
          Your Proposals → Invoices → Receipts
        </div>
      </div>
    </section>
  );
}
