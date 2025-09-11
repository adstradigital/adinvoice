"use client";

import HeroPage from "@/components/heropage/heropage";
import Navbar from "@/components/navbar/navbar";
import About from "@/components/about/about";
import Pricing from "@/components/pricing/pricing";
import TestimonialsPricing from "@/components/Testimonials/Testimonials";
import ContactPage from "@/components/contactpage/Contact";
import Footer from "@/components/footer/footer";
import Image from "next/image";



export default function Page() {
  return (
    <div>
      <Navbar />

      {/* Coming Soon Overlay */}
      <div
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
          background: "rgba(122, 164, 232, 0.9)",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <Image
          src="/assets/comingsoon.png"
          alt="Coming Soon"
          width={400}
          height={400}
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
      </div>

      {/* Other sections (hidden behind overlay until you remove it) */}
      <HeroPage />
      <About />
      <Pricing />
      <TestimonialsPricing />
      <ContactPage />
      <Footer />
    </div>
  );
}
