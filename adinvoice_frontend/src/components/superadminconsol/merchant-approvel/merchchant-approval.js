"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import {
  getPendingMerchants,
  updateMerchantStatus,
} from "../../../../Api/api_clientadmin";

export default function MerchantApproval() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch pending merchants
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

  // ✅ Approve or Reject Merchant
  const handleApproval = async (id, action) => {
    try {
      setLoading(true);

      await updateMerchantStatus(id, action); // "approve" or "reject"

      // ✅ Remove the updated merchant from UI immediately
      setMerchants((prev) => prev.filter((m) => m.id !== id));

      alert(`Merchant ${action === "approve" ? "approved" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error updating merchant status:", error);
      alert("Failed to update merchant status.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Status Badge UI
  const getStatusVariant = (status) => {
    if (status === "approved") return "success";
    if (status === "rejected") return "danger";
    return "warning"; // pending
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Merchant Approval</h2>

      {loading && <Spinner animation="border" className="mb-3" />}

      {/* ✅ Scrollable Table */}
      <div
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Merchant Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
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
                  <td>{merchant.company_name || "-"}</td>
                  <td>
                    <Badge bg={getStatusVariant(merchant.application_status)}>
                      {merchant.application_status}
                    </Badge>
                  </td>

                  {/* ✅ Approve / Reject Buttons */}
                  <td>
                    {merchant.application_status === "pending" ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleApproval(merchant.id, "approve")}
                          disabled={loading}
                        >
                          Approve
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleApproval(merchant.id, "reject")}
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
                <td colSpan="7" className="text-center">
                  {loading ? "Loading..." : "No pending merchants found."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
