"use client"; // required for client-side hooks

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS

export default function RootLayout({ children }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpired = () => {
      // Clear all tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("tenant_id");

      setShowModal(true);
    };

    // Listen for the sessionExpired event from api.js
    window.addEventListener("sessionExpired", handleSessionExpired);

    return () => {
      window.removeEventListener("sessionExpired", handleSessionExpired);
    };
  }, []);

  const redirectToLogin = () => {
    setShowModal(false);
    router.push("/signin"); // redirect to signin page
  };

  return (
    <html lang="en">
      <body className="bg-light">
        <main>{children}</main>

        {/* Session Expired Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
            <div className="bg-white p-4 rounded shadow text-center">
              <h2 className="mb-3">Session Expired</h2>
              <p className="mb-4">Your session has expired. Please login again.</p>
              <button
                className="btn btn-primary"
                onClick={redirectToLogin}
              >
                Login
              </button>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
