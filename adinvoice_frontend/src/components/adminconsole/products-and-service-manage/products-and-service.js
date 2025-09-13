"use client";
import React from "react";

export default function ProductsServices() {
  const handleDelete = (id) => {
    // Placeholder for delete functionality
    console.log("Delete item:", id);
  };

  return (
    <div className="card shadow border-0 p-4 my-3">
      <h4>📦 Products & Services</h4>
      <p>Manage products and services offered.</p>

      <div className="table-responsive">
        <table className="table table-bordered mt-3">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Unit Price</th>
              <th>Tax</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No products/services found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
