"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./contact.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "", // ✅ added mobile
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/enquiries/create/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(API_URL, formData);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        mobile: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      alert("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    reveals.forEach((el) => observer.observe(el));
  }, []);

  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 className="contact-title reveal">Get in Touch</h2>
        <p className="contact-subtitle reveal">
          Have questions, feedback, or need support? We’d love to hear from you.
        </p>

        <div className="contact-grid reveal">
          {/* Contact Info */}
          <div className="contact-info">
            <h3>Contact Information</h3>
            <p>Email: <a href="mailto:support@adstra.digital">support@adstra.digital</a></p>
            <p>Phone: +91 9744779574</p>
            <p>Location: Kozhikode, Kerala, India</p>
          </div>

          {/* Contact Form */}
          <form className="contact-form reveal" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* ✅ New Mobile Field */}
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                placeholder="Your Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                placeholder="Write your message..."
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="contact-btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>

            {success && <p className="success-msg">✅ Message sent successfully!</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
