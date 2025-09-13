"use client";
import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
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

export default function CompanyDetailPage() {
  return (
    <div className="container py-4">
      <h2 className="text-primary mb-4">Company Profile</h2>

      <Row className="g-4">
        {/* Main Details */}
        <Col md={8}>
          <Card className="shadow-sm p-4">
            <h5 className="mb-3">General Information</h5>
            <Row>
              <Col md={6} className="mb-3">
                <FileText className="me-2 text-primary" />
                <strong>Name:</strong> <span className="text-muted">—</span>
              </Col>
              <Col md={6} className="mb-3">
                <Mail className="me-2 text-secondary" />
                <strong>Email:</strong> <span className="text-muted">—</span>
              </Col>
              <Col md={6} className="mb-3">
                <Phone className="me-2 text-success" />
                <strong>Phone:</strong> <span className="text-muted">—</span>
              </Col>
              <Col md={6} className="mb-3">
                <MapPin className="me-2 text-danger" />
                <strong>Location:</strong> <span className="text-muted">—</span>
              </Col>
              <Col md={6} className="mb-3">
                <Calendar className="me-2 text-warning" />
                <strong>Founded:</strong> <span className="text-muted">—</span>
              </Col>
              <Col md={6} className="mb-3">
                <FileCheck className="me-2 text-info" />
                <strong>Tax ID:</strong> <span className="text-muted">—</span>
              </Col>
              <Col md={6} className="mb-3">
                <Briefcase className="me-2 text-dark" />
                <strong>Registration:</strong>{" "}
                <span className="text-muted">—</span>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col md={4}>
          <Card className="shadow-sm p-4 h-100">
            <h5 className="mb-3">Quick Stats</h5>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <Users className="me-2 text-primary" /> Employees:{" "}
                <strong className="text-muted">—</strong>
              </li>
              <li className="list-group-item">
                <DollarSign className="me-2 text-success" /> Revenue:{" "}
                <strong className="text-muted">—</strong>
              </li>
              <li className="list-group-item">
                <Users className="me-2 text-info" /> Clients:{" "}
                <strong className="text-muted">—</strong>
              </li>
              <li className="list-group-item">
                <FileText className="me-2 text-warning" /> Invoices:{" "}
                <strong className="text-muted">—</strong>
              </li>
            </ul>
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <div className="mt-4 d-flex gap-2">
        <Button variant="primary">Edit Company</Button>
        <Button variant="secondary">View Invoices</Button>
        <Button variant="success">Add Client</Button>
      </div>
    </div>
  );
}
