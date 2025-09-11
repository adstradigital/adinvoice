import "./Pricing.css";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Pricing() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <section id="pricing" className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-grid">
          {/* Left Panel */}
          <div className="pricing-card main-card" data-aos="fade-right">
            <h2 className="pricing-title">Pricing That Respects You</h2>
            <p className="pricing-subtext">
              One flat price. No hidden fees. Full respect for your time.
            </p>
            <div className="spacing-small"></div>
            <div className="pricing-amount" data-aos="zoom-in" data-aos-delay="200">
              <span>₹4,500</span>
              <h4>/year</h4>
            </div>
            <div className="spacing-medium"></div>
            <div className="pricing-buttons" data-aos="fade-up" data-aos-delay="300">
              <a href="#get-started" className="pricing-cta">
                <span>Start Billing Smarter</span>
                <span className="cta-price">
                  ₹500
                  <span className="cta-small">/month</span>
                </span>
              </a>
            </div>
            <div className="spacing-small"></div>
            <p className="pricing-note" data-aos="fade-up" data-aos-delay="400">
              Flat Price: ₹4,500/year. No hidden fees. No distractions. Just clean, confident billing.
            </p>
              <a href="#faq" className="pricing-cta-outline">Questions? See FAQ</a>
          </div>

          {/* Right Panel */}
          <div className="pricing-card features-card" data-aos="fade-left">
            <h3 className="features-title">What you get</h3>
            <ul className="features-list">
              <li data-aos="fade-up" data-aos-delay="100"><span className="features-tick">✓</span> Unlimited proposals, invoices & receipts</li>
              <li data-aos="fade-up" data-aos-delay="200"><span className="features-tick">✓</span> Email & WhatsApp sending</li>
              <li data-aos="fade-up" data-aos-delay="300"><span className="features-tick">✓</span> Client & document history</li>
              <li data-aos="fade-up" data-aos-delay="400"><span className="features-tick">✓</span> Priority support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
