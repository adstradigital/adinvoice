"use client";
import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/merchants/"; // replace with your endpoint

export default function MerchantApproval() {
  const [merchants, setMerchants] = useState([]);

  // 📌 Fetch merchants on mount
  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      // const response = await axios.get(API_URL);
      setMerchants(response.data); // expects an array of merchants
    } catch (error) {
      console.error("Error fetching merchants:", error);
    }
  };

  // Approve or Reject merchant
  const handleApproval = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}${id}/`, { status: newStatus });
      setMerchants((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
    } catch (error) {
      console.error(`Error updating merchant ${id}:`, error);
      alert("Failed to update merchant status.");
    }
  };

  const getStatusVariant = (status) => {
    if (status === "Approved") return "success";
    if (status === "Rejected") return "danger";
    return "warning";
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Merchant Approval</h2>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Merchant Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((merchant, index) => (
            <tr key={merchant.id}>
              <td>{index + 1}</td>
              <td>{merchant.name}</td>
              <td>{merchant.email}</td>
              <td>
                <Badge bg={getStatusVariant(merchant.status)}>
                  {merchant.status}
                </Badge>
              </td>
              <td>
                {merchant.status === "Pending" ? (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleApproval(merchant.id, "Approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleApproval(merchant.id, "Rejected")}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  <span className="text-muted">No Action</span>
                )}
              </td>
            </tr>
          ))}
          {merchants.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                No merchants found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
