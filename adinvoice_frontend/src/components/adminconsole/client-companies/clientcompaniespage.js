"use client";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getClientsCompanies, addClientCompany, updateClientCompany } from "../../../../Api/index"; // ✅ Make sure to export these in api.js

export default function ClientCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCompany, setNewCompany] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    industry: "",
    website: "",
    registration_number: "",
    tax_id: "",
    address_line1: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    support_email: "",
    account_manager: null,
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch client companies from API
  const fetchCompanies = async () => {
    try {
      const data = await getClientsCompanies();
      setCompanies(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch client companies", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ✅ Validate form fields
  const validate = () => {
    let tempErrors = {};
    if (!newCompany.name.trim()) tempErrors.name = "Company name is required";
    if (!newCompany.contact?.trim()) tempErrors.contact = "Contact person is required";

    if (newCompany.email && !/\S+@\S+\.\S+/.test(newCompany.email)) {
      tempErrors.email = "Enter a valid email address";
    }

    if (newCompany.phone && !/^\d{10,15}$/.test(newCompany.phone)) {
      tempErrors.phone = "Phone must be 10-15 digits";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // ✅ Handle input changes
  const handleChange = (e) => {
    setNewCompany({ ...newCompany, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ✅ Add or update company
  const handleAddOrUpdateCompany = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingId) {
        // Update existing company
        await updateClientCompany(editingId, newCompany);
        setCompanies((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...newCompany } : c))
        );
      } else {
        // Add new company
        const savedCompany = await addClientCompany(newCompany);
        setCompanies([...companies, savedCompany]);
      }

      setNewCompany({
        name: "",
        contact: "",
        email: "",
        phone: "",
        industry: "",
        website: "",
        registration_number: "",
        tax_id: "",
        address_line1: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        support_email: "",
        account_manager: null,
        notes: "",
      });
      setErrors({});
      setShowModal(false);
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save company", err);
    }
  };

  // ✅ Edit company
  const handleEdit = (company) => {
    setNewCompany({ ...company });
    setEditingId(company.id);
    setShowModal(true);
  };

  return (
    <div className="container-fluid">
      <div className="card shadow-sm border-0 p-4 my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>🏢 Client Companies</h4>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Company
          </button>
        </div>
        <p className="text-muted">
          Manage your client companies below. Click "Add Company" to create a new entry.
        </p>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    Loading companies...
                  </td>
                </tr>
              ) : companies.length > 0 ? (
                companies.map((c, index) => (
                  <tr key={c.id || index}>
                    <td>{c.id || index + 1}</td>
                    <td>{c.name}</td>
                    <td>{c.contact}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(c)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No client companies found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="card shadow" style={{ width: "500px" }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{editingId ? "Edit Company" : "Add New Company"}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleAddOrUpdateCompany} noValidate>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    name="name"
                    value={newCompany.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className={`form-control ${errors.contact ? "is-invalid" : ""}`}
                    name="contact"
                    value={newCompany.contact}
                    onChange={handleChange}
                  />
                  {errors.contact && <div className="invalid-feedback">{errors.contact}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    name="email"
                    value={newCompany.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                    name="phone"
                    value={newCompany.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update Company" : "Add Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
