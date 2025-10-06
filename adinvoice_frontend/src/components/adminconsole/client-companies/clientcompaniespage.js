"use client";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getClientsCompanies,
  addClientCompany,
  updateClientCompany,
  toggleClientStatus,
} from "../../../../Api/index";

export default function ClientCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
    notes: "",
    logo: null,
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch companies
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await getClientsCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to fetch client companies", err);
      alert("Failed to fetch client companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Validate form
  const validate = () => {
    const tempErrors = {};
    if (!(newCompany.name || "").trim())
      tempErrors.name = "Company name is required";
    if (!(newCompany.contact || "").trim())
      tempErrors.contact = "Contact person is required";
    if (newCompany.email && !/\S+@\S+\.\S+/.test(newCompany.email))
      tempErrors.email = "Enter a valid email address";
    if (newCompany.phone && !/^\d{10}$/.test(newCompany.phone))
      tempErrors.phone = "Phone must be 10 digits";
    if (newCompany.website && !/^https?:\/\/.+\..+/.test(newCompany.website))
      tempErrors.website = "Enter a valid URL (or leave empty)";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setNewCompany((prev) => ({
      ...prev,
      [name]: name === "logo" ? files[0] || null : value,
    }));

    // Live validation
    let error = "";
    if (name === "name" && !value.trim()) error = "Company name is required";
    if (name === "contact" && !value.trim())
      error = "Contact person is required";
    if (name === "email" && value && !/\S+@\S+\.\S+/.test(value))
      error = "Enter a valid email address";
    if (name === "phone" && value && !/^\d{10}$/.test(value))
      error = "Phone must be 10 digits";
    if (name === "website" && value && !/^https?:\/\/.+\..+/.test(value))
      error = "Enter a valid URL (or leave empty)";

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Add or Update Company
  const handleAddOrUpdateCompany = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tenantId = localStorage.getItem("tenant_id");
    if (!tenantId) return alert("Tenant ID not found. Please login again.");

    const formData = new FormData();
    Object.entries(newCompany).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value);
    });
    formData.append("tenant", tenantId);

    try {
      if (editingId) {
        await updateClientCompany(editingId, formData);
      } else {
        await addClientCompany(formData);
      }
      await fetchCompanies();
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.detail || "Failed to save company.");
    }
  };

  // Edit company
  const handleEdit = (company) => {
    setNewCompany({
      ...company,
      logo: null, // Logo will be uploaded only if user selects a new file
    });
    setEditingId(company.id);
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
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
      notes: "",
      logo: null,
    });
    setErrors({});
    setEditingId(null);
    setShowModal(false);
  };

 const handleToggleStatus = async (company) => {
  const tenantId = localStorage.getItem("tenant_id");
  if (!tenantId) return alert("Tenant ID not found. Please login again.");

  try {
    const res = await toggleClientStatus(company.id, tenantId);

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === company.id ? { ...c, is_active: res.status } : c
      )
    );

    alert(res.success); // "Client company activated/deactivated"
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.error || "Failed to toggle client status");
  }
};

  // Filter companies
  const filteredCompanies = companies.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name?.toLowerCase() || "").includes(term) ||
      (c.contact?.toLowerCase() || "").includes(term) ||
      (c.email?.toLowerCase() || "").includes(term)
    );
  });

  return (
    <div className="container-fluid">
      <div className="card shadow-sm border-0 p-4 my-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>🏢 Client Companies</h4>
          <div className="d-flex">
            <input
              type="text"
              className="form-control me-2 rounded-pill border-primary"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: "250px" }}
            />
            <button
              className="btn btn-primary ms-2"
              onClick={() => setShowModal(true)}
            >
              + Add Company
            </button>
          </div>
        </div>
        <p className="text-muted">Manage your client companies below.</p>

        <div className="table-responsive" style={{ overflowX: "auto" }}>
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Logo</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Industry</th>
                <th>Website</th>
                <th>Reg. No</th>
                <th>Tax ID</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Country</th>
                <th>Postal Code</th>
                <th>Support Email</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="19" className="text-center text-muted">
                    Loading...
                  </td>
                </tr>
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((c, index) => (
                  <tr key={c.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      {c.logo ? (
                        <img
                          src={`http://127.0.0.1:8000${c.logo}`}
                          alt="logo"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "contain",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{c.name}</td>
                    <td>{c.contact}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>{c.industry}</td>
                    <td>{c.website}</td>
                    <td>{c.registration_number}</td>
                    <td>{c.tax_id}</td>
                    <td>{c.address_line1}</td>
                    <td>{c.city}</td>
                    <td>{c.state}</td>
                    <td>{c.country}</td>
                    <td>{c.postal_code}</td>
                    <td>{c.support_email}</td>
                    <td>{c.notes}</td>
                    <td>
                   <button
                    className={`btn btn-sm ${c.is_active ? "btn-success" : "btn-danger"}`}
                    onClick={() => handleToggleStatus(c)}
                         >
                     {c.is_active ? "Active" : "Inactive"}
                    </button>
                     </td>

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
                  <td colSpan="19" className="text-center text-muted">
                    No companies found
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
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1050,
          }}
          onClick={resetForm} // backdrop click closes modal
        >
          <div
            className="card shadow"
            style={{
              width: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing inside
          >
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {editingId ? "Edit Company" : "Add Company"}
              </h5>
              <button className="btn-close" onClick={resetForm}></button>
            </div>

            <form onSubmit={handleAddOrUpdateCompany} noValidate>
              <div className="card-body">
                {Object.keys(newCompany).map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label">
                      {field.replace(/_/g, " ").toUpperCase()}
                    </label>
                    {field === "logo" ? (
                      <input
                        type="file"
                        className="form-control"
                        name="logo"
                        accept="image/*"
                        onChange={handleChange}
                      />
                    ) : (
                      <input
                        type="text"
                        className={`form-control ${
                          errors[field] ? "is-invalid" : ""
                        }`}
                        name={field}
                        value={newCompany[field] || ""}
                        onChange={handleChange}
                      />
                    )}
                    {errors[field] && (
                      <div className="invalid-feedback">{errors[field]}</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="card-footer d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
