"use client";
import React, { useState } from "react";

export default function TrashBin() {
  const [trash, setTrash] = useState([
    { id: 1, type: "Invoice", name: "INV-1012", deletedAt: "2025-09-01" },
    { id: 2, type: "Proposal", name: "Website Redesign", deletedAt: "2025-09-05" },
  ]);

  const handleRestore = (id) => {
    setTrash((prev) => prev.filter((t) => t.id !== id));
    alert(`✅ Item ID ${id} restored successfully!`);
  };

  const handleDeletePermanent = (id) => {
    if (window.confirm("Are you sure you want to delete permanently?")) {
      setTrash((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="card shadow border-0 p-4 my-3">
      <h4>🗑️ Trash Bin</h4>
      <p>Manage your deleted items here.</p>

      <div className="table-responsive">
        <table className="table table-bordered mt-3">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Deleted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trash.length > 0 ? (
              trash.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.type}</td>
                  <td>{item.name}</td>
                  <td>{item.deletedAt}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-success me-2"
                      onClick={() => handleRestore(item.id)}
                    >
                      Restore
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeletePermanent(item.id)}
                    >
                      Delete Permanently
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No items in Trash
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
