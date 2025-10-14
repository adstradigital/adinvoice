"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getClientsCompanies,
  getProposalsByClient,
  getProposalItems,
} from "../../../../Api/index";

const THEME = {
  primary: "#16a34a",
  primarySoft: "#e8f7ee",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  light: "#f9fafb",
};

export default function InvoiceBuilder() {
  const [template, setTemplate] = useState("saffron");
  const [clients, setClients] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProposal, setSelectedProposal] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch clients from API
  const fetchClients = async () => {
    setLoading(true);
    setError("");
    try {
      const clientsData = await getClientsCompanies();
      console.log("API Response (clients):", clientsData);

      if (Array.isArray(clientsData) && clientsData.length > 0) {
        const transformedClients = clientsData.map((client) => ({
          id: client.id,
          name: client.company_name || client.name || `Client ${client.id}`,
          address: client.address || "N/A",
          gstin: client.gstin || "N/A",
          email: client.email || "N/A",
          phone: client.phone || "N/A",
          company_name: client.company_name,
        }));
        setClients(transformedClients);
      } else {
        console.warn("⚠️ No valid clients found.");
        setError("No clients found. Please add clients first.");
      }
    } catch (err) {
      console.error("❌ Error fetching clients:", err);
      setError("Failed to load clients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch proposals for selected client
  const fetchProposals = async (clientId) => {
    if (!clientId) {
      setProposals([]);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      console.log("🔍 Starting fetchProposals for client:", clientId);
      
      const response = await getProposalsByClient(clientId);
      console.log("🔍 API Response:", response);

      // Handle the API response format
      let proposalsData = [];
      if (response.success && response.proposals) {
        proposalsData = response.proposals;
      } else if (Array.isArray(response)) {
        proposalsData = response;
      } else if (response.data && response.data.proposals) {
        proposalsData = response.data.proposals;
      }

      console.log("🔍 Processed proposals data:", proposalsData);

      if (Array.isArray(proposalsData) && proposalsData.length > 0) {
        // Transform API response to match expected format
        const transformedProposals = proposalsData.map((proposal) => ({
          id: proposal.id,
          title: proposal.title || proposal.proposal_number || `Proposal ${proposal.id}`,
          status: proposal.status ? 
            proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) 
            : "Draft",
          client_id: clientId,
          total_amount: proposal.grand_total || proposal.total_amount || 0,
          created_at: proposal.created_at,
          proposal_number: proposal.proposal_number,
          client_name: proposal.client_name,
        }));
        
        console.log("✅ Transformed proposals:", transformedProposals);
        setProposals(transformedProposals);
        setError(""); // Clear any previous errors
      } else {
        console.log("❌ No proposals found for this client");
        setProposals([]);
        setError("No proposals found for this client. Please create a proposal first.");
      }

    } catch (err) {
      console.error("❌ Error in fetchProposals:", err);
      
      const errorMessage = err.response?.data?.error || err.message || "Failed to load proposals";
      setError(`API Error: ${errorMessage}`);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoice items for selected proposal
  const fetchInvoiceItems = async (proposalId) => {
    if (!proposalId) {
      setInvoiceItems([]);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      console.log("📦 Fetching items for proposal:", proposalId);
      
      const itemsData = await getProposalItems(proposalId);
      console.log("📦 Items data received:", itemsData);

      if (itemsData && itemsData.length > 0) {
        // Transform API response to match expected format
        const transformedItems = itemsData.map((item) => ({
          description: item.description || item.name || "Service Item",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || Number(item.unit_price) || 0,
          gst: Number(item.gst_rate) || Number(item.gst) || 18,
          id: item.id,
          unit: item.unit || "pc",
          item_type: item.item_type || "service",
        }));
        setInvoiceItems(transformedItems);
        console.log("✅ Transformed items:", transformedItems);
        setError(""); // Clear any previous errors
      } else {
        setInvoiceItems([]);
        console.log("❌ No items found for this proposal");
        setError("No items found for this proposal. You can add items manually.");
      }
    } catch (err) {
      console.error("❌ Error fetching proposal items:", err);

      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load proposal items";
      setError(`API Error: ${errorMessage}`);
      setInvoiceItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchProposals(selectedClient);
      setSelectedProposal("");
      setInvoiceItems([]);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedProposal) {
      fetchInvoiceItems(selectedProposal);
    }
  }, [selectedProposal]);

  const updateItem = (index, field, value) => {
    const updated = [...invoiceItems];
    const v =
      field === "quantity" || field === "price" || field === "gst"
        ? Number(value)
        : value;
    updated[index][field] = v;
    setInvoiceItems(updated);
  };

  const addNewItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        description: "New Service Item",
        quantity: 1,
        price: 0,
        gst: 18,
        id: `temp-${Date.now()}`,
      }
    ]);
  };

  const removeItem = (index) => {
    const updated = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updated);
  };

  const { subtotal, totalGST, grandTotal } = useMemo(() => {
    const sub = invoiceItems.reduce((s, it) => s + it.quantity * it.price, 0);
    const gst = invoiceItems.reduce(
      (s, it) => s + it.quantity * it.price * (it.gst / 100),
      0
    );
    return { 
      subtotal: Math.round(sub * 100) / 100, 
      totalGST: Math.round(gst * 100) / 100, 
      grandTotal: Math.round((sub + gst) * 100) / 100 
    };
  }, [invoiceItems]);

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(n) ? n : 0);

  const handleDownload = async () => {
    try {
      // Dynamically import html2pdf only on client side
      const html2pdf = (await import('html2pdf.js')).default;
      
      const el = document.getElementById("invoice-preview");
      if (!el) {
        setError("Invoice preview not found");
        return;
      }
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `invoice-${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy", "avoid-all"] },
      };
      
      html2pdf().set(opt).from(el).save();
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
      setError("Failed to generate PDF. Please try again.");
    }
  };

  const motionCard = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <div className="container py-5" style={{ maxWidth: 980 }}>
      <style jsx global>{`
        :root {
          --red: #e53935;
          --red-deep: #c62828;
          --grey-700: #374151;
          --grey-600: #4b5563;
          --grey-500: #6b7280;
          --grey-300: #d1d5db;
          --grey-200: #e5e7eb;
          --grey-100: #f3f4f6;
        }

        .inv-card {
          border: 1px solid ${THEME.border};
          border-radius: 14px;
          background: #fff;
        }

        /* Global table safety for PDF */
        #invoice-preview table tr {
          page-break-inside: avoid;
        }

        /* Print sizing */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          #invoice-preview {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
          }
        }
        @page {
          size: A4;
          margin: 12mm 12mm 14mm 12mm;
        }

        /* Existing variants (kept) */
        .inv-preview.classic .table thead th {
          background: ${THEME.dark};
          color: #fff;
        }
        .inv-preview.minimal .table thead th {
          background: #f3f4f6;
          color: #111827;
        }
        .inv-preview.modern .table thead th {
          background: ${THEME.primary};
          color: #fff;
        }

        /* SAFFRON variant — red accent like the image */
        .inv-preview.saffron {
          background: #fff;
        }
        .inv-preview.saffron .sheet {
          position: relative;
          padding: 32px 32px 40px 32px;
        }
        .inv-preview.saffron .left-rail {
          position: absolute;
          top: 24px;
          bottom: 24px;
          left: 0;
          width: 56px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .inv-preview.saffron .left-rail .vertical-tag {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          color: var(--red);
          font-weight: 700;
          letter-spacing: 0.08em;
          font-size: 18px;
        }
        .inv-preview.saffron .content {
          margin-left: 72px;
        }
        .inv-preview.saffron .brand-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .inv-preview.saffron .brand-title {
          color: #d84315;
          font-weight: 600;
          font-size: 18px;
        }
        .inv-preview.saffron .brand-address {
          color: var(--grey-600);
          font-size: 12px;
          line-height: 1.4;
          margin-top: 4px;
        }
        .inv-preview.saffron .logo-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #bdbdbd;
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
        .inv-preview.saffron .red-rule {
          border-top: 2px solid var(--red);
          margin: 16px 0;
        }

        .inv-preview.saffron .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px 24px;
          margin-bottom: 10px;
        }
        .inv-preview.saffron .meta-box {
          font-size: 12px;
          line-height: 1.5;
        }
        .inv-preview.saffron .meta-title {
          color: var(--red);
          font-weight: 700;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-size: 12px;
        }
        .inv-preview.saffron .meta-line {
          color: var(--grey-700);
        }
        .inv-preview.saffron .meta-right {
          display: grid;
          grid-template-columns: 120px 1fr;
          row-gap: 6px;
          font-size: 12px;
          color: var(--grey-700);
        }
        .inv-preview.saffron .meta-right .label {
          color: var(--grey-600);
        }

        .inv-preview.saffron .items table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid var(--grey-300);
        }
        .inv-preview.saffron .items thead th {
          background: var(--red);
          color: #fff;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 8px 10px;
          border-right: 1px solid var(--grey-300);
        }
        .inv-preview.saffron .items thead th:last-child {
          border-right: 0;
        }
        .inv-preview.saffron .items tbody td {
          font-size: 13px;
          padding: 8px 10px;
          border-right: 1px solid var(--grey-300);
          border-top: 1px solid var(--grey-300);
        }
        .inv-preview.saffron .items tbody td:last-child {
          border-right: 0;
        }
        .inv-preview.saffron .items .col-qty {
          width: 60px;
          text-align: center;
        }
        .inv-preview.saffron .items .col-unit,
        .inv-preview.saffron .items .col-amount {
          width: 140px;
          text-align: right;
        }

        .inv-preview.saffron .totals {
          width: 100%;
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 260px;
        }
        .inv-preview.saffron .totals .right {
          border: 1px solid var(--grey-300);
          padding: 10px 12px;
        }
        .inv-preview.saffron .totals-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          font-size: 13px;
          color: var(--grey-700);
          padding: 4px 0;
        }
        .inv-preview.saffron .grand {
          font-weight: 700;
          font-size: 16px;
          color: #111;
          padding-top: 6px;
        }

        .inv-preview.saffron .signature-wrap {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }
        .inv-preview.saffron .signature {
          height: 56px;
          width: 220px;
          background: linear-gradient(90deg, #0000, #0001 10%, #0000 20%);
          color: #111;
          font-family: "Segoe Script", "Brush Script MT", cursive;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .inv-preview.saffron .terms {
          margin-top: 24px;
          border-top: 1px solid var(--grey-200);
          padding-top: 10px;
        }
        .inv-preview.saffron .terms-title {
          color: var(--red);
          font-weight: 700;
          font-size: 12px;
          margin-bottom: 6px;
        }
        .inv-preview.saffron .terms-text {
          font-size: 12px;
          color: var(--grey-700);
          margin-bottom: 8px;
        }
        .inv-preview.saffron .bank {
          font-size: 12px;
          color: var(--grey-700);
          line-height: 1.5;
        }
      `}</style>

      {/* Error Alert */}
      {error && (
        <motion.div {...motionCard} className="alert alert-warning mb-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <motion.div {...motionCard} className="alert alert-info mb-3">
          <div className="d-flex align-items-center">
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading...
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div {...motionCard} className="inv-card mb-3">
        <div className="p-3">
          <div className="d-flex align-items-center justify-content-between">
            <h6 className="fw-semibold mb-0" style={{ color: "#6b7280" }}>
              Template
            </h6>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn ${
                  template === "saffron" ? "btn-danger" : "btn-outline-danger"
                }`}
                onClick={() => setTemplate("saffron")}
              >
                Saffron
              </button>
              <button
                type="button"
                className={`btn ${
                  template === "classic" ? "btn-dark" : "btn-outline-dark"
                }`}
                onClick={() => setTemplate("classic")}
              >
                Classic
              </button>
              <button
                type="button"
                className={`btn ${
                  template === "minimal"
                    ? "btn-secondary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setTemplate("minimal")}
              >
                Minimal
              </button>
              <button
                type="button"
                className={`btn ${
                  template === "modern" ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() => setTemplate("modern")}
              >
                Modern
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Client */}
      <motion.div {...motionCard} className="inv-card mb-3">
        <div className="p-3">
          <h6 className="fw-semibold mb-2" style={{ color: "#6b7280" }}>
            Step 1: Select Client
          </h6>
          <select
            className="form-select"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Choose Client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Proposal */}
      {selectedClient && proposals.length > 0 && (
        <motion.div {...motionCard} className="inv-card mb-3">
          <div className="p-3">
            <h6 className="fw-semibold mb-2" style={{ color: "#6b7280" }}>
              Step 2: Select Proposal ({proposals.length} found)
            </h6>
            <select
              className="form-select"
              value={selectedProposal}
              onChange={(e) => {
                console.log("Selected proposal:", e.target.value);
                setSelectedProposal(e.target.value);
              }}
              disabled={loading}
            >
              <option value="">-- Choose Proposal --</option>
              {proposals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status}) - {formatINR(p.total_amount)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      {selectedClient && proposals.length === 0 && !loading && (
        <motion.div {...motionCard} className="inv-card mb-3">
          <div className="p-3">
            <div className="alert alert-info mb-0">
              <i className="bi bi-info-circle me-2"></i>
              No proposals found for this client. Please create a proposal first.
            </div>
          </div>
        </motion.div>
      )}

      {/* Items editor */}
      {selectedProposal && !previewMode && (
        <motion.div {...motionCard} className="inv-card">
          <div className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-semibold mb-0" style={{ color: "#6b7280" }}>
                Step 3: Edit Invoice Items
                {invoiceItems.length > 0 && ` (${invoiceItems.length} items)`}
              </h6>
              <button
                className="btn btn-primary btn-sm"
                onClick={addNewItem}
                disabled={loading}
              >
                + Add Item
              </button>
            </div>
            
            {invoiceItems.length > 0 ? (
              <>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Description</th>
                        <th width="10%">Qty</th>
                        <th width="15%">Price</th>
                        <th width="10%">GST %</th>
                        <th width="15%">Total</th>
                        <th width="5%"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceItems.map((item, i) => {
                        const rowTotal = item.price * item.quantity * (1 + item.gst / 100);
                        return (
                          <tr key={item.id || i}>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={item.description}
                                onChange={(e) =>
                                  updateItem(i, "description", e.target.value)
                                }
                                disabled={loading}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                className="form-control text-center"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(i, "quantity", Number(e.target.value))
                                }
                                disabled={loading}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                className="form-control text-end"
                                value={item.price}
                                onChange={(e) =>
                                  updateItem(i, "price", Number(e.target.value))
                                }
                                disabled={loading}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                step="0.1"
                                className="form-control text-center"
                                value={item.gst}
                                onChange={(e) =>
                                  updateItem(i, "gst", Number(e.target.value))
                                }
                                disabled={loading}
                              />
                            </td>
                            <td className="fw-semibold text-end">
                              {formatINR(rowTotal)}
                            </td>
                            <td>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeItem(i)}
                                disabled={invoiceItems.length === 1 || loading}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <div className="text-end">
                    <div className="text-muted small">Subtotal</div>
                    <div className="fs-5">{formatINR(subtotal)}</div>
                    <div className="text-muted small mt-2">Total GST</div>
                    <div className="fs-6">{formatINR(totalGST)}</div>
                    <hr className="my-2" />
                    <div className="fs-4" style={{ color: "#e53935" }}>
                      Grand Total:{" "}
                      <span className="fw-bold">{formatINR(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-end mt-4">
                  <button
                    className="btn btn-danger px-4"
                    onClick={() => setPreviewMode(true)}
                    disabled={loading || invoiceItems.length === 0}
                  >
                    👁 Preview Invoice
                  </button>
                </div>
              </>
            ) : (
              <div className="alert alert-warning">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <div>
                    <strong>No items found for this proposal.</strong>
                    <div className="small mt-1">
                      Click "Add Item" to start creating your invoice.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Preview */}
      <AnimatePresence>
        {previewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <div
              id="invoice-preview"
              className={`inv-card inv-preview ${template} shadow-lg p-0 rounded-4`}
              style={{ fontFamily: "Inter, Arial, sans-serif" }}
            >
              {template === "saffron" ? (
                <div className="sheet">
                  <div className="left-rail">
                    <div className="vertical-tag">Invoice IN-001</div>
                  </div>
                  <div className="content">
                    {/* Brand row */}
                    <div className="brand-row">
                      <div>
                        <div className="brand-title">
                          CUBE Real Estate Pvt. Ltd.
                        </div>
                        <div className="brand-address">
                          Flat No. 006, Shivam Apartment
                          <br />
                          Opp. Manipal Hospital, Pune - 411001
                          <br />
                          GSTIN: 27AAACC1234F1Z5 | PAN: AAACC1234F
                        </div>
                      </div>
                      <div className="logo-circle">CR</div>
                    </div>

                    <div className="red-rule" />

                    {/* Meta grid */}
                    <div className="meta-grid">
                      <div className="meta-box">
                        <div className="meta-title">Bill To</div>
                        <div className="meta-line">
                          {clients.find((c) => c.id == selectedClient)?.name ||
                            "Client Name"}
                          <br />
                          {clients.find((c) => c.id == selectedClient)?.address ||
                            "Client Address"}
                        </div>
                      </div>
                      <div className="meta-box">
                        <div className="meta-title">Ship To</div>
                        <div className="meta-line">
                          Same as billing address
                        </div>
                      </div>

                      <div className="meta-right">
                        <div className="label">Invoice Date</div>
                        <div>{new Date().toLocaleDateString()}</div>
                        <div className="label">Invoice No</div>
                        <div>
                          INV-
                          {String(Math.floor(Math.random() * 100000)).padStart(
                            5,
                            "0"
                          )}
                        </div>
                        <div className="label">Due Date</div>
                        <div>
                          {new Date(
                            Date.now() + 15 * 24 * 60 * 60 * 1000
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="items">
                      <table>
                        <thead>
                          <tr>
                            <th className="col-qty">Qty</th>
                            <th>Description</th>
                            <th className="col-unit">Unit Price</th>
                            <th className="col-amount">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceItems.map((it, i) => {
                            const amount = it.quantity * it.price;
                            return (
                              <tr key={it.id || i}>
                                <td className="col-qty">{it.quantity}</td>
                                <td>{it.description}</td>
                                <td className="col-unit">
                                  {formatINR(it.price)}
                                </td>
                                <td className="col-amount">
                                  {formatINR(amount)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr>
                            <td
                              colSpan={3}
                              style={{ textAlign: "right", color: "#4b5563" }}
                            >
                              Subtotal
                            </td>
                            <td className="col-amount">
                              {formatINR(subtotal)}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan={3}
                              style={{ textAlign: "right", color: "#4b5563" }}
                            >
                              GST ({invoiceItems[0]?.gst ?? 18}%)
                            </td>
                            <td className="col-amount">
                              {formatINR(totalGST)}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan={3}
                              style={{
                                textAlign: "right",
                                fontWeight: 700,
                                fontSize: 16,
                              }}
                            >
                              Grand Total
                            </td>
                            <td
                              className="col-amount"
                              style={{ fontWeight: 700, fontSize: 16 }}
                            >
                              {formatINR(grandTotal)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Bank Details & Terms */}
                    <div className="mt-4">
                      <div className="terms-title">Bank Details</div>
                      <div className="bank">
                        Bank Name: HDFC Bank
                        <br />
                        Account Number: 987654321012
                        <br />
                        IFSC Code: HDFC0001987
                        <br />
                        Branch: Koregaon Park, Pune
                      </div>

                      <div className="terms-title mt-3">Terms & Conditions</div>
                      <div className="terms-text">
                        Payment due within 15 days from invoice date.
                        <br />
                        Late payments may attract a 2% interest per month.
                      </div>

                      <div className="terms-title">Declaration</div>
                      <div className="terms-text">
                        We declare that the information stated above is true and
                        correct to the best of our knowledge.
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="signature-wrap">
                      <div className="signature">Authorized Signatory</div>
                    </div>
                  </div>
                </div>
              ) : (
                // Fallback: existing layout for other templates
                <>
                  <div
                    className="p-4 pb-3 border-bottom"
                    style={{ borderColor: THEME.border }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div
                          className="me-3"
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 8,
                            border: `1px solid ${THEME.border}`,
                            backgroundColor: THEME.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          CR
                        </div>
                        <div>
                          <h3
                            className="fw-bold mb-0 brand-title"
                            style={{ color: THEME.dark }}
                          >
                            CUBE Real Estate Pvt. Ltd.
                          </h3>
                          <div
                            className="mt-1"
                            style={{ color: "#6b7280", fontSize: 12 }}
                          >
                            Invoice & Billing
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div
                          className="d-inline-block mb-1"
                          style={{
                            background: "#111827",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: 6,
                            fontSize: 12,
                          }}
                        >
                          INVOICE
                        </div>
                        <div className="small" style={{ color: "#6b7280" }}>
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div
                          className="p-3"
                          style={{
                            background: THEME.light,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: 10,
                          }}
                        >
                          <h6
                            className="fw-bold mb-2"
                            style={{ color: THEME.dark }}
                          >
                            Company Details
                          </h6>
                          <div className="small">
                            Flat No. 006, Shivam Apartment
                          </div>
                          <div className="small">
                            Opp. Manipal Hospital, Pune - 411001
                          </div>
                          <div className="small">GSTIN: 27AAACC1234F1Z5</div>
                          <div className="small">
                            Email: accounts@cuberealestate.com
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div
                          className="p-3"
                          style={{
                            background: THEME.primarySoft,
                            border: `1px solid ${THEME.border}`,
                            borderRadius: 10,
                          }}
                        >
                          <h6
                            className="fw-bold mb-2"
                            style={{ color: THEME.dark }}
                          >
                            Client & Invoice Info
                          </h6>
                          <div className="small">
                            <span
                              style={{ color: THEME.muted }}
                              className="me-1"
                            >
                              Client:
                            </span>
                            {clients.find((c) => c.id == selectedClient)?.name}
                          </div>
                          <div className="small">
                            <span
                              style={{ color: THEME.muted }}
                              className="me-1"
                            >
                              Proposal:
                            </span>
                            {
                              proposals.find((p) => p.id == selectedProposal)
                                ?.title
                            }
                          </div>
                          <div className="small">
                            <span
                              style={{ color: THEME.muted }}
                              className="me-1"
                            >
                              Invoice No:
                            </span>
                            INV-
                            {String(
                              Math.floor(Math.random() * 100000)
                            ).padStart(5, "0")}
                          </div>
                          <div className="small">
                            <span
                              style={{ color: THEME.muted }}
                              className="me-1"
                            >
                              Date:
                            </span>
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4">
                    <div className="table-responsive">
                      <table className="table table-striped table-bordered align-middle">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>GST</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceItems.map((item, i) => {
                            const rowTotal =
                              item.price * item.quantity * (1 + item.gst / 100);
                            return (
                              <tr key={item.id || i}>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{formatINR(item.price)}</td>
                                <td>{item.gst}%</td>
                                <td>{formatINR(rowTotal)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div
                      className="d-flex justify-content-end p-3"
                      style={{
                        backgroundColor: THEME.light,
                        border: `1px solid ${THEME.border}`,
                        borderRadius: 12,
                      }}
                    >
                      <div className="text-end">
                        <div className="small" style={{ color: THEME.muted }}>
                          Subtotal
                        </div>
                        <div className="fw-semibold">{formatINR(subtotal)}</div>
                        <div
                          className="small mt-2"
                          style={{ color: THEME.muted }}
                        >
                          Total GST
                        </div>
                        <div className="fw-semibold">{formatINR(totalGST)}</div>
                        <hr className="my-2" />
                        <div className="fs-5" style={{ color: THEME.primary }}>
                          Total Payable:{" "}
                          <span className="fw-bold">
                            {formatINR(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="text-end mt-3">
              <button className="btn btn-danger me-2" onClick={handleDownload}>
                ⬇ Download PDF
              </button>
              <button
                className="btn btn-outline-dark"
                onClick={() => setPreviewMode(false)}
              >
                ✏ Edit Invoice
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}