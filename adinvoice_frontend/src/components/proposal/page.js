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

// Templates with fully dynamic style configs
const TEMPLATES = [
  {
    id: 1,
    name: "Classic",
    file: "template_1.jpg",
    style: {
      container: { fontFamily: "Times New Roman, serif", fontSize: "14px", fontWeight: "normal", textColor: "#111111", textAlign: "left" },
      header: { color: "#e1e5eaff", fontSize: "20px", fontWeight: "bold", textAlign: "left" },
      subHeader: { color: "#dde2e8ff", fontSize: "16px", fontWeight: "bold" },
      clientInfo: { fontSize: "14px", fontWeight: "normal", textColor: "#111111" },
      tableHeader: { backgroundColor: "#f0f0f0", fontWeight: "bold", textAlign: "left", fontSize: "14px", color: "#000" },
      tableCell: { fontSize: "14px", color: "#000", textAlign: "left" },
      totals: { fontSize: "14px", fontWeight: "bold", textAlign: "right", color: "#111111" },
      notes: { fontSize: "13px", color: "#333333", textAlign: "left" },
      footer: { fontSize: "12px", color: "#555555", textAlign: "center" },
    },
  },
  {
    id: 2,
    name: "Modern",
    file: "template_2.jpg",
    style: {
      container: { fontFamily: "Arial, sans-serif", fontSize: "13px", fontWeight: "normal", textColor: "#222222", textAlign: "left" },
      header: { color: "#ff6600", fontSize: "22px", fontWeight: "bold", textAlign: "center" },
      subHeader: { color: "#ff6600", fontSize: "16px", fontWeight: "bold" },
      clientInfo: { fontSize: "13px", fontWeight: "normal", textColor: "#222222" },
      tableHeader: { backgroundColor: "#e0f7fa", fontWeight: "bold", textAlign: "center", fontSize: "14px", color: "#222" },
      tableCell: { fontSize: "13px", color: "#222", textAlign: "center" },
      totals: { fontSize: "14px", fontWeight: "bold", textAlign: "right", color: "#222" },
      notes: { fontSize: "13px", color: "#444444", textAlign: "left" },
      footer: { fontSize: "12px", color: "#333333", textAlign: "center" },
    },
  },
  {
    id: 3,
    name: "Professional",
    file: "template_3.jpg",
    style: {
      container: { fontFamily: "Verdana, sans-serif", fontSize: "15px", fontWeight: "normal", textColor: "#000000", textAlign: "right" },
      header: { color: "#0000cc", fontSize: "22px", fontWeight: "bold", textAlign: "right" },
      subHeader: { color: "#0000cc", fontSize: "16px", fontWeight: "bold" },
      clientInfo: { fontSize: "14px", fontWeight: "normal", textColor: "#000000" },
      tableHeader: { backgroundColor: "#f9f9f9", fontWeight: "bold", textAlign: "right", fontSize: "14px", color: "#000" },
      tableCell: { fontSize: "14px", color: "#000", textAlign: "right" },
      totals: { fontSize: "14px", fontWeight: "bold", textAlign: "right", color: "#000000" },
      notes: { fontSize: "13px", color: "#666666", textAlign: "right" },
      footer: { fontSize: "11px", color: "#666666", textAlign: "center" },
    },
  },
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

  const addItem = (item) => setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { ...item, qty: 1 }] });
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

  const subtotal = invoiceData.items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const downloadInvoice = async () => {
    const element = document.getElementById("invoice-preview");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save(`${invoiceData.invoiceNumber}.pdf`);
  };

  const style = invoiceData.template.style;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#e9ecef" }}>
      {/* Sidebar */}
      <div className="border-end p-3" style={{ width: 220 }}>
        <h5>Products</h5>
        {PRODUCTS.map((p) => (
          <button key={p.id} className="btn btn-outline-success w-100 mb-2" onClick={() => addItem(p)}>
            {p.name} - ${p.price}
          </button>
        ))}
        <h5>Services</h5>
        {SERVICES.map((s) => (
          <button key={s.id} className="btn btn-outline-info w-100 mb-2" onClick={() => addItem(s)}>
            {s.name} - ${s.price}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Client Form */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Client Name</label>
            <input type="text" className="form-control" value={invoiceData.clientName} onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}/>
          </div>
          <div className="col-md-6">
            <label className="form-label">Client Email</label>
            <input type="email" className="form-control" value={invoiceData.clientEmail} onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}/>
          </div>
        </div>

        {/* Items Table (edit) */}
        <div className="table-responsive mb-3">
          <table className="table table-bordered align-middle">
            <thead style={{ ...style.tableHeader }}>
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
                  <td style={style.tableCell}>{item.name}</td>
                  <td style={style.tableCell}>{item.description}</td>
                  <td style={style.tableCell}><input type="number" className="form-control" value={item.qty} onChange={(e) => updateItem(index, "qty", e.target.value)} /></td>
                  <td style={style.tableCell}><input type="number" className="form-control" value={item.price} onChange={(e) => updateItem(index, "price", e.target.value)} /></td>
                  <td style={style.tableCell}>{(item.qty * item.price).toFixed(2)}</td>
                  <td><button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Invoice Preview */}
        <div
          id="invoice-preview"
          style={{
            border: "1px solid #ccc",
            width: "794px",
            height: "1123px",
            margin: "0 auto",
            backgroundImage: `url(/proposal-templates/${invoiceData.template.file})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            padding: "40px",
            fontFamily: style.container.fontFamily,
            fontSize: style.container.fontSize,
            fontWeight: style.container.fontWeight,
            color: style.container.textColor,
            textAlign: style.container.textAlign,
            position: "relative",
          }}
        >
          {/* Company Info */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={style.header}>{invoiceData.companyName}</h3>
              <p style={style.clientInfo}>{invoiceData.companyAddress}</p>
              <p style={style.clientInfo}>{invoiceData.companyPhone} | {invoiceData.companyEmail}</p>
            </div>
            <div style={{ textAlign: style.header.textAlign }}>
              <h4 style={style.subHeader}>Invoice</h4>
              <p style={style.clientInfo}>Invoice #: {invoiceData.invoiceNumber}</p>
              <p style={style.clientInfo}>Date: {invoiceData.date}</p>
              {invoiceData.dueDate && <p style={style.clientInfo}>Due: {invoiceData.dueDate}</p>}
              <p style={style.clientInfo}>Payment Terms: {invoiceData.paymentTerms}</p>
            </div>
          </div>

          {/* Client Info */}
          <div style={{ marginTop: "30px" }}>
            <h5 style={style.subHeader}>Bill To:</h5>
            <p style={style.clientInfo}>{invoiceData.clientName}</p>
            <p style={style.clientInfo}>{invoiceData.clientAddress}</p>
            <p style={style.clientInfo}>{invoiceData.clientPhone}</p>
            <p style={style.clientInfo}>{invoiceData.clientEmail}</p>
          </div>

          {/* Items Table (preview) */}
          <div style={{ marginTop: "30px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={style.tableHeader}>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>Item</th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>Description</th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>Qty</th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>Price</th>
                  <th style={{ padding: "8px", border: "1px solid #ccc" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f5f5f5", ...style.tableCell }}>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.name}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{item.description}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{item.qty}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "right" }}>${item.price.toFixed(2)}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "right" }}>${(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Notes */}
          <div style={{ marginTop: "20px", ...style.totals }}>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax (10%): ${tax.toFixed(2)}</p>
            <h4>Total: ${total.toFixed(2)}</h4>
          </div>
          <div style={{ marginTop: "40px", ...style.notes }}>
            <p>{invoiceData.notes || "Notes or Terms go here..."}</p>
          </div>

          {/* Footer */}
          <div style={{ position: "absolute", bottom: "30px", left: 0, right: 0, ...style.footer }}>
            <p>Thank you for your business!</p>
          </div>
        </div>

        {/* Template Selection */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-3 mt-3">
          {TEMPLATES.map((t) => (
            <button key={t.id} className={`btn ${invoiceData.template.id === t.id ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setInvoiceData({ ...invoiceData, template: t })}>
              {t.name}
            </button>
          ))}
        </div>

        {/* Download Button */}
        <div className="text-center">
          <button className="btn btn-success" onClick={downloadInvoice}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}
