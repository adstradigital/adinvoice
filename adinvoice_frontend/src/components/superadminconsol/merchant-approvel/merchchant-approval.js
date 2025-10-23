"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import { getPendingMerchants, updateMerchantStatus } from "../../../../Api/api_clientadmin";

export default function MerchantApproval() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch pending merchants on component mount
  useEffect(() => {
    const loadMerchants = async () => {
      try {
        setLoading(true);
        const data = await getPendingMerchants();
        setMerchants(data);
      } catch (error) {
        console.error("Error fetching merchants:", error);
        alert("Failed to fetch merchants.");
      } finally {
        setLoading(false);
      }
    };
    loadMerchants();
  }, []);

  // ✅ Approve or Reject merchant
  const handleApproval = async (id, action) => {
    try {
      setLoading(true);
      await updateMerchantStatus(id, action); // "enable" or "disable"

      // Update UI after response
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, application_status: action === "enable" ? "approved" : "rejected" }
            : m
        )
      );

      alert(`Merchant ${action === "enable" ? "approved" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error updating merchant status:", error);
      alert("Failed to update merchant status.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Map status to badge color
  const getStatusVariant = (status) => {
    if (status === "approved") return "success";
    if (status === "rejected") return "danger";
    return "warning"; // pending
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Merchant Approval</h2>

      {loading && <Spinner animation="border" className="mb-3" />}

      {/* Scrollable table container */}
      <div
        style={{
          maxHeight: "500px",  // vertical scroll
          overflowY: "auto",
          overflowX: "auto",  // horizontal scroll
        }}
      >
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Merchant Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Alternate Phone</th>
              <th>Company Name</th>
              <th>Role</th>
              <th>Date Joined</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {merchants.length > 0 ? (
              merchants.map((merchant, index) => (
                <tr key={merchant.id}>
                  <td>{index + 1}</td>
                  <td>{merchant.full_name || merchant.username}</td>
                  <td>{merchant.email}</td>
                  <td>{merchant.phone || "-"}</td>
                  <td>{merchant.alternate_phone || "-"}</td>
                  <td>{merchant.company_name || "-"}</td>
                  <td>{merchant.role || "-"}</td>
                  <td>{new Date(merchant.date_joined).toLocaleDateString()}</td>
                  <td>
                    <Badge bg={getStatusVariant(merchant.application_status)}>
                      {merchant.application_status}
                    </Badge>
                  </td>
                  <td>
                    {merchant.application_status === "pending" ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleApproval(merchant.id, "enable")}
                          disabled={loading}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleApproval(merchant.id, "disable")}
                          disabled={loading}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted">No Action</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  {loading ? "Loading..." : "No merchants found."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
