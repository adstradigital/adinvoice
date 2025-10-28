"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

const API_URL = "http://127.0.0.1:8000/api/enquiries/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("User not authenticated");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export default function CommonEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnquiries(response.data);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    }
  };

  const handleReply = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setReply("");
    setShowModal(true);
  };

  const handleSendReply = async () => {
    if (!selectedEnquiry) return;
    try {
      await axios.post(`${API_URL}${selectedEnquiry.id}/reply/`, { message: reply });
      alert(`Reply sent to ${selectedEnquiry.email}`);
      setShowModal(false);
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply.");
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.patch(
        `${API_URL}${id}/`,
        { status: "resolved" },
        { headers: getAuthHeaders() }
      );
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "resolved" } : e))
      );
    } catch (err) {
      console.error("Error updating enquiry status:", err.response?.data || err.message);
    }
  };

  const getStatusVariant = (status) => (status === "resolved" ? "success" : "danger");

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📬 Common Enquiries</h2>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No enquiries found
                </td>
              </tr>
            ) : (
              enquiries.map((enquiry, index) => (
                <tr key={enquiry.id}>
                  <td>{index + 1}</td>
                  <td>{enquiry.name}</td>
                  <td>{enquiry.email}</td>
                  <td>{enquiry.mobile || "—"}</td>
                  <td>{enquiry.subject}</td>
                  <td>{enquiry.message}</td>
                  <td>
                    <Badge bg={getStatusVariant(enquiry.status)}>
                      {enquiry.status || "pending"}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleReply(enquiry)}
                    >
                      Reply
                    </Button>
                    {enquiry.status !== "resolved" && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleResolve(enquiry.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to {selectedEnquiry?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reply Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSendReply}>
            Send Reply
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
