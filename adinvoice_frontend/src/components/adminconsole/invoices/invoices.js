"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getClientsCompanies,
  getProposalsByClient,
  getProposalItems,
  saveInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
} from "../../../../Api/api_clientadmin";

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
  const [selectedProposalData, setSelectedProposalData] = useState(null);
  
  // ✅ INVOICE STATUS STATE
  const [invoiceStatus, setInvoiceStatus] = useState('draft');
  
  // ✅ DRAFT INVOICES STATE
  const [draftInvoices, setDraftInvoices] = useState([]);
  
  // ✅ PRINT-RELATED STATES
  const [printOptions, setPrintOptions] = useState({
    showPrices: true,
    includeNotes: true,
    includeTerms: true,
    includeBankDetails: true,
    showSignature: true,
    paperSize: 'a4'
  });
  
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // ✅ EDIT INVOICE STATES
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // ✅ DEBUG FUNCTION FOR SAVE BUTTON
  const debugSaveButton = () => {
    console.group("🔍 DEBUG SAVE BUTTON STATUS");
    console.log("editingInvoice:", editingInvoice);
    console.log("loading:", loading);
    console.log("selectedProposal:", selectedProposal);
    console.log("selectedClient:", selectedClient);
    console.log("invoiceItems.length:", invoiceItems.length);
    console.log("previewMode:", previewMode);
    
    const conditions = {
      hasSelectedClient: !!selectedClient,
      hasSelectedProposal: !!selectedProposal,
      hasInvoiceItems: invoiceItems.length > 0,
      isNotLoading: !loading,
      isInPreviewMode: previewMode
    };
    
    console.log("Button Conditions:", conditions);
    
    const isDisabled = loading || invoiceItems.length === 0 || (!editingInvoice && !selectedProposal);
    console.log("Button Disabled:", isDisabled);
    console.groupEnd();
    
    return conditions;
  };

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

  // ✅ FETCH DRAFT INVOICES
  const fetchDraftInvoices = async () => {
    try {
      const invoicesData = await getInvoices();
      if (invoicesData && invoicesData.invoices) {
        const drafts = invoicesData.invoices.filter(invoice => invoice.status === 'draft');
        setDraftInvoices(drafts);
        console.log("📋 Draft invoices loaded:", drafts.length);
      }
    } catch (err) {
      console.error("❌ Error fetching draft invoices:", err);
    }
  };

  // ✅ FIXED: LOAD INVOICE FOR EDITING - IMPROVED VERSION
  const loadInvoiceForEditing = async (invoiceId) => {
  setLoading(true);
  setError("");
  
  try {
    console.log("📝 Loading invoice for editing:", invoiceId);
    
    const invoiceData = await getInvoiceById(invoiceId);
    console.log("📝 Invoice data loaded:", invoiceData);
    
    if (invoiceData && invoiceData.invoice) {
      const invoice = invoiceData.invoice;
      
      // Set editing state FIRST
      setEditingInvoice(invoice.id);
      
      // Set basic invoice info
      setInvoiceNumber(invoice.invoice_number || "");
      setInvoiceDate(invoice.issue_date || new Date().toISOString().split('T')[0]);
      setDueDate(invoice.due_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setInvoiceStatus(invoice.status || 'draft');
      setTemplate(invoice.template_used || 'saffron');
      
      // ✅ Load items
      if (invoice.items && invoice.items.length > 0) {
        console.log("📝 Using invoice items from database:", invoice.items);
        const transformedItems = invoice.items.map((item, index) => ({
          id: item.id || `invoice-item-${index}`,
          description: item.description || "Service Item",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || Number(item.unit_price) || 0,
          gst: Number(item.gst_rate) || Number(item.gst) || 18,
          unit: item.unit || "pc",
          item_type: item.item_type || "service",
        }));
        setInvoiceItems(transformedItems);
      }
      
      // ✅ CRITICAL FIX: Set client and proposal IMMEDIATELY from invoice data
      if (invoice.client) {
        console.log("👤 Setting client from invoice:", invoice.client);
        setSelectedClient(invoice.client.toString());
      }
      
      if (invoice.proposal_id) {
        console.log("📄 Setting proposal from invoice:", invoice.proposal_id);
        setSelectedProposal(invoice.proposal_id.toString());
      }
      
      // Load proposals in background for the dropdown (optional)
      if (invoice.client) {
        setTimeout(async () => {
          await fetchProposals(invoice.client.toString());
          console.log("✅ Proposals loaded for dropdown");
        }, 100);
      }
      
      setPreviewMode(false);
      setError(`✅ Editing invoice: ${invoice.invoice_number}`);
      console.log("✅ Invoice loaded for editing successfully");
      
    } else {
      throw new Error("Invalid invoice data received");
    }
    
  } catch (err) {
    console.error("❌ Error loading invoice for editing:", err);
    setError("Failed to load invoice for editing. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // ✅ CANCEL EDITING
  const cancelEditing = () => {
    setEditingInvoice(null);
    setInvoiceNumber("");
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setSelectedClient("");
    setSelectedProposal("");
    setInvoiceItems([]);
    setPreviewMode(false);
    setError("");
    console.log("❌ Editing cancelled");
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

  const fetchInvoiceItems = async (proposalId) => {
    if (!proposalId) {
      setInvoiceItems([]);
      setSelectedProposalData(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("📦 Fetching items for proposal:", proposalId);

      // Find the selected proposal data
      const proposal = proposals.find(p => p.id == proposalId);
      if (proposal) {
        setSelectedProposalData(proposal.fullData);
      }

      // ✅ Use the fixed API function
      const itemsData = await getProposalItems(proposalId);
      console.log("📦 Items data received:", itemsData);

      if (itemsData && itemsData.length > 0) {
        // Transform API response to match expected format
        const transformedItems = itemsData.map((item) => ({
          id: item.id,
          description: item.description || item.name || "Service Item",
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || Number(item.unit_price) || 0,
          gst: Number(item.gst_rate) || Number(item.gst) || 18,
          unit: item.unit || "pc",
          item_type: item.item_type || "service",
        }));

        setInvoiceItems(transformedItems);
        console.log("✅ Transformed items:", transformedItems);
        setError(""); // Clear previous errors
      } else {
        setInvoiceItems([]);
        console.log("❌ No items found for this proposal");
        setError("No items found for this proposal. You can add items manually.");
      }
    } catch (err) {
      console.error("❌ Error fetching proposal items:", err);
      
      // Provide helpful error message
      if (err.detail) {
        setError(`Failed to load items: ${err.detail}`);
      } else if (err.message) {
        setError(`Failed to load items: ${err.message}`);
      } else {
        setError("Failed to load proposal items. Please check your connection.");
      }
      
      setInvoiceItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchDraftInvoices(); // ✅ FETCH DRAFTS ON LOAD
  }, []);

  useEffect(() => {
    if (selectedClient && !editingInvoice) {
      fetchProposals(selectedClient);
      setSelectedProposal("");
      setInvoiceItems([]);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedProposal && !editingInvoice) {
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

  // ✅ FIXED SAVE/UPDATE INVOICE FUNCTION
  const handleSaveInvoice = async () => {
  // Debug first to see what's happening
  debugSaveButton();
  
  // ✅ FIXED VALIDATION: For editing, only require items and client
  if (invoiceItems.length === 0) {
    setError("Please add at least one item to the invoice");
    return;
  }

  if (!selectedClient) {
    setError("Please select a client");
    return;
  }

  // ✅ Only require proposal for NEW invoices, not for editing
  if (!editingInvoice && !selectedProposal) {
    setError("Please select a proposal for new invoices");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const client = clients.find(c => c.id == selectedClient);
    
    // Generate invoice data WITH STATUS
    const invoiceData = {
      // ✅ Use the proposal from the invoice if editing, otherwise from selection
      proposal: editingInvoice ? selectedProposal : selectedProposal,
      client: selectedClient,
      issue_date: invoiceDate,
      due_date: dueDate,
      subtotal: subtotal,
      total_gst: totalGST,
      grand_total: grandTotal,
      template_used: template,
      status: invoiceStatus,
      notes: "Thank you for your business! Payment due within 15 days.",
      terms: "Late payments may attract 2% interest per month. All disputes subject to Pune jurisdiction.",
      // Client information for record keeping
      client_name: client?.name || "Client",
      client_email: client?.email || "",
      client_phone: client?.phone || "",
      client_address: client?.address || "",
      client_gstin: client?.gstin || "",
      // Company information
      company_name: "CUBE Real Estate Pvt. Ltd.",
      company_email: "accounts@cuberealestate.com",
      company_phone: "+91 9876543210",
      company_address: "Flat No. 006, Shivam Apartment, Opp. Manipal Hospital, Pune - 411001",
      company_gstin: "27AAACC1234F1Z5",
      items: invoiceItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        gst_rate: item.gst,
        total: item.quantity * item.price * (1 + item.gst / 100),
        item_type: item.item_type || "service",
        unit: item.unit || "pc"
      }))
    };

    console.log("📤 Saving invoice data:", invoiceData);
    
    let result;
    if (editingInvoice) {
      // Update existing invoice
      result = await updateInvoice(editingInvoice, invoiceData);
    } else {
      // Create new invoice
      result = await saveInvoice(invoiceData);
    }
    
    // Show success message
    setError("");
    
    // Success alert with invoice number and status
    if (result.invoice?.invoice_number) {
      alert(`✅ Invoice ${editingInvoice ? 'updated' : 'saved'} successfully!\nInvoice Number: ${result.invoice.invoice_number}\nStatus: ${result.invoice.status}`);
      
      // ✅ REFRESH DRAFT INVOICES LIST AFTER SAVING
      fetchDraftInvoices();
      
      // If editing, reset editing state
      if (editingInvoice) {
        cancelEditing();
      }
    } else if (result.success) {
      alert(`✅ ${result.success}`);
      fetchDraftInvoices();
      if (editingInvoice) cancelEditing();
    } else {
      alert(`✅ Invoice ${editingInvoice ? 'updated' : 'saved'} successfully!`);
      fetchDraftInvoices();
      if (editingInvoice) cancelEditing();
    }
    
    console.log("✅ Invoice save result:", result);
    
  } catch (err) {
    console.error("❌ Error saving invoice:", err);
    
    // Handle specific error cases
    if (err.detail) {
      setError(`Failed to save invoice: ${err.detail}`);
    } else if (err.error) {
      setError(`Failed to save invoice: ${err.error}`);
    } else if (err.message) {
      setError(`Failed to save invoice: ${err.message}`);
    } else {
      setError("Failed to save invoice. Please check your connection and try again.");
    }
  } finally {
    setLoading(false);
  }
};

  // ✅ PRINT FUNCTIONALITY WITH BACKGROUND STYLING
  const handlePrint = (customOptions = {}) => {
    // Merge default options with any custom options
    const settings = { ...printOptions, ...customOptions };
    
    try {
      // Get the invoice preview element
      const invoiceElement = document.getElementById('invoice-preview');
      
      if (!invoiceElement) {
        setError("Invoice preview not found for printing");
        return;
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        setError("Please allow popups for printing");
        return;
      }

      // Clone the invoice element to avoid modifying the original
      const printContent = invoiceElement.cloneNode(true);
      
      // Apply conditional classes based on print options
      if (!settings.showPrices) {
        printContent.classList.add('no-prices');
      }
      if (!settings.includeTerms) {
        printContent.classList.add('no-terms');
      }
      if (!settings.includeBankDetails) {
        printContent.classList.add('no-bank-details');
      }
      if (!settings.showSignature) {
        printContent.classList.add('no-signature');
      }

      // Generate the print HTML
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${new Date().toLocaleDateString()}</title>
            <style>
              ${getPrintStyles(settings)}
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printContent.outerHTML}
            </div>
            <script>
              window.onload = function() {
                // Add delay to ensure styles are applied
                setTimeout(() => {
                  window.print();
                  // Close window after printing
                  setTimeout(() => window.close(), 1000);
                }, 500);
              }
              
              // Also handle print with keyboard/mouse
              window.onafterprint = function() {
                setTimeout(() => window.close(), 500);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
    } catch (err) {
      console.error("❌ Print error:", err);
      setError("Failed to open print window. Please try again.");
    }
  };

  // Helper function for print styles WITH BACKGROUND COLORS
  const getPrintStyles = (options) => `
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      background: white !important;
      color: black !important;
      margin: 0;
      padding: 0;
    }
    
    .print-container {
      width: 100%;
      min-height: 100vh;
    }
    
    /* Hide elements that shouldn't print */
    .no-print {
      display: none !important;
    }
    
    /* Page break controls */
    .page-break {
      page-break-after: always;
    }
    
    .avoid-break {
      page-break-inside: avoid;
    }
    
    .break-before {
      page-break-before: always;
    }
    
    /* Conditional visibility based on print options */
    ${!options.showPrices ? `
      .price-column, 
      .amount-column, 
      .totals-section,
      .col-unit,
      .col-amount,
      .totals {
        display: none !important;
      }
    ` : ''}
    
    ${!options.includeTerms ? `
      .terms-section,
      .terms-title,
      .terms-text {
        display: none !important;
      }
    ` : ''}
    
    ${!options.includeBankDetails ? `
      .bank-details,
      .bank {
        display: none !important;
      }
    ` : ''}
    
    ${!options.showSignature ? `
      .signature-section,
      .signature-wrap {
        display: none !important;
      }
    ` : ''}
    
    /* Print-specific media queries WITH BACKGROUND COLORS */
    @media print {
      @page {
        size: ${options.paperSize};
        margin: 15mm;
      }
      
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-size: 12pt;
        line-height: 1.4;
      }
      
      /* Ensure colors print correctly */
      .inv-preview {
        background: white !important;
        box-shadow: none !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Preserve background colors in print */
      .inv-preview.saffron .items thead th {
        background: #e53935 !important;
        color: white !important;
        -webkit-print-color-adjust: exact;
      }
      
      .inv-preview.saffron .brand-title {
        color: #d84315 !important;
      }
      
      .inv-preview.saffron .meta-title {
        color: #e53935 !important;
      }
      
      .inv-preview.saffron .terms-title {
        color: #e53935 !important;
      }
      
      .vertical-tag {
        color: #e53935 !important;
      }
      
      .red-rule {
        border-color: #e53935 !important;
      }
      
      /* Table styling for print */
      .table thead th {
        background: #f8f9fa !important;
        color: #000 !important;
        -webkit-print-color-adjust: exact;
      }
      
      .table-striped tbody tr:nth-of-type(odd) {
        background-color: rgba(0,0,0,.05) !important;
        -webkit-print-color-adjust: exact;
      }
      
      /* Improve table printing */
      table {
        page-break-inside: auto;
      }
      
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      
      thead {
        display: table-header-group;
      }
      
      tfoot {
        display: table-footer-group;
      }
    }
    
    /* Screen styles for print preview */
    @media screen {
      body {
        padding: 20px;
        background: #f5f5f5;
      }
      
      .print-container {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
    }
  `;

  // ✅ QUICK PRINT FUNCTION
  const handleQuickPrint = () => {
    // Simple print without options
    handlePrint();
  };

  // ✅ FIXED DOWNLOAD FUNCTION
  const handleDownload = async () => {
    try {
      const el = document.getElementById("invoice-preview");
      if (!el) {
        setError("Invoice preview not found");
        return;
      }

      // Try to import html2pdf, fallback to alternative if it fails
      let html2pdf;
      try {
        const html2pdfModule = await import('html2pdf.js');
        html2pdf = html2pdfModule.default;
      } catch (importError) {
        console.error("❌ html2pdf import failed:", importError);
        setError("PDF generation library not available. Using print instead.");
        handlePrint(); // Fallback to print
        return;
      }
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `invoice-${editingInvoice ? invoiceNumber : 'new'}-${Date.now()}.pdf`,
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
      setError("Failed to generate PDF. Please try the print option instead.");
    }
  };

  const motionCard = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <div className="container-fluid py-4">
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

        .draft-invoice-item {
          transition: all 0.2s ease;
          border-left: 3px solid #6b7280;
          cursor: pointer;
        }

        .draft-invoice-item:hover {
          background-color: #f8f9fa;
          border-left-color: #16a34a;
          transform: translateX(2px);
        }

        .draft-invoice-item.editing {
          border-left-color: #e53935;
          background-color: #fff8f8;
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

        /* Print-specific classes */
        .no-print {
          display: block;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          
          /* Ensure good print quality */
          .inv-preview {
            break-inside: avoid;
          }
          
          /* Add page breaks where needed */
          .terms {
            break-before: always;
          }
        }

        /* Conditional classes for print options */
        .no-prices .col-unit,
        .no-prices .col-amount,
        .no-prices .totals {
          display: none;
        }

        .no-terms .terms {
          display: none;
        }

        .no-bank-details .bank {
          display: none;
        }

        .no-signature .signature-wrap {
          display: none;
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

      <div className="row">
        {/* ✅ MAIN CONTENT - LEFT SIDE */}
        <div className="col-lg-8">
          {/* Debug Section */}
          <motion.div {...motionCard} className="inv-card mb-3">
            <div className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="fw-semibold mb-0" style={{ color: "#6b7280" }}>
                  Debug Save Button
                </h6>
                <button
                  className="btn btn-outline-warning btn-sm"
                  onClick={debugSaveButton}
                >
                  🔍 Check Save Status
                </button>
              </div>
              <div className="mt-2 small text-muted">
                <div>Client: {selectedClient ? "✓ Selected" : "✗ Missing"}</div>
                <div>Proposal: {selectedProposal ? "✓ Selected" : "✗ Missing"}</div>
                <div>Items: {invoiceItems.length > 0 ? `✓ ${invoiceItems.length} items` : "✗ None"}</div>
                <div>Loading: {loading ? "✓ Yes" : "✗ No"}</div>
                <div>Editing: {editingInvoice ? `✓ ${invoiceNumber}` : "✗ No"}</div>
              </div>
            </div>
          </motion.div>

          {/* Editing Banner */}
          {editingInvoice && (
            <motion.div {...motionCard} className="alert alert-info mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <i className="bi bi-pencil-square me-2"></i>
                  <strong>Editing Invoice: {invoiceNumber}</strong>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={cancelEditing}
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              </div>
            </motion.div>
          )}

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

          {/* ✅ INVOICE DATES (SHOW WHEN EDITING) */}
          {editingInvoice && (
            <motion.div {...motionCard} className="inv-card mb-3">
              <div className="p-3">
                <h6 className="fw-semibold mb-2" style={{ color: "#6b7280" }}>
                  Invoice Dates
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label small">Invoice Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

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

          {/* ✅ FIXED: Items editor - SHOW WHEN EDITING OR WHEN PROPOSAL SELECTED */}
          {(selectedProposal || editingInvoice) && !previewMode && (
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
                        <strong>No items found.</strong>
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
                        <div className="vertical-tag">
                          {editingInvoice ? invoiceNumber : `Invoice IN-001`}
                        </div>
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
                            <div>{new Date(invoiceDate).toLocaleDateString()}</div>
                            <div className="label">Invoice No</div>
                            <div>
                              {editingInvoice ? invoiceNumber : `INV-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`}
                            </div>
                            <div className="label">Due Date</div>
                            <div>
                              {new Date(dueDate).toLocaleDateString()}
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
                              {new Date(invoiceDate).toLocaleDateString()}
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
                                {editingInvoice ? invoiceNumber : `INV-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`}
                              </div>
                              <div className="small">
                                <span
                                  style={{ color: THEME.muted }}
                                  className="me-1"
                                >
                                  Date:
                                </span>
                                {new Date(invoiceDate).toLocaleDateString()}
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

                {/* ✅ FIXED ACTION BUTTONS IN PREVIEW MODE */}
                <div className="text-end mt-3 no-print">
                  <div>
                    {/* ✅ FIXED: Relaxed disabled condition for editing */}
                    <button 
                     className="btn btn-success me-2"
                     onClick={handleSaveInvoice}
                       disabled={
                       loading || 
                        invoiceItems.length === 0 || 
                          !selectedClient ||  // Client is always required
                           (!editingInvoice && !selectedProposal) // Proposal only required for NEW invoices
                                    }
                           title={
                            loading ? "Loading..." :
                             invoiceItems.length === 0 ? "Add at least one item" :
                             !selectedClient ? "Select a client" :
                              !selectedProposal && !editingInvoice ? "Select a proposal" :
                                     "Ready to save"
                                       }
                                     >
                                    {loading ? (
                                  <>
                                   <span className="spinner-border spinner-border-sm me-2" role="status">
                                   <span className="visually-hidden">Saving...</span>
                                   </span>
                                   {editingInvoice ? 'Updating...' : 'Saving...'}
                                     </>
                                      ) : (
                                     editingInvoice ? '💾 Update Invoice' : '💾 Save Invoice'
                                                    )}
                    </button>

                    {/* ✅ STATUS SELECTOR */}
                    <div className="d-inline-block me-2">
                      <select
                        className="form-select"
                        value={invoiceStatus}
                        onChange={(e) => setInvoiceStatus(e.target.value)}
                        disabled={loading}
                        style={{ width: 'auto', display: 'inline-block' }}
                      >
                        <option value="draft">📝 Draft</option>
                        <option value="sent">📤 Sent</option>
                        <option value="paid">✅ Paid</option>
                        <option value="overdue">⚠️ Overdue</option>
                        <option value="cancelled">❌ Cancelled</option>
                        <option value="partially_paid">💰 Partially Paid</option>
                      </select>
                    </div>

                    <button 
                      className="btn btn-primary me-2"
                      onClick={() => setShowPrintDialog(true)}
                    >
                      🖨 Print Options
                    </button>

                    <button 
                      className="btn btn-info me-2"
                      onClick={handleQuickPrint}
                    >
                      ⚡ Quick Print
                    </button>

                    {/* ✅ FIXED DOWNLOAD BUTTON */}
                    <button 
                      className="btn btn-danger me-2" 
                      onClick={handleDownload}
                      disabled={loading}
                    >
                      ⬇ Download PDF
                    </button>
                    
                    <button
                      className="btn btn-outline-dark"
                      onClick={() => setPreviewMode(false)}
                    >
                      ✏ Edit Invoice
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ✅ DRAFT INVOICES PANEL - RIGHT SIDE */}
        <div className="col-lg-4">
          <motion.div {...motionCard} className="inv-card sticky-top" style={{ top: '20px' }}>
            <div className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0" style={{ color: "#6b7280" }}>
                  📋 Draft Invoices ({draftInvoices.length})
                </h6>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={fetchDraftInvoices}
                  disabled={loading}
                  title="Refresh drafts"
                >
                  🔄
                </button>
              </div>

              {draftInvoices.length > 0 ? (
                <div className="draft-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {draftInvoices.map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className={`draft-invoice-item p-3 mb-2 rounded border ${editingInvoice === invoice.id ? 'editing' : ''}`}
                      onClick={() => loadInvoiceForEditing(invoice.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong className="text-dark">{invoice.invoice_number}</strong>
                        <span className="badge bg-warning text-dark">Draft</span>
                      </div>
                      <div className="small text-muted mb-1">
                        {invoice.client_name}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">{formatINR(invoice.grand_total)}</span>
                        <span className="small text-muted">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {invoice.proposal_title && (
                        <div className="small text-muted mt-1">
                          Proposal: {invoice.proposal_title}
                        </div>
                      )}
                      {editingInvoice === invoice.id && (
                        <div className="small text-success mt-1">
                          <i className="bi bi-pencil-square me-1"></i>
                          Currently editing
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-muted mb-2">
                    <i className="bi bi-file-earmark-text" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <p className="text-muted small mb-0">No draft invoices found</p>
                  <p className="text-muted small">Create and save invoices as drafts to see them here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ✅ PRINT OPTIONS MODAL */}
      <AnimatePresence>
        {showPrintDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">🖨 Print Options</h5>
                  <button 
                    type="button" 
                    className="btn-close"
                    onClick={() => setShowPrintDialog(false)}
                  ></button>
                </div>
                
                <div className="modal-body">
                  <div className="row">
                    <div className="col-12">
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="showPrices"
                          checked={printOptions.showPrices}
                          onChange={(e) => setPrintOptions({
                            ...printOptions,
                            showPrices: e.target.checked
                          })}
                        />
                        <label className="form-check-label" htmlFor="showPrices">
                          Show Prices & Amounts
                        </label>
                      </div>
                      
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="includeTerms"
                          checked={printOptions.includeTerms}
                          onChange={(e) => setPrintOptions({
                            ...printOptions,
                            includeTerms: e.target.checked
                          })}
                        />
                        <label className="form-check-label" htmlFor="includeTerms">
                          Include Terms & Conditions
                        </label>
                      </div>
                      
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="includeBankDetails"
                          checked={printOptions.includeBankDetails}
                          onChange={(e) => setPrintOptions({
                            ...printOptions,
                            includeBankDetails: e.target.checked
                          })}
                        />
                        <label className="form-check-label" htmlFor="includeBankDetails">
                          Include Bank Details
                        </label>
                      </div>
                      
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="showSignature"
                          checked={printOptions.showSignature}
                          onChange={(e) => setPrintOptions({
                            ...printOptions,
                            showSignature: e.target.checked
                          })}
                        />
                        <label className="form-check-label" htmlFor="showSignature">
                          Show Signature Area
                        </label>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Paper Size</label>
                        <select
                          className="form-select"
                          value={printOptions.paperSize}
                          onChange={(e) => setPrintOptions({
                            ...printOptions,
                            paperSize: e.target.value
                          })}
                        >
                          <option value="a4">A4 (210mm × 297mm)</option>
                          <option value="letter">Letter (8.5" × 11")</option>
                          <option value="a5">A5 (148mm × 210mm)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPrintDialog(false)}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      handlePrint();
                      setShowPrintDialog(false);
                    }}
                  >
                    🖨 Print with Options
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleQuickPrint}
                  >
                    ⚡ Quick Print
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}