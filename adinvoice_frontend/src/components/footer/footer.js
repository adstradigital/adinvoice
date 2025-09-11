"use client";
import { useState } from "react";
import Link from "next/link";  // ✅ Import Link
import "./Footer.css";

export default function Footer() {
  const [year] = useState(new Date().getFullYear());

  return (
    <footer data-aos="fade-up">
      <div className="footer-container">
        {/* Brand / About */}
        <div className="footer-col" data-aos="fade-right" data-aos-delay="100">
          <h3 className="footer-logo">Adinvoice</h3>
          <p>Less time on billing. More time on business.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-col" data-aos="fade-up" data-aos-delay="200">
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/faq">FAQs</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-col" data-aos="fade-up" data-aos-delay="300">
          <h4>Resources</h4>
          <ul>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/guides">Guides</Link></li>
            <li><Link href="/support">Help Center</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div className="footer-col" data-aos="fade-left" data-aos-delay="400">
          <h4>Contact Us</h4>
          <p>
            Email: <a href="mailto:support@adinvoice.com">support@adinvoice.com</a>
          </p>
          <p>Phone: +91 98765 43210</p>
          <div className="footer-socials" data-aos="zoom-in" data-aos-delay="500">
            {/* External links can still use <a> */}
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-linkedin-in"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom" data-aos="fade-up" data-aos-delay="600">
        <p>
          © {year} <span>Adinvoice</span> • Built for modern businesses.  
          All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
