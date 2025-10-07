"use client";
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Form, Modal } from "react-bootstrap";
import { FileText, Mail, Phone, MapPin } from "lucide-react";
import {
  getOwnCompanyDetails,
  updateCompanyDetails,
  uploadDocument,
  deleteDocument,
} from "../../../../Api/index";

// Chart imports
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

const BASE_URL = "http://localhost:8000";

export default function CompanyDetailPage() {
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({});

  // Document states
  const [docType, setDocType] = useState("pan");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState("");

  const profileFields = [
    "company_name",
    "phone",
    "alternate_phone",
    "date_of_birth",
    "designation",
    "industry",
    "experience_years",
    "website",
    "linkedin_profile",
    "twitter_profile",
    "address.line1",
    "address.line2",
    "address.city",
    "address.state",
    "address.country",
    "address.pincode",
  ];

  const calculateProfileCompletion = (data) => {
    const filledCount = profileFields.filter((field) => {
      const keys = field.split(".");
      let value = data;
      for (let key of keys) {
        value = value?.[key];
        if (value === undefined || value === null) break;
      }
      return value !== undefined && value !== null && value.toString().trim() !== "";
    }).length;

    return Math.round((filledCount / profileFields.length) * 100);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getOwnCompanyDetails();
      setCompany(data);
      setFormData(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch company details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [key]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async () => {
    try {
      await updateCompanyDetails(formData);
      setCompany({ ...company, ...formData });
      setShowEdit(false);
      alert("Company details updated successfully!");
    } catch (err) {
      console.error("Error updating company details:", err.response?.data || err.message);
      alert("Failed to update company details.");
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");
    if (!docType) return alert("Please select document type.");
    try {
      setUploading(true);
      await uploadDocument(file, docType);
      setFile(null);
      await fetchData();
      alert("Document uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument(docId);
      await fetchData();
      alert("Document deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete document.");
    }
  };

  const handleViewDoc = (url) => {
    if (!url) return alert("Document URL not found.");
    setSelectedDocUrl(url);
    setShowDoc(true);
  };

  if (loading) return <p>Loading...</p>;

  const profileCompleted = calculateProfileCompletion(company);

  const pieData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [profileCompleted, 100 - profileCompleted],
        backgroundColor: ["#36A2EB", "#E5E5E5"],
        hoverBackgroundColor: ["#36A2EB", "#E5E5E5"],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-4">Company Profile</h2>
      <Row className="g-4">
        <Col md={8}>
          {/* General Info */}
          <Card className="shadow-sm p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">General Information</h5>
              <Button variant="outline-primary" size="sm" onClick={() => setShowEdit(true)}>
                Edit
              </Button>
            </div>
            <Row>
              <Col md={6} className="mb-3">
                <FileText className="me-2 text-primary" />
                <strong>Company Name:</strong>{" "}
                <span className="text-muted">{company.company_name || "—"}</span>
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
                <Phone className="me-2 text-info" />
                <strong>Alternate Phone:</strong>{" "}
                <span className="text-muted">{company.alternate_phone || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <strong>Date of Birth:</strong>{" "}
                <span className="text-muted">{company.date_of_birth || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <strong>Designation:</strong>{" "}
                <span className="text-muted">{company.designation || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <strong>Industry:</strong>{" "}
                <span className="text-muted">{company.industry || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <strong>Experience (Years):</strong>{" "}
                <span className="text-muted">{company.experience_years || "—"}</span>
              </Col>
              <Col md={12} className="mb-3">
                <MapPin className="me-2 text-danger" />
                <strong>Address:</strong>{" "}
                <span className="text-muted">
                  {company.address?.line1 || "—"}, {company.address?.line2 || ""},{" "}
                  {company.address?.city || ""}, {company.address?.state || ""},{" "}
                  {company.address?.country || ""}, {company.address?.pincode || ""}
                </span>
              </Col>
              <Col md={6} className="mb-3">
                <strong>Website:</strong> <span className="text-muted">{company.website || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <strong>LinkedIn:</strong>{" "}
                <span className="text-muted">{company.linkedin_profile || "—"}</span>
              </Col>
              <Col md={6} className="mb-3">
                <strong>Twitter:</strong>{" "}
                <span className="text-muted">{company.twitter_profile || "—"}</span>
              </Col>
            </Row>
          </Card>

          {/* Documents */}
          <Card className="shadow-sm p-4 mb-4">
            <h5 className="mb-3">Documents</h5>
            <ul className="list-group mb-3">
              {company.documents?.length > 0 ? (
                company.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>
                      {doc.doc_type}{" "}
                      {doc.is_verified ? (
                        <span className="text-success">(Verified)</span>
                      ) : (
                        <span className="text-warning">(Pending)</span>
                      )}
                    </span>
                    <span>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => handleViewDoc(doc.file_url)}
                      >
                        View
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(doc.id)}>
                        Delete
                      </Button>
                    </span>
                  </li>
                ))
              ) : (
                <li className="list-group-item text-muted">No documents uploaded.</li>
              )}
            </ul>

            <Form className="d-flex gap-2 align-items-center">
              <Form.Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="pan">PAN Card</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="gst">GST Certificate</option>
                <option value="company_reg">Company Registration</option>
                <option value="other">Other</option>
              </Form.Select>
              <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Right Column */}
        <Col md={4}>
          <Card className="shadow-sm p-4 h-100">
            <h5 className="mb-3">Verification & Profile</h5>
            <ul className="list-group list-group-flush mb-3">
              <li className="list-group-item">
                Email Verified: <strong>{company.email_verified ? "Yes" : "No"}</strong>
              </li>
              <li className="list-group-item">
                SMS Verified: <strong>{company.sms_verified ? "Yes" : "No"}</strong>
              </li>
              <li className="list-group-item">
                Profile Completed: <strong>{profileCompleted}%</strong>
              </li>
              <li className="list-group-item">
                Documents Uploaded: <strong>{company.documents?.length || 0}</strong>
              </li>
            </ul>

            <div className="text-center mt-3">
              <h6>Profile Completion</h6>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Company Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control name="company_name" value={formData.company_name || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" value={formData.email || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control name="phone" value={formData.phone || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Alternate Phone</Form.Label>
              <Form.Control name="alternate_phone" value={formData.alternate_phone || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control name="date_of_birth" value={formData.date_of_birth || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Control name="designation" value={formData.designation || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Industry</Form.Label>
              <Form.Control name="industry" value={formData.industry || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Experience (Years)</Form.Label>
              <Form.Control name="experience_years" value={formData.experience_years || ""} onChange={handleChange} />
            </Form.Group>

            {/* Address Fields */}
            <Form.Group className="mb-3">
              <Form.Label>Address Line 1</Form.Label>
              <Form.Control name="address.line1" value={formData.address?.line1 || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address Line 2</Form.Label>
              <Form.Control name="address.line2" value={formData.address?.line2 || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control name="address.city" value={formData.address?.city || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control name="address.state" value={formData.address?.state || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control name="address.country" value={formData.address?.country || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pincode</Form.Label>
              <Form.Control name="address.pincode" value={formData.address?.pincode || ""} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Website</Form.Label>
              <Form.Control name="website" value={formData.website || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>LinkedIn Profile</Form.Label>
              <Form.Control name="linkedin_profile" value={formData.linkedin_profile || ""} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Twitter Profile</Form.Label>
              <Form.Control name="twitter_profile" value={formData.twitter_profile || ""} onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Document Modal */}
      <Modal show={showDoc} onHide={() => setShowDoc(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedDocUrl.endsWith(".pdf") ? (
            <iframe src={BASE_URL + selectedDocUrl} style={{ width: "100%", height: "500px" }} title="PDF Document" />
          ) : (
            <img src={BASE_URL + selectedDocUrl} alt="Document" style={{ maxWidth: "100%", maxHeight: "500px" }} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
