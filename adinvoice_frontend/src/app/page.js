"use client";

import Enquiry from "@/components/enquiry/page";
import GalleryPage from "@/components/gallery/page";
import HeroPage from "@/components/heropage/heropage";
import Navbar from "@/components/navbar/navbar";

export default function page() {

  return (
    <div>
      <HeroPage />
      <Navbar />
      <Enquiry />
      <GalleryPage />
    </div>
  );
}
