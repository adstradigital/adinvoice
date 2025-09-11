"use client";
import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function InvoicePreview({ onBack }) {
  const [invoiceData] = useState({
    invoiceNumber: "INV-001",
    clientName: "John Doe",
    amount: 1500,
    items: [
      { name: "Design", description: "Logo design service", amount: 500 },
      { name: "Development", description: "Website build", amount: 1000 },
    ],
  });

  const downloadPDF = async () => {
    try {
      const existingPdfBytes = await fetch(
        "/assets/templates/blanktemplate1.pdf"
      ).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      firstPage.drawText(`Invoice #: ${invoiceData.invoiceNumber}`, {
        x: 50,
        y: height - 100,
        size: 14,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`Client: ${invoiceData.clientName}`, {
        x: 50,
        y: height - 130,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`Amount: INR ${invoiceData.amount}`, {
        x: 50,
        y: height - 160,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });

      invoiceData.items.forEach((item, index) => {
        firstPage.drawText(
          `${item.name} - ${item.description} - INR ${item.amount}`,
          {
            x: 50,
            y: height - 200 - index * 20,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          }
        );
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${invoiceData.invoiceNumber}.pdf`;
      link.click();
    } catch (err) {
      console.error("❌ Error generating PDF:", err);
    }
  };

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/* PDF Preview */}
      <div className="flex-grow-1 position-relative p-3">
        <embed
          src="/assets/templates/blanktemplate1.pdf#zoom=page-width"
          type="application/pdf"
          className="w-100 h-100 border shadow"
          style={{ borderRadius: "6px" }}
        />

        {/* Overlay Card */}
        <div
          className="card shadow position-absolute p-3"
          style={{
            top: "190px",
            left: "400px",
            maxWidth: "400px",
            opacity: 0.95,
          }}
        >
          <div className="card-body p-3">
            <h5 className="card-title mb-3">Invoice Preview</h5>
            <p className="mb-1"><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</p>
            <p className="mb-1"><strong>Client:</strong> {invoiceData.clientName}</p>
            <p className="mb-3"><strong>Amount:</strong> ₹{invoiceData.amount}</p>

            {/* Items Table */}
            <table className="table table-sm table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td className="text-end">₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="d-flex justify-content-end p-3 border-top bg-white shadow-sm">
        <button
          className="btn btn-secondary me-2"
          onClick={onBack}
        >
          🔙 Back
        </button>
        <button
          className="btn btn-primary"
          onClick={downloadPDF}
        >
          📥 Download PDF
        </button>
      </div>
    </div>
  );
}
