"use client";
import React, { useEffect, useState, useRef } from "react";
import { Pencil, Trash2, Download, Mail, Printer, Save, Search, Receipt } from "lucide-react";
import { getInvoices, getInvoiceById, createReceipt, getReceipts, updateReceipt, deleteReceipt } from "../../../../Api/api_clientadmin";

export default function ReceiptsPage() {
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  
  const [form, setForm] = useState({
    receiptNumber: "",
    invoice: "",
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    clientName: "",
    clientEmail: "",
    description: "",
    totalAmount: 0,
    paidAmount: 0,
    balanceAmount: 0,
    dueDate: "",
    nextPayment: "",
    status: "Pending",
  });

  const previewRef = useRef(null);

  useEffect(() => {
    fetchInvoices();
    fetchReceipts();
    generateReceiptNumber();
  }, []);

  async function fetchInvoices() {
    try {
      setLoading(true);
      const data = await getInvoices();
      let invoicesData = [];
      if (data.invoices) invoicesData = data.invoices;
      else if (data.data?.invoices) invoicesData = data.data.invoices;
      else if (Array.isArray(data)) invoicesData = data;
      else if (data.data && Array.isArray(data.data)) invoicesData = data.data;
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReceipts() {
    try {
      setApiLoading(true);
      const data = await getReceipts();
      if (data.success && data.receipts) setReceipts(data.receipts);
      else if (Array.isArray(data)) setReceipts(data);
      else setReceipts([]);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setReceipts([]);
    } finally {
      setApiLoading(false);
    }
  }

  function generateReceiptNumber() {
    const nextId = receipts.length > 0 ? Math.max(...receipts.map(r => parseInt(r.receipt_number?.split('-')[1]) || 0)) + 1 : 1;
    setForm(f => ({ ...f, receiptNumber: `R-${String(nextId).padStart(3, "0")}` }));
  }

  const filteredInvoices = invoices.filter(inv => {
    const searchTerm = invoiceSearchQuery.toLowerCase();
    return (
      inv.invoice_number?.toLowerCase().includes(searchTerm) ||
      inv.client?.name?.toLowerCase().includes(searchTerm) ||
      inv.client?.company_name?.toLowerCase().includes(searchTerm)
    );
  });

  const filteredReceipts = receipts.filter(r => {
    const q = searchQuery.toLowerCase();
    return !q || 
      r.client_name?.toLowerCase().includes(q) || 
      r.receipt_number?.toLowerCase().includes(q);
  });

  async function handleSelectInvoice(inv) {
    try {
      setLoading(true);
      setSelectedInvoice(inv);
      setShowInvoiceDropdown(false);
      setInvoiceSearchQuery(inv.invoice_number || ""); // Set the input box to show invoice number
      
      const total = extractAmount(inv);
      const paid = 0;
      const balance = total - paid;
      
      setForm(f => ({
        ...f,
        invoice: inv.id,
        invoiceNumber: inv.invoice_number || "",
        totalAmount: total,
        clientName: inv.client?.name || inv.client_name || inv.client?.company_name || "",
        clientEmail: inv.client?.email || inv.client_email || "",
        dueDate: inv.due_date || "",
        description: inv.notes || `Payment for ${inv.invoice_number}`,
        paidAmount: paid,
        balanceAmount: balance,
        status: computeStatus(paid, total, balance),
      }));
    } catch (error) {
      console.error("Error loading invoice details:", error);
      alert("Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  }

  function extractAmount(invoiceData) {
    const amountFields = ['total_amount', 'grand_total', 'amount', 'total'];
    for (let field of amountFields) {
      if (invoiceData[field] !== undefined && invoiceData[field] !== null) {
        const amount = parseFloat(invoiceData[field]);
        if (!isNaN(amount)) return amount;
      }
    }
    return 0;
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    
    if (name === "paidAmount") {
      const paid = parseFloat(value || 0);
      const total = parseFloat(form.totalAmount || 0);
      const balance = Math.max(0, total - paid);
      const status = computeStatus(paid, total, balance);
      setForm(f => ({ ...f, paidAmount: paid, balanceAmount: balance, status }));
      return;
    }
    
    if (name === "totalAmount") {
      const total = parseFloat(value || 0);
      const paid = parseFloat(form.paidAmount || 0);
      const balance = Math.max(0, total - paid);
      const status = computeStatus(paid, total, balance);
      setForm(f => ({ ...f, totalAmount: total, balanceAmount: balance, status }));
      return;
    }
    
    setForm(f => ({ ...f, [name]: value }));
  }

  function computeStatus(paidAmount, totalAmount, balanceAmount) {
    const paid = Number(paidAmount || 0);
    const total = Number(totalAmount || 0);
    const balance = Number(balanceAmount || 0);
    
    if (balance === 0) return "Closed";
    if (paid === 0) return "Pending";
    if (paid > 0 && paid < total) return "Partially Paid";
    if (paid >= total) return "Paid";
    return "Pending";
  }

  async function handleSave(e) {
    e.preventDefault();
    
    if (!form.receiptNumber) {
      alert("Receipt number is required");
      return;
    }

    try {
      setApiLoading(true);
      const payload = {
        receipt_number: form.receiptNumber,
        invoice: form.invoice,
        date: form.date,
        client_name: form.clientName,
        client_email: form.clientEmail,
        description: form.description,
        total_amount: Number(form.totalAmount || 0),
        paid_amount: Number(form.paidAmount || 0),
        due_date: form.dueDate || null,
        status: form.status,
      };

      if (editingReceipt) {
        await updateReceipt(editingReceipt.id, payload);
        alert("Receipt updated successfully!");
      } else {
        await createReceipt(payload);
        alert("Receipt created successfully!");
      }
      
      await fetchReceipts();
      generateReceiptNumber();
      setForm(f => ({
        ...f,
        invoice: "",
        invoiceNumber: "",
        clientName: "",
        clientEmail: "",
        description: "",
        totalAmount: 0,
        paidAmount: 0,
        balanceAmount: 0,
        dueDate: "",
        status: "Pending",
      }));
      setSelectedInvoice(null);
      setEditingReceipt(null);
      setInvoiceSearchQuery(""); // Clear the invoice search input
      
    } catch (error) {
      console.error("Error saving receipt:", error);
      alert(error.error?.message || error.detail || "Failed to save receipt");
    } finally {
      setApiLoading(false);
    }
  }

  function handleEditReceipt(r) {
    setEditingReceipt(r);
    setForm({
      receiptNumber: r.receipt_number,
      invoice: r.invoice?.id || r.invoice,
      invoiceNumber: r.invoice_number || "",
      date: r.date,
      clientName: r.client_name,
      clientEmail: r.client_email || "",
      description: r.description || "",
      totalAmount: parseFloat(r.total_amount || 0),
      paidAmount: parseFloat(r.paid_amount || 0),
      balanceAmount: parseFloat(r.balance_amount || 0),
      dueDate: r.due_date || "",
      nextPayment: r.next_payment || "",
      status: r.status,
    });
    setSelectedInvoice(null);
    setInvoiceSearchQuery(r.invoice_number || ""); // Show invoice number in search input when editing
  }

  async function handleDeleteReceipt(id) {
    if (!window.confirm("Delete this receipt?")) return;
    
    try {
      setApiLoading(true);
      await deleteReceipt(id);
      alert("Receipt deleted successfully!");
      await fetchReceipts();
    } catch (error) {
      console.error("Error deleting receipt:", error);
      alert(error.error?.message || error.detail || "Failed to delete receipt");
    } finally {
      setApiLoading(false);
    }
  }

  function handlePrint() {
    const printContent = previewRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { padding: 20px; font-family: Arial, sans-serif; }
            .receipt-container { max-width: 500px; margin: 0 auto; border: 2px solid #000; padding: 30px; }
          </style>
        </head>
        <body>
          <div class="receipt-container">${printContent}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }

  function handleDownloadPDF() {
    handlePrint();
  }

  function handleSendEmail() {
    const subject = encodeURIComponent(`Receipt ${form.receiptNumber}`);
    const body = encodeURIComponent(
      `Dear ${form.clientName},

Please find your receipt attached.

Receipt Number: ${form.receiptNumber}
Date: ${form.date}
Amount: ₹${Number(form.paidAmount || 0).toFixed(2)}

Thank you for your business!`
    );
    window.open(`mailto:${form.clientEmail || ""}?subject=${subject}&body=${body}`);
  }

  function rupee(val) {
    return `₹${Number(val || 0).toLocaleString()}`;
  }

  function badgeClass(status) {
    switch (status) {
      case "Closed": return "bg-success text-white";
      case "Paid": return "bg-success bg-opacity-10 text-success";
      case "Partially Paid": return "bg-warning bg-opacity-10 text-warning";
      case "Pending": return "bg-danger bg-opacity-10 text-danger";
      default: return "bg-secondary";
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row align-items-center mb-4">
        <div className="col">
          <h2 className="h4 fw-bold mb-1">🧾 Receipt Management</h2>
          <small className="text-muted">Create and manage payment receipts</small>
        </div>
        {apiLoading && (
          <div className="col-auto">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>

      <div className="row g-4 mb-4">
        {/* Form Section */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">
                {editingReceipt ? "Edit Receipt" : "Create New Receipt"}
              </h5>
            </div>
            <div className="card-body">
              {/* Invoice Search */}
              <div className="mb-3 position-relative">
                <label className="form-label fw-semibold">Select Invoice</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search invoices..."
                    value={invoiceSearchQuery}
                    onChange={(e) => {
                      setInvoiceSearchQuery(e.target.value);
                      setShowInvoiceDropdown(true);
                    }}
                    onFocus={() => setShowInvoiceDropdown(true)}
                  />
                  <button 
                    className="btn btn-outline-primary" 
                    type="button"
                    onClick={() => setShowInvoiceDropdown(!showInvoiceDropdown)}
                  >
                    {showInvoiceDropdown ? "Hide" : "Show"} Invoices
                  </button>
                </div>

                {showInvoiceDropdown && (
                  <div className="card position-absolute w-100 mt-1 shadow-lg border-0" style={{ zIndex: 1050, maxHeight: "300px", overflowY: "auto" }}>
                    <div className="card-body p-2">
                      {loading ? (
                        <div className="text-center py-3">
                          <div className="spinner-border spinner-border-sm"></div>
                        </div>
                      ) : filteredInvoices.length === 0 ? (
                        <div className="text-center text-muted py-2">No invoices found</div>
                      ) : (
                        filteredInvoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="d-flex justify-content-between align-items-center py-2 px-2 border-bottom hover-bg-light"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSelectInvoice(inv)}
                          >
                            <div>
                              <div className="fw-semibold">{inv.invoice_number}</div>
                              <small className="text-muted">
                                {inv.client?.name || inv.client?.company_name} • {rupee(extractAmount(inv))}
                              </small>
                            </div>
                            <span className="badge bg-primary">Select</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Receipt Form */}
              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Receipt Number *</label>
                    <input
                      type="text"
                      name="receiptNumber"
                      className="form-control"
                      value={form.receiptNumber}
                      onChange={(e) => setForm(f => ({ ...f, receiptNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Date *</label>
                    <input
                      type="date"
                      name="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Invoice Number</label>
                    <input
                      type="text"
                      name="invoiceNumber"
                      className="form-control bg-light"
                      value={form.invoiceNumber}
                      readOnly
                      placeholder="Auto-filled from selected invoice"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      className="form-control"
                      value={form.clientName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Client Email</label>
                    <input
                      type="email"
                      name="clientEmail"
                      className="form-control"
                      value={form.clientEmail}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Total Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="totalAmount"
                      className="form-control"
                      value={form.totalAmount}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Paid Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="paidAmount"
                      className="form-control"
                      value={form.paidAmount}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows="2"
                      value={form.description}
                      onChange={handleFormChange}
                      placeholder="Payment details..."
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-end mt-4">
                  <button type="submit" className="btn btn-success px-4" disabled={apiLoading}>
                    {apiLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> {editingReceipt ? "Update" : "Save Receipt"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Receipt Preview</h5>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary btn-sm" onClick={handleDownloadPDF}>
                  <Download size={14} />
                </button>
                <button className="btn btn-outline-primary btn-sm" onClick={handleSendEmail}>
                  <Mail size={14} />
                </button>
                <button className="btn btn-outline-primary btn-sm" onClick={handlePrint}>
                  <Printer size={14} />
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="receipt-preview bg-light p-4 rounded-3 border" ref={previewRef}>
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-primary">OFFICIAL RECEIPT</h3>
                  <div className="border-top border-bottom py-2 my-3">
                    <h5 className="mb-0">Your Company Name</h5>
                    <small className="text-muted">Company Address • Phone • Email</small>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-6">
                    <strong>Receipt No:</strong> {form.receiptNumber || "R-001"}
                  </div>
                  <div className="col-6 text-end">
                    <strong>Date:</strong> {form.date}
                  </div>
                </div>

                <div className="mb-4">
                  <strong>Received from:</strong>
                  <div className="fw-semibold">{form.clientName || "Client Name"}</div>
                  <small className="text-muted">{form.clientEmail || "client@email.com"}</small>
                </div>

                <div className="mb-4">
                  <strong>Invoice Number:</strong>
                  <div>{form.invoiceNumber || "-"}</div>
                </div>

                <div className="mb-4">
                  <strong>Description:</strong>
                  <div>{form.description || "Payment for services rendered"}</div>
                </div>

                <div className="border-top border-bottom py-3 mb-4">
                  <div className="row fw-bold">
                    <div className="col-6">Total Amount</div>
                    <div className="col-6 text-end">{rupee(form.totalAmount)}</div>
                  </div>
                  <div className="row text-success">
                    <div className="col-6">Amount Paid</div>
                    <div className="col-6 text-end">{rupee(form.paidAmount)}</div>
                  </div>
                </div>

                <div className="row fw-bold fs-5">
                  <div className="col-6">Balance Due</div>
                  <div className="col-6 text-end">{rupee(form.balanceAmount)}</div>
                </div>

                <div className="text-center mt-5 pt-4 border-top">
                  <small className="text-muted">Thank you for your business!</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts List - Removed Edit Option */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Receipts History</h5>
            <small className="text-muted">All generated receipts</small>
          </div>
          <div className="col-md-3">
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="Search receipts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-secondary" type="button">
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Receipt No</th>
                  <th>Date</th>
                  <th>Client</th>
                  <th className="text-end">Total</th>
                  <th className="text-end">Paid</th>
                  <th className="text-end">Balance</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm me-2"></div>
                      Loading receipts...
                    </td>
                  </tr>
                ) : filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No receipts found
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((r) => (
                    <tr key={r.id}>
                      <td className="fw-semibold">{r.receipt_number}</td>
                      <td>{r.date}</td>
                      <td>{r.client_name}</td>
                      <td className="text-end fw-bold">{rupee(r.total_amount)}</td>
                      <td className="text-end">{rupee(r.paid_amount)}</td>
                      <td className="text-end">{rupee(r.balance_amount)}</td>
                      <td>
                        <span className={`badge ${badgeClass(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button 
                          className="btn btn-outline-danger btn-sm" 
                          onClick={() => handleDeleteReceipt(r.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}