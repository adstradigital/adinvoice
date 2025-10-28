"use client";

import { useEffect } from "react";
import HeroPage from "@/components/heropage/heropage";
import Navbar from "@/components/navbar/navbar";
import About from "@/components/about/about";
import Pricing from "@/components/pricing/pricing";
import TestimonialsPricing from "@/components/Testimonials/Testimonials";
import ContactPage from "@/components/contactpage/Contact";
import Footer from "@/components/footer/footer";
import Image from "next/image";

export default function Page() {
  useEffect(() => {
    // ✅ On refresh, remove any hash (#section) and scroll to top
    if (typeof window !== "undefined") {
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div>
      <Navbar />

      {/* Coming Soon Overlay (Optional) */}
      {/* <div
        style={{
          zIndex: 9999,
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(34, 41, 52, 0.9)",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <Image
          src="/assets/comingsoon5.png"
          alt="Coming Soon"
          width={200}
          height={200}
          style={{
            width: "80%",
            height: "auto",
            objectFit: "contain",
            marginBottom: "20px",
          }}
        />
        <h1
          style={{
            fontSize: "20px",
            fontWeight: "500",
            letterSpacing: "1px",
          }}
        >
          Powered by <span style={{ fontWeight: "700" }}>ADSTRA DIGITAL</span>
        </h1>
      </div> */}

      {/* ✅ Main Sections */}
      <HeroPage />
      <About />
      <Pricing />
      <TestimonialsPricing />
      <ContactPage />
      <Footer />
    </div>
  );
}
