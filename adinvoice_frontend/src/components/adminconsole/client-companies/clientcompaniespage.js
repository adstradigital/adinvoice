"use client";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ClientCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCompany, setNewCompany] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  // ✅ Use dummy data instead of Axios
  useEffect(() => {
    setTimeout(() => {
      setCompanies([
        { id: 1, name: "ABC Corp", contact: "John Doe", email: "abc@example.com", phone: "9876543210" },
        { id: 2, name: "XYZ Ltd", contact: "Jane Smith", email: "xyz@example.com", phone: "9123456780" },
      ]);
      setLoading(false);
    }, 500); // simulate API delay
  }, []);

  // ✅ Validate fields
  const validate = () => {
    let tempErrors = {};
    if (!newCompany.name.trim()) tempErrors.name = "Company name is required";
    if (!newCompany.contact.trim()) tempErrors.contact = "Contact person is required";

    if (newCompany.email && !/\S+@\S+\.\S+/.test(newCompany.email)) {
      tempErrors.email = "Enter a valid email address";
    }

    if (newCompany.phone && !/^\d{10}$/.test(newCompany.phone)) {
      tempErrors.phone = "Phone must be 10 digits";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // ✅ Handle form changes
  const handleChange = (e) => {
    setNewCompany({ ...newCompany, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // live validation
  };

  // ✅ Add new company locally
  const handleAddCompany = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const newEntry = { ...newCompany, id: companies.length + 1 };
    setCompanies([...companies, newEntry]);
    setNewCompany({ name: "", contact: "", email: "", phone: "" });
    setErrors({});
    setShowModal(false);
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
                      <button className="btn btn-sm btn-outline-primary">Edit</button>
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
          <div className="card shadow" style={{ width: "400px" }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Add New Company</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleAddCompany} noValidate>
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
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
