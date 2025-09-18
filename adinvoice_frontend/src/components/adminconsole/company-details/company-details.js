"use client";
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Form, Modal } from "react-bootstrap";
import {
  FileText,
  Mail,
  Phone,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { getOwnCompanyDetails, updateOwnCompanyDetails } from "../../../../Api/index";

export default function CompanyDetailPage() {
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    async function fetchData() {
      const data = await getOwnCompanyDetails();
      if (data) {
        setCompany(data);
        setFormData(data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateOwnCompanyDetails(formData);
      setCompany(updated);
      setShowEdit(false);
      alert("Company details updated successfully!");
    } catch (err) {
      alert("Failed to update company details.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-4">Company Profile</h2>

      <Row className="g-4">
        <Col md={8}>
          <Card className="shadow-sm p-4">
            <h5 className="mb-3">General Information</h5>
            <Row>
              <Col md={6} className="mb-3">
                <FileText className="me-2 text-primary" />
                <strong>Name:</strong> <span className="text-muted">{company.name || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <Mail className="me-2 text-secondary" />
                <strong>Email:</strong> <span className="text-muted">{company.email || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <Phone className="me-2 text-success" />
                <strong>Phone:</strong> <span className="text-muted">{company.phone || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <MapPin className="me-2 text-danger" />
                <strong>Location:</strong> <span className="text-muted">{company.city || "—"}, {company.state || ""}</span>
              </Col>
              <Col md={6} className="mb-3">
                <Calendar className="me-2 text-warning" />
                <strong>Founded:</strong> <span className="text-muted">{company.founded || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <FileCheck className="me-2 text-info" />
                <strong>Tax ID:</strong> <span className="text-muted">{company.tax_id || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <Briefcase className="me-2 text-dark" />
                <strong>Registration:</strong> <span className="text-muted">{company.registration_number || "—"}</span>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm p-4 h-100">
            <h5 className="mb-3">Quick Stats</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <Users className="me-2 text-primary" /> Employees: <strong className="text-muted">{company.employees || "—"}</strong>
              </li>
              <li className="list-group-item">
                <DollarSign className="me-2 text-success" /> Revenue: <strong className="text-muted">{company.revenue || "—"}</strong>
              </li>
              <li className="list-group-item">
                <Users className="me-2 text-info" /> Clients: <strong className="text-muted">{company.clients || "—"}</strong>
              </li>
              <li className="list-group-item">
                <FileText className="me-2 text-warning" /> Invoices: <strong className="text-muted">{company.invoices || "—"}</strong>
              </li>
            </ul>
          </Card>
        </Col>
      </Row>

      <div className="mt-4 d-flex gap-2">
        <Button variant="primary" onClick={() => setShowEdit(true)}>Edit Company</Button>
      </div>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Company Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={formData.name || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control name="phone" value={formData.phone || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control name="city" value={formData.city || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control name="state" value={formData.state || ""} onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
