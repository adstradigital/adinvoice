"use client";
import { useEffect, useState } from "react";

const TrashBin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://127.0.0.1:8000/api/trashbin";

  const fetchTrashItems = async () => {
    setLoading(true);
    try {
      const tenantId = localStorage.getItem("tenant_id");
      if (!tenantId) {
        console.error("❌ No tenant ID found in localStorage!");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/all/?tenant_id=${tenantId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      const normalized = data.map((item) => ({
        ...item,
        name:
          item.title ||
          item.invoice_number ||
          item.receipt_number ||
          "Unnamed Item",
        deletedAt: item.deleted_at
          ? new Date(item.deleted_at).toLocaleString()
          : "No timestamp",
      }));

      setItems(normalized);
    } catch (error) {
      console.error("🚨 Error fetching trash items:", error);
      setItems([]);
    }
    setLoading(false);
  };

  const comingSoonAlert = () => {
    alert("🚧 This feature is under construction. Coming Soon!");
  };

  useEffect(() => {
    fetchTrashItems();
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-primary">🗑️ Trash Bin</h1>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="alert alert-info">No deleted items found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Type</th>
                <th>ID</th>
                <th>Name</th>
                <th>Deleted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td>{item.type}</td>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.deletedAt}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={comingSoonAlert}
                      >
                        Restore
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={comingSoonAlert}
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrashBin;
