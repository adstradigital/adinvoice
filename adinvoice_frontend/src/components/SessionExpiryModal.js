// SessionExpiryModal.jsx
import React from "react";

export default function SessionExpiryModal({ open, onLogin }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h2 className="text-lg font-bold mb-4">Session Expired</h2>
        <p className="mb-4">Your session has expired. Please login again.</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
