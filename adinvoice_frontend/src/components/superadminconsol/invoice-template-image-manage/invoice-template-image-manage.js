"use client";
import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import axios from "axios";

export default function InvoiceTemplateImageManage() {
  const [templates, setTemplates] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log(templates)

  const BACKEND_URL = "http://127.0.0.1:8000/api/template-management";

  // Fetch templates from backend
  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/templates/`); // trailing slash!
      setTemplates(res.data);
    } catch (err) {
      console.error("Error fetching templates:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Upload template
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/templates/create/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setFile(null);
      fetchTemplates(); // Refresh list
    } catch (err) {
      console.error("Error uploading template:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/templates/${id}/delete/`);
      fetchTemplates(); // Refresh list
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🧾 Invoice Template Management</h2>

      {/* Upload Section */}
      <Form onSubmit={handleUpload} className="mb-4">
        <Form.Group className="mb-2">
          <Form.Label>Template Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter template title"
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Upload File</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Template"}
        </Button>
      </Form>

      {/* Templates Gallery */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {templates.map((t) => (
          <Col key={t.id}>
            <Card className="shadow-sm">
              <Card.Img
                variant="top"
                src={`http://127.0.0.1:8000/uploads/${t.file}`} // full media URL
                alt={t.title}
              />
              <Card.Body>
                <Card.Title>{t.title}</Card.Title>
                <div className="d-flex justify-content-between">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete
                  </Button>
                  <a
                    href={`http://127.0.0.1:8000${t.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    View
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
