"use client";
import React, { useState } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

export default function MerchantApproval() {
  const [merchants, setMerchants] = useState([
    { id: "1", name: "ABC Traders", email: "abc@traders.com", status: "Pending" },
    { id: "2", name: "XYZ Store", email: "xyz@store.com", status: "Approved" },
    { id: "3", name: "QuickMart", email: "quick@mart.com", status: "Rejected" },
  ]);

  const handleApproval = (id, newStatus) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
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
        </tbody>
      </Table>
    </div>
  );
}
