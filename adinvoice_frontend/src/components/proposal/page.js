"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Products and Services
const PRODUCTS = [
  { id: 1, name: "Web Design", price: 500, description: "Website design services" },
  { id: 2, name: "SEO Optimization", price: 300, description: "Search engine optimization" },
  { id: 3, name: "Logo Design", price: 150, description: "Logo design services" },
];

const SERVICES = [
  { id: 1, name: "Consulting", price: 100, description: "Business consulting" },
  { id: 2, name: "Maintenance", price: 200, description: "Website maintenance" },
];

// Templates (must be stored in public/proposal-templates/)
const TEMPLATES = [
  { id: 1, name: "Classic", file: "template_1.jpg" },
  { id: 2, name: "Modern", file: "template_2.jpg" },
  { id: 3, name: "Professional", file: "template_3.jpg" },
];

export default function ProposalGenerator() {
  const [invoiceData, setInvoiceData] = useState({
    companyName: "Your Company Name",
    companyAddress: "123 Business Rd, City, Country",
    companyPhone: "+123456789",
    companyEmail: "info@company.com",
    clientName: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    invoiceNumber: "INV-001",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentTerms: "Net 30",
    items: [],
    notes: "",
    template: TEMPLATES[0],
  });

  // Add / remove / update items
  const addItem = (item) => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { ...item, qty: 1 }],
    });
  };

  const removeItem = (index) => {
    const newItems = [...invoiceData.items];
    newItems.splice(index, 1);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const updateItem = (index, key, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][key] = key === "qty" ? parseInt(value) : parseFloat(value);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  // Calculate totals
  const subtotal = invoiceData.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Download PDF
  const downloadInvoice = async () => {
    const element = document.getElementById("invoice-preview");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${invoiceData.invoiceNumber}.pdf`);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#e9ecef" }}>
      {/* Sidebar */}
      <div className="border-end p-3" style={{ width: 220 }}>
        <h5>Products</h5>
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            className="btn btn-outline-success w-100 mb-2"
            onClick={() => addItem(p)}
          >
            {p.name} - ${p.price}
          </button>
        ))}
        <h5>Services</h5>
        {SERVICES.map((s) => (
          <button
            key={s.id}
            className="btn btn-outline-info w-100 mb-2"
            onClick={() => addItem(s)}
          >
            {s.name} - ${s.price}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Invoice Form */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Client Name</label>
            <input
              type="text"
              className="form-control"
              value={invoiceData.clientName}
              onChange={(e) =>
                setInvoiceData({ ...invoiceData, clientName: e.target.value })
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Client Email</label>
            <input
              type="email"
              className="form-control"
              value={invoiceData.clientEmail}
              onChange={(e) =>
                setInvoiceData({ ...invoiceData, clientEmail: e.target.value })
              }
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Client Address</label>
            <input
              type="text"
              className="form-control"
              value={invoiceData.clientAddress}
              onChange={(e) =>
                setInvoiceData({ ...invoiceData, clientAddress: e.target.value })
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Client Phone</label>
            <input
              type="text"
              className="form-control"
              value={invoiceData.clientPhone}
              onChange={(e) =>
                setInvoiceData({ ...invoiceData, clientPhone: e.target.value })
              }
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="table-responsive mb-3">
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", e.target.value)}
                    />
                  </td>
                  <td>{(item.qty * item.price).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="mb-3">
          <label className="form-label">Notes / Terms</label>
          <textarea
            className="form-control"
            rows="3"
            value={invoiceData.notes}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, notes: e.target.value })
            }
          ></textarea>
        </div>

        {/* Live Invoice Preview */}
        <div
          id="invoice-preview"
          className="mb-3"
          style={{
            border: "1px solid #ccc",
            width: "794px", // A4 width in px
            height: "1123px", // A4 height in px
            margin: "0 auto",
            backgroundImage: `url(/proposal-templates/${invoiceData.template.file})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "relative",
            color: "#000",
            fontFamily: "Arial, sans-serif",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            overflow: "hidden",
            padding: "40px",
          }}
        >
          {/* Company Info */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>{invoiceData.companyName}</h3>
              <p>{invoiceData.companyAddress}</p>
              <p>{invoiceData.companyPhone} | {invoiceData.companyEmail}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h4>Invoice</h4>
              <p>Invoice #: {invoiceData.invoiceNumber}</p>
              <p>Date: {invoiceData.date}</p>
              {invoiceData.dueDate && <p>Due: {invoiceData.dueDate}</p>}
              <p>Payment Terms: {invoiceData.paymentTerms}</p>
            </div>
          </div>

          {/* Client Info */}
          <div style={{ marginTop: "30px" }}>
            <h5>Bill To:</h5>
            <p>{invoiceData.clientName}</p>
            <p>{invoiceData.clientAddress}</p>
            <p>{invoiceData.clientPhone}</p>
            <p>{invoiceData.clientEmail}</p>
          </div>

          {/* Items Table */}
          <div style={{ marginTop: "30px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #000", textAlign: "left" }}>Item</th>
                  <th style={{ borderBottom: "1px solid #000", textAlign: "left" }}>Description</th>
                  <th style={{ borderBottom: "1px solid #000", textAlign: "right" }}>Qty</th>
                  <th style={{ borderBottom: "1px solid #000", textAlign: "right" }}>Unit Price</th>
                  <th style={{ borderBottom: "1px solid #000", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td style={{ textAlign: "right" }}>{item.qty}</td>
                    <td style={{ textAlign: "right" }}>${item.price.toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>${(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax (10%): ${tax.toFixed(2)}</p>
            <h4>Total: ${total.toFixed(2)}</h4>
          </div>

          {/* Notes / Terms */}
          <div style={{ position: "absolute", bottom: "80px", left: "30px", right: "30px" }}>
            <p>{invoiceData.notes || "Notes or Terms go here..."}</p>
          </div>

          {/* Footer */}
          <div style={{ position: "absolute", bottom: "30px", left: "30px", right: "30px", textAlign: "center", fontSize: "12px", color: "#555" }}>
            <p>Thank you for your business!</p>
          </div>
        </div>

        {/* Template Selection */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-3 mt-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`btn ${invoiceData.template.id === t.id ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setInvoiceData({ ...invoiceData, template: t })}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Download Button */}
        <div className="text-center">
          <button className="btn btn-success" onClick={downloadInvoice}>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
