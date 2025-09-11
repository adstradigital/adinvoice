"use client";

import { useEffect, useRef } from "react";
import "./Testimonials.css";

export default function Testimonials() {

  return (
    <section className="testimonials animate-on-scroll">
      <div className="container">
        <h2 className="section-title animate-on-scroll">What Our Users Say</h2>

        <div className="grid">
          <div className="testimonial animate-on-scroll">
            <p className="quote">
              “This platform feels like it was designed by someone who actually
              understands small businesses. It’s not just software, it’s
              support.”
            </p>
            <span className="author">— Freelancer, Kochi</span>
          </div>

          <div className="testimonial animate-on-scroll">
            <p className="quote">
              “I send invoices with confidence now. Clients respond faster.
              Payments come quicker. It’s changed the game.”
            </p>
            <span className="author">— Agency Owner, Bengaluru</span>
          </div>
        </div>
      </div>
    </section>
  );
}
