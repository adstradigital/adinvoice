"use client";

import "./About.css";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <section className="about-page">
      {/* Intro / Mission */}
      <div className="about-intro" data-aos="fade-up">
        <h1>Why This Platform Exists</h1>
        <p>
          {`Whether you're a freelancer, startup founder, or growing agency, your work deserves a billing
          system as committed as you are.`}
        </p>
      </div>

      {/* How it Works */}
      <div className="about-steps">
        <h2 data-aos="fade-up">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card" data-aos="fade-up" data-aos-delay="100">
            <div className="step-number">1</div>
            <h3>Create a Proposal</h3>
            <p>
              Fill in the essentials and create a professional proposal in under
              a minute.
            </p>
          </div>
          <div className="step-card" data-aos="fade-up" data-aos-delay="200">
            <div className="step-number">2</div>
            <h3>Convert to Invoice</h3>
            <p>
              Once approved, transform proposals into invoices with a single
              click.
            </p>
          </div>
          <div className="step-card" data-aos="fade-up" data-aos-delay="300">
            <div className="step-number">3</div>
            <h3>Send Receipts Instantly</h3>
            <p>
              Deliver receipts via Email or WhatsApp—no downloads, no delays.
            </p>
          </div>
          <div className="step-card" data-aos="fade-up" data-aos-delay="400">
            <div className="step-number">4</div>
            <h3>Work From Anywhere</h3>
            <p>
              Send proposals and invoices on the go, wherever you are in the
              world.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="about-features">
        <h2 data-aos="fade-up">Features That Matter</h2>
        <div className="features-grid">
          <div className="feature-card" data-aos="zoom-in" data-aos-delay="100">
            <h3>All-in-One Control</h3>
            <p>Manage proposals, invoices, and receipts from one platform.</p>
          </div>
          <div className="feature-card" data-aos="zoom-in" data-aos-delay="200">
            <h3>Coming Soon: Payroll & HRMS</h3>
            <p>Manage your team with the same ease as your clients.</p>
          </div>
          <div className="feature-card" data-aos="zoom-in" data-aos-delay="300">
            <h3>Save Time</h3>
            <p>
              Spend less time on billing and more time building your business.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="about-cta" data-aos="fade-up">
        <a href="#start" className="cta-button">
          Get Started Today
        </a>
      </div>
    </section>
  );
}
