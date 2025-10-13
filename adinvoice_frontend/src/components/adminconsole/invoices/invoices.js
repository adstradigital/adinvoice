"use client";
import React, { useEffect, useMemo, useState } from "react";
import html2pdf from "html2pdf.js";
import { motion, AnimatePresence } from "framer-motion";
import { getClientsCompanies } from "../../../../Api/index"; // Adjust import path as needed

// Theme (kept; we also introduce saffron/red accents in template CSS)
const THEME = {
  primary: "#16a34a", 
  primarySoft: "#e8f7ee",
  dark: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  light: "#f9fafb",
};

export default function InvoiceBuilder() {
  // Add new template: "saffron" for the red-accent layout like the image
  const [template, setTemplate] = useState("saffron");

  // Dummy Data (fallback)
  const dummyClients = [
    { id: 1, name: "ABC Corporation" },
    { id: 2, name: "TechWorld Pvt Ltd" },
    { id: 3, name: "GreenLeaf Solutions" },
  ];

  const dummyProposals = {
    1: [
      { id: 101, title: "Website Revamp", status: "Approved" },
      { id: 102, title: "SEO Retainer", status: "Pending" },
    ],
    2: [
      { id: 201, title: "CRM Integration", status: "Approved" },
      { id: 202, title: "Mobile App Prototype", status: "Draft" },
    ],
    3: [{ id: 301, title: "E-commerce Portal", status: "Approved" }],
  };

  const dummyItems = {
    101: [
      {
        description: "Frontend design restructure",
        quantity: 1,
        price: 9999,
        gst: 12,
      },
      { description: "Custom icon package", quantity: 2, price: 975, gst: 12 },
      { description: "Gandhi mouse pad", quantity: 3, price: 99, gst: 12 },
    ],
    102: [
      { description: "SEO Audit", quantity: 1, price: 6000, gst: 18 },
      {
        description: "Monthly Optimization",
        quantity: 3,
        price: 4000,
        gst: 18,
      },
    ],
    201: [
      { description: "CRM Setup", quantity: 1, price: 12000, gst: 18 },
      { description: "Training & Support", quantity: 1, price: 3000, gst: 18 },
    ],
    202: [
      {
        description: "App Wireframe Design",
        quantity: 2,
        price: 5000,
        gst: 18,
      },
    ],
    301: [
      { description: "Shop Module", quantity: 1, price: 20000, gst: 18 },
      { description: "Payment Integration", quantity: 1, price: 5000, gst: 18 },
    ],
  };

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

      if (clientsData && clientsData.length > 0) {
        // Transform API response to match expected format
        const transformedClients = clientsData.map((client) => ({
          id: client.id,
          name: client.company_name || client.name || `Client ${client.id}`,
          // Add other client properties as needed from your API response
          address: client.address,
          gstin: client.gstin,
          email: client.email,
          phone: client.phone,
        }));
        setClients(transformedClients);
      } else {
        // Fallback to dummy data if no clients from API
        setClients(dummyClients);
        console.log("No clients found, using dummy data");
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load clients. Using sample data.");
      setClients(dummyClients); // Fallback to dummy data
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
    try {
      // Replace this with your actual API call for proposals
      // const proposalsData = await getProposalsByClient(clientId);

      // For now, using dummy data - replace with actual API call
      const clientProposals = dummyProposals[clientId] || [];
      setProposals(clientProposals);

      // Example of real API call (uncomment and implement):
      /*
      const proposalsData = await getProposalsByClient(clientId);
      if (proposalsData && proposalsData.length > 0) {
        setProposals(proposalsData);
      } else {
        setProposals([]);
      }
      */
    } catch (err) {
      console.error("Error fetching proposals:", err);
      setProposals(dummyProposals[clientId] || []);
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
    try {
      // Replace this with your actual API call for proposal items
      // const itemsData = await getProposalItems(proposalId);

      // For now, using dummy data - replace with actual API call
      const proposalItems = dummyItems[proposalId] || [];
      setInvoiceItems(proposalItems);

      // Example of real API call (uncomment and implement):
      /*
      const itemsData = await getProposalItems(proposalId);
      if (itemsData && itemsData.length > 0) {
        setInvoiceItems(itemsData);
      } else {
        setInvoiceItems([]);
      }
      */
    } catch (err) {
      console.error("Error fetching proposal items:", err);
      setInvoiceItems(dummyItems[proposalId] || []);
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

  const { subtotal, totalGST, grandTotal } = useMemo(() => {
    const sub = invoiceItems.reduce((s, it) => s + it.quantity * it.price, 0);
    const gst = invoiceItems.reduce(
      (s, it) => s + it.quantity * it.price * (it.gst / 100),
      0
    );
    return { subtotal: sub, totalGST: gst, grandTotal: sub + gst };
  }, [invoiceItems]);

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number.isFinite(n) ? n : 0);

  const handleDownload = () => {
    const el = document.getElementById("invoice-preview");
    if (!el) return;
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
  };

  const motionCard = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <div className="container py-5" style={{ maxWidth: 980 }}>
      <style jsx global>{`
        /* ... (keep all your existing CSS styles) */
      `}</style>

      {/* Error Alert */}
      {error && (
        <motion.div {...motionCard} className="alert alert-warning mb-3">
          {error}
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
            onChange={(e) => setSelectedClient(Number(e.target.value) || "")}
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
      {selectedClient && (
        <motion.div {...motionCard} className="inv-card mb-3">
          <div className="p-3">
            <h6 className="fw-semibold mb-2" style={{ color: "#6b7280" }}>
              Step 2: Select Proposal
            </h6>
            <select
              className="form-select"
              value={selectedProposal}
              onChange={(e) =>
                setSelectedProposal(Number(e.target.value) || "")
              }
              disabled={loading}
            >
              <option value="">-- Choose Proposal --</option>
              {proposals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.status})
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      {/* Items editor */}
      {invoiceItems.length > 0 && !previewMode && (
        <motion.div {...motionCard} className="inv-card">
          <div className="p-3 p-md-4">
            <h6 className="fw-semibold mb-3" style={{ color: "#6b7280" }}>
              Step 3: Edit Items
            </h6>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Description</th>
                    <th width="10%">Qty</th>
                    <th width="15%">Price</th>
                    <th width="10%">GST %</th>
                    <th width="15%">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, i) => {
                    const rowTotal =
                      item.price * item.quantity * (1 + item.gst / 100);
                    return (
                      <tr key={i}>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(i, "description", e.target.value)
                            }
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
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            className="form-control text-end"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(i, "price", Number(e.target.value))
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            className="form-control text-center"
                            value={item.gst}
                            onChange={(e) =>
                              updateItem(i, "gst", Number(e.target.value))
                            }
                          />
                        </td>
                        <td className="fw-semibold text-end">
                          {formatINR(rowTotal)}
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
              >
                👁 Preview Invoice
              </button>
            </div>
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
              {/* ... (keep all your existing preview JSX) */}

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
                          Wiseway Real Estate Pvt. Ltd.
                        </div>
                        <div className="brand-address">
                          Flat No. 006, Shivam Apartment
                          <br />
                          Opp. Manipal Hospital, Pune - 411001
                          <br />
                          GSTIN: 27AAACC1234F1Z5 | PAN: AAACC1234F
                        </div>
                      </div>
                      <div className="logo-circle">WW</div>
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
                          27, DLF City Phase 4<br />
                          Gurgaon, Haryana - 122002
                        </div>
                      </div>
                      <div className="meta-box">
                        <div className="meta-title">Ship To</div>
                        <div className="meta-line">Same as billing address</div>
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
                              <tr key={i}>
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
                        <img
                          src="/logo.png"
                          alt="Logo"
                          width="56"
                          height="56"
                          className="me-3"
                          style={{
                            borderRadius: 8,
                            border: `1px solid ${THEME.border}`,
                          }}
                        />
                        <div>
                          <h3
                            className="fw-bold mb-0 brand-title"
                            style={{ color: THEME.dark }}
                          >
                            Wiseway Real Estate Pvt. Ltd.
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
                            Email: accounts@wisewayrealestate.com
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
                              <tr key={i}>
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
