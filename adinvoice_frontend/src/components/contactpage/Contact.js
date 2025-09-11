import { useEffect } from "react";
import "./contact.css";

export default function ContactPage() {
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
    <section className="contact-section">
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
            <p>Location: Kozhikode, kerala, India</p>
          </div>

          {/* Contact Form */}
          <form className="contact-form reveal">
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea placeholder="Write your message..." rows={5} required></textarea>
            </div>
            <button type="submit" className="contact-btn">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}
