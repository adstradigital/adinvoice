"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RootLayout({ children }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Handle session expiry event
    const handleSessionExpired = () => {
      // Clear tokens and tenant info
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("tenant_id");

      // Show the modal
      setShowModal(true);
    };

    // Listen for custom "sessionExpired" event
    window.addEventListener("sessionExpired", handleSessionExpired);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, []); // run once on mount

  // Redirect to login page
  const redirectToLogin = () => {
    setShowModal(false);
    router.push("/signin");
  };

  return (
    <html lang="en">
      <body className="bg-light">
        <main>{children}</main>

        {/* Session Expired Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
            <div className="bg-white p-4 rounded shadow text-center" style={{ maxWidth: "400px", width: "90%", position: "absolute", zIndex: "10000"}}>
              <h2 className="mb-3">Session Expired</h2>
              <p className="mb-4">Your session has expired. Please login again.</p>
              <button className="btn btn-primary" onClick={redirectToLogin}>
                Login
              </button>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
