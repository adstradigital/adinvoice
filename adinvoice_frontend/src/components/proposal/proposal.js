"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Loader2, RefreshCw, Search, UserPlus, Building, Edit, Save, FileText, List, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Import your existing API functions
import { 
  getProductsServices, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  getClientsCompanies,
  addClientCompany,
  getOwnCompanyDetails,
  updateCompanyDetails,
  uploadDocument,
  saveProposal,
  getProposals,
  updateProposal,
  deleteProposal
} from "./../../../Api/index";

// Helper function to handle address objects
const renderAddress = (address) => {
  if (!address) return '';
  
  if (typeof address === 'object') {
    // Handle address object with line1, line2, city, state, country, pincode
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.country,
      address.pincode
    ].filter(part => part && part !== 'null' && part !== 'undefined');
    
    return parts.join(', ');
  }
  
  return address;
};

// API Service Functions - Connected to your Django backend
const apiService = {
  products: {
    async getAll() {
      try {
        const products = await getProductsServices();
        // Transform data to match your component's expected format
        const productItems = products
          .filter(item => item.type === "product" || !item.type)
          .map(item => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.unit_price) || 0,
            description: item.description || "",
            type: item.type || "product"
          }));
        return { products: productItems };
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },

    async create(productData) {
      try {
        const apiData = {
          name: productData.name,
          description: productData.description,
          unit_price: productData.price.toString(),
          type: "product"
        };
        const newProduct = await addProduct(apiData);
        return {
          id: newProduct.id,
          name: newProduct.name,
          price: parseFloat(newProduct.unit_price) || 0,
          description: newProduct.description || "",
          type: newProduct.type || "product"
        };
      } catch (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    },

    async delete(id) {
      try {
        await deleteProduct(id);
        return { success: true };
      } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    }
  },

  services: {
    async getAll() {
      try {
        const services = await getProductsServices();
        const serviceItems = services
          .filter(item => item.type === "service")
          .map(item => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.unit_price) || 0,
            description: item.description || "",
            type: "service"
          }));
        return { services: serviceItems };
      } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
    },

    async create(serviceData) {
      try {
        const apiData = {
          name: serviceData.name,
          description: serviceData.description,
          unit_price: serviceData.price.toString(),
          type: "service"
        };
        const newService = await addProduct(apiData);
        return {
          id: newService.id,
          name: newService.name,
          price: parseFloat(newService.unit_price) || 0,
          description: newService.description || "",
          type: newService.type || "service"
        };
      } catch (error) {
        console.error('Error creating service:', error);
        throw error;
      }
    },

    async delete(id) {
      try {
        await deleteProduct(id);
        return { success: true };
      } catch (error) {
        console.error('Error deleting service:', error);
        throw error;
      }
    }
  },

  // Clients API - Enhanced with proper data transformation
  clients: {
    async getAll() {
      try {
        const clients = await getClientsCompanies();
        
        console.log('Raw API Response:', clients); // Debug log
        
        // Handle different response formats
        let clientsArray = [];
        
        if (Array.isArray(clients)) {
          clientsArray = clients;
        } else if (clients && Array.isArray(clients.results)) {
          clientsArray = clients.results; // Handle paginated responses
        } else if (clients && Array.isArray(clients.items)) {
          clientsArray = clients.items; // Handle items format
        } else if (clients && typeof clients === 'object') {
          // If it's a single object, wrap in array
          clientsArray = [clients];
        }
        
        // Transform data - map API fields to invoice format
        const transformedClients = clientsArray.map(client => {
          // Extract basic information with fallbacks
          const transformed = {
            id: client.id || client.client_id,
            name: client.company_name || client.name || client.business_name || 'Unnamed Client',
            email: client.email || client.contact_email || '',
            phone: client.phone || client.contact_phone || client.phone_number || '',
            address: this.extractAddress(client),
            contact_person: client.contact_person || client.primary_contact || '',
            tax_id: client.tax_id || client.tax_number || client.vat_number || '',
            status: client.status || client.is_active !== false ? 'active' : 'inactive',
            
            // Keep original data for reference
            _original: client
          };
          
          return transformed;
        }).filter(client => client.name !== 'Unnamed Client'); // Filter out invalid clients
        
        return { clients: transformedClients };
      } catch (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
    },

    // Helper method to extract address from various field names
    extractAddress(client) {
      // First, check if address is directly available as object
      if (client.address && typeof client.address === 'object') {
        return this.formatAddressObject(client.address);
      }
      
      // Check other address fields
      const addressFields = [
        'address', 'billing_address', 'company_address', 
        'street_address', 'physical_address', 'location'
      ];
      
      for (const field of addressFields) {
        if (client[field]) {
          if (typeof client[field] === 'object') {
            return this.formatAddressObject(client[field]);
          }
          return client[field];
        }
      }
      
      // Build from components
      const addressParts = [
        client.address_line_1,
        client.address_line_2, 
        client.city,
        client.state,
        client.country,
        client.pincode || client.postal_code
      ].filter(part => part);
      
      return addressParts.length > 0 ? addressParts.join(', ') : '';
    },

    formatAddressObject(addressObj) {
      if (!addressObj) return '';
      
      const addressParts = [
        addressObj.line1,
        addressObj.line2,
        addressObj.city,
        addressObj.state,
        addressObj.country,
        addressObj.pincode || addressObj.postal_code
      ].filter(part => part && part !== 'null' && part !== 'undefined');
      
      return addressParts.join(', ');
    },

    async search(searchTerm) {
      try {
        const clientsData = await this.getAll();
        const clients = clientsData.clients || [];
        
        const filteredClients = clients.filter(client => 
          client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phone?.includes(searchTerm)
        );
        
        return { clients: filteredClients };
      } catch (error) {
        console.error('Error searching clients:', error);
        throw error;
      }
    },

    // FIXED: Create new client from invoice form
    async createFromInvoice(clientData) {
      try {
        // Get tenant ID from localStorage
        const tenantId = localStorage.getItem("tenant_id");
        console.log('🔍 Tenant ID from localStorage:', tenantId);
        
        if (!tenantId) {
          throw new Error("Tenant ID not found. Please login again.");
        }

        // Create proper FormData object
        const formData = new FormData();
        
        // Map invoice fields to API fields - using the correct field names from your client company form
        formData.append('name', clientData.clientName || '');
        formData.append('contact', clientData.clientName || ''); // Use client name as contact person
        formData.append('email', clientData.clientEmail || '');
        formData.append('phone', clientData.clientPhone || '');
        formData.append('address_line1', clientData.clientAddress || '');
        formData.append('tenant', tenantId); // ✅ CRITICAL: Add tenant ID
        
        // Add optional fields with empty defaults to match your API expectations
        formData.append('industry', '');
        formData.append('website', '');
        formData.append('registration_number', '');
        formData.append('tax_id', '');
        formData.append('city', '');
        formData.append('state', '');
        formData.append('country', '');
        formData.append('postal_code', '');
        formData.append('support_email', '');
        formData.append('notes', '');

        console.log('📦 FormData contents for client creation:');
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }

        const newClient = await addClientCompany(formData);
        console.log('✅ Client created successfully:', newClient);
        
        // Transform the response to match our expected format
        return {
          id: newClient.id,
          name: newClient.name || newClient.company_name || clientData.clientName,
          email: newClient.email || clientData.clientEmail,
          phone: newClient.phone || clientData.clientPhone || '',
          address: newClient.address_line1 || newClient.address || clientData.clientAddress || '',
          contact_person: newClient.contact || newClient.contact_person || clientData.clientName,
          tax_id: newClient.tax_id || '',
          status: newClient.is_active !== false ? 'active' : 'inactive',
          _original: newClient
        };
      } catch (error) {
        console.error('❌ Error creating client:', error);
        
        // Enhanced error handling
        let errorMessage = 'Failed to create client';
        if (error.response) {
          errorMessage = error.response.data?.detail || 
                        error.response.data?.message || 
                        JSON.stringify(error.response.data);
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }
    },

    // Transform single client data
    transformClientData(client) {
      return {
        id: client.id,
        name: client.company_name || client.name,
        email: client.email,
        phone: client.phone || '',
        address: client.address || client.billing_address || '',
        contact_person: client.contact_person || '',
        tax_id: client.tax_id || '',
        status: client.status || 'active',
        _original: client
      };
    }
  },

  // Own Company API Integration
  company: {
    async getDetails() {
      try {
        const companyData = await getOwnCompanyDetails();
        
        console.log('Raw Company API Response:', companyData); // Debug log
        
        // Transform data based on your API response
        return {
          // Essential Invoice Fields
          companyName: this.extractCompanyName(companyData),
          companyEmail: companyData.email || "info@company.com",
          companyPhone: companyData.phone || "+123456789",
          alternatePhone: companyData.alternate_phone || companyData.alternate_phone || "",
          companyAddress: this.formatCompanyAddress(companyData),
          website: companyData.website || "",
          
          // Additional Business Info (for settings)
          designation: companyData.designation || "",
          industry: companyData.industry || "",
          experience: companyData.experience_years || companyData.experience || 0,
          dateOfBirth: companyData.date_of_birth || companyData.dob || "",
          linkedin: companyData.linkedin || companyData.linkedin_profile || "",
          twitter: companyData.twitter || companyData.twitter_profile || "",
          
          // Default values for missing fields
          taxId: companyData.tax_id || companyData.vat_number || "",
          currency: companyData.currency || "USD",
          paymentTerms: companyData.payment_terms || "Net 30",
          companyLogo: companyData.logo || companyData.logo_url || null,
          
          // Keep original data
          _original: companyData
        };
      } catch (error) {
        console.error('Error fetching company details:', error);
        return this.getDefaultCompanyData();
      }
    },

    // Helper to extract company name (since it shows "--" in your response)
    extractCompanyName(companyData) {
      // Try different field names for company name
      const nameFields = [
        'company_name', 'business_name', 'name', 
        'organization', 'firm_name', 'enterprise_name'
      ];
      
      for (const field of nameFields) {
        if (companyData[field] && companyData[field] !== "--" && companyData[field] !== "-") {
          return companyData[field];
        }
      }
      
      // If no valid name found, use email username or default
      if (companyData.email) {
        const username = companyData.email.split('@')[0];
        return username.charAt(0).toUpperCase() + username.slice(1) + " Company";
      }
      
      return "Your Company Name";
    },

    async updateDetails(companyData) {
      try {
        // Transform invoice data to API format
        const apiData = {
          company_name: companyData.companyName,
          email: companyData.companyEmail,
          phone: companyData.companyPhone,
          alternate_phone: companyData.alternatePhone,
          address: companyData.companyAddress,
          website: companyData.website,
          designation: companyData.designation,
          industry: companyData.industry,
          experience_years: companyData.experience,
          // Add other fields as needed
        };
        
        const updatedCompany = await updateCompanyDetails(apiData);
        return this.transformCompanyData(updatedCompany);
      } catch (error) {
        console.error('Error updating company details:', error);
        throw error;
      }
    },

    async uploadLogo(file) {
      try {
        const result = await uploadDocument(file, 'logo');
        return result.document_url || result.file_url || URL.createObjectURL(file);
      } catch (error) {
        console.error('Error uploading logo:', error);
        throw error;
      }
    },

    getDefaultCompanyData() {
      return {
        companyName: "Your Company Name",
        companyEmail: "info@company.com",
        companyPhone: "+123456789",
        alternatePhone: "",
        companyAddress: "123 Business Rd, City, Country",
        website: "",
        designation: "",
        industry: "",
        experience: 0,
        dateOfBirth: "",
        linkedin: "",
        twitter: "",
        taxId: "",
        currency: "USD",
        paymentTerms: "Net 30",
        companyLogo: null
      };
    },

    transformCompanyData(company) {
      return {
        companyName: this.extractCompanyName(company),
        companyEmail: company.email,
        companyPhone: company.phone,
        alternatePhone: company.alternate_phone,
        companyAddress: this.formatCompanyAddress(company),
        website: company.website,
        designation: company.designation,
        industry: company.industry,
        experience: company.experience_years,
        dateOfBirth: company.date_of_birth,
        linkedin: company.linkedin,
        twitter: company.twitter,
        taxId: company.tax_id,
        currency: company.currency || "USD",
        paymentTerms: company.payment_terms || "Net 30",
        companyLogo: company.logo,
        _original: company
      };
    },

    formatCompanyAddress(company) {
      if (company.address) {
        if (typeof company.address === 'object') {
          return this.formatAddressObject(company.address);
        }
        return company.address;
      }
      
      const addressParts = [
        company.address_line_1,
        company.address_line_2,
        company.city,
        company.state,
        company.country,
        company.pincode || company.postal_code
      ].filter(part => part);
      
      return addressParts.length > 0 ? addressParts.join(', ') : '123 Business Rd, City, Country';
    },

    formatAddressObject(addressObj) {
      if (!addressObj) return '';
      
      const addressParts = [
        addressObj.line1,
        addressObj.line2,
        addressObj.city,
        addressObj.state,
        addressObj.country,
        addressObj.pincode || addressObj.postal_code
      ].filter(part => part && part !== 'null' && part !== 'undefined');
      
      return addressParts.join(', ');
    }
  },

  // Proposals API Service
  proposals: {
    async getAll() {
      try {
        const proposals = await getProposals();
        return { proposals: proposals || [] };
      } catch (error) {
        console.error('Error fetching proposals:', error);
        throw error;
      }
    },

    async create(proposalData) {
      try {
        // Calculate totals
        const calculateTotals = (items) => {
          let subtotal = 0;
          let totalGst = 0;
          let grandTotal = 0;

          items.forEach(item => {
            const itemSubtotal = (item.qty || 0) * (item.price || 0);
            const itemGst = itemSubtotal * ((item.gst || 0) / 100);
            subtotal += itemSubtotal;
            totalGst += itemGst;
          });

          grandTotal = subtotal + totalGst;

          return {
            subtotal: subtotal.toFixed(2),
            totalGst: totalGst.toFixed(2),
            grandTotal: grandTotal.toFixed(2)
          };
        };

        const totals = calculateTotals(proposalData.items);

        // Transform data for API
        const apiData = {
          title: proposalData.title || `Proposal-${proposalData.invoiceNumber}`,
          proposal_number: proposalData.invoiceNumber,
          client_name: proposalData.clientName,
          client_email: proposalData.clientEmail,
          client_phone: proposalData.clientPhone,
          client_address: proposalData.clientAddress,
          company_name: proposalData.companyName,
          company_email: proposalData.companyEmail,
          company_phone: proposalData.companyPhone,
          company_address: proposalData.companyAddress,
          company_logo: proposalData.companyLogo,
          items: proposalData.items.map(item => ({
            name: item.name,
            description: item.description || '',
            quantity: item.qty || 1,
            price: item.price || 0,
            gst_rate: item.gst || 0,
            type: item.type || 'product'
          })),
          subtotal: parseFloat(totals.subtotal),
          total_gst: parseFloat(totals.totalGst),
          grand_total: parseFloat(totals.grandTotal),
          date: proposalData.date,
          due_date: proposalData.dueDate,
          notes: proposalData.notes,
          template: proposalData.template.id,
          status: 'draft',
          tenant: localStorage.getItem("tenant_id")
        };

        const newProposal = await saveProposal(apiData);
        return newProposal;
      } catch (error) {
        console.error('Error creating proposal:', error);
        throw error;
      }
    },

    async update(id, proposalData) {
      try {
        // Calculate totals
        const calculateTotals = (items) => {
          let subtotal = 0;
          let totalGst = 0;
          let grandTotal = 0;

          items.forEach(item => {
            const itemSubtotal = (item.qty || 0) * (item.price || 0);
            const itemGst = itemSubtotal * ((item.gst || 0) / 100);
            subtotal += itemSubtotal;
            totalGst += itemGst;
          });

          grandTotal = subtotal + totalGst;

          return {
            subtotal: subtotal.toFixed(2),
            totalGst: totalGst.toFixed(2),
            grandTotal: grandTotal.toFixed(2)
          };
        };

        const totals = calculateTotals(proposalData.items);

        const apiData = {
          items: proposalData.items.map(item => ({
            name: item.name,
            description: item.description || '',
            quantity: item.qty || 1,
            price: item.price || 0,
            gst_rate: item.gst || 0,
            type: item.type || 'product'
          })),
          subtotal: parseFloat(totals.subtotal),
          total_gst: parseFloat(totals.totalGst),
          grand_total: parseFloat(totals.grandTotal),
          notes: proposalData.notes,
          status: proposalData.status || 'draft',
        };

        const updatedProposal = await updateProposal(id, apiData);
        return updatedProposal;
      } catch (error) {
        console.error('Error updating proposal:', error);
        throw error;
      }
    },

    async delete(id) {
      try {
        await deleteProposal(id);
        return { success: true };
      } catch (error) {
        console.error('Error deleting proposal:', error);
        throw error;
      }
    }
  }
};

// Templates (keep your existing templates array)
const TEMPLATES = [
  {
    id: 1,
    name: "Classic",
    file: "template_1.jpg",
    style: {
      container: { fontFamily: "Times New Roman, serif", fontSize: "14px", fontWeight: "normal", textColor: "#dfdcdcff", textAlign: "left",},
      header: { color: "#b2b4b6ff", fontSize: "20px", fontWeight: "bold", textAlign: "left", },
      subHeader: { color: "#1b4496ff", fontSize: "16px", fontWeight: "bold",},
      clientInfo: { fontSize: "14px", fontWeight: "normal", textColor: "#fdf6f6ff" },
      tableHeader: { backgroundColor: "#f0f0f0", fontWeight: "bold", textAlign: "left", fontSize: "14px", color: "#000" },
      tableCell: { fontSize: "14px", color: "#000000ff", textAlign: "left" },
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
      header: { color: "#473b32ff", fontSize: "22px", fontWeight: "bold", textAlign: "center" },
      subHeader: { color: "#251d18ff", fontSize: "16px", fontWeight: "bold" },
      clientInfo: { fontSize: "13px", fontWeight: "normal", textColor: "#e9e8e8ff" },
      tableHeader: { backgroundColor: "#e0f7fa", fontWeight: "bold", textAlign: "center", fontSize: "14px", color: "#222" },
      tableCell: { fontSize: "13px", color: "#222", textAlign: "center" },
      totals: { fontSize: "14px", fontWeight: "bold", textAlign: "right", color: "#222" },
      notes: { fontSize: "13px", color: "#444444", textAlign: "left" },
      footer: { fontSize: "12px", color: "#271e09ff", textAlign: "center", marginTop:"-20px"},
    },
  },
  {
    id: 3,
    name: "Professional",
    file: "template_3.jpg",
    style: {
      container: { fontFamily: "Verdana, sans-serif", fontSize: "15px", fontWeight: "normal", textColor: "#fff8f8ff", textAlign: "right" },
      header: { color: "#ffffff", fontSize: "22px", fontWeight: "bold", textAlign: "right" },
      subHeader: { color: "#ffffff", fontSize: "16px", fontWeight: "bold" },
      clientInfo: { fontSize: "14px", fontWeight: "normal", textColor: "#ffff" },
      tableHeader: { backgroundColor: "#d4ceceff", fontWeight: "bold", textAlign: "right", fontSize: "14px", color: "#000" },
      tableCell: { fontSize: "14px", color: "#0b0a0aff", textAlign: "right" },
      totals: { fontSize: "14px", fontWeight: "bold", textAlign: "right", color: "#000000" },
      notes: { fontSize: "13px", color: "#666666", textAlign: "right" },
      footer: { fontSize: "11px", color: "#030303ff", textAlign: "center" },
    },
  },
];

// Company Settings Modal Component
const CompanySettingsModal = ({ companyDetails, onUpdate, onClose, loading, onLogoUpload }) => {
  const [formData, setFormData] = useState(companyDetails);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // File validation
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setUploadingLogo(true);
      try {
        const logoUrl = await onLogoUpload(file);
        setFormData(prev => ({ ...prev, companyLogo: logoUrl }));
        alert('Logo uploaded successfully!');
      } catch (error) {
        alert('Failed to upload logo. Please try again.');
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <Building size={20} className="me-2" />
              Company Settings
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  {/* Essential Invoice Fields */}
                  <div className="mb-3">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.companyEmail}
                      onChange={(e) => setFormData({...formData, companyEmail: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Phone *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.companyPhone}
                      onChange={(e) => setFormData({...formData, companyPhone: e.target.value})}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Alternate Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({...formData, alternatePhone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Address *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
                      placeholder="Full business address"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Website</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Industry</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      placeholder="e.g., Software, Consulting"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      placeholder="e.g., CEO, Founder"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                      min="0"
                      max="50"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">LinkedIn</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Twitter</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.twitter}
                      onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>
              </div>
              
              {/* Logo Upload */}
              <div className="mb-3">
                <label className="form-label">Company Logo</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={uploadingLogo}
                />
                <div className="form-text">
                  Recommended: Square image, max 5MB (PNG, JPG, SVG)
                  {uploadingLogo && <span className="text-warning"> • Uploading...</span>}
                </div>
                {formData.companyLogo && (
                  <div className="mt-2">
                    <img 
                      src={formData.companyLogo} 
                      alt="Company Logo" 
                      style={{ maxHeight: '80px', maxWidth: '200px' }}
                      className="border rounded p-1 bg-white"
                    />
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner me-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Proposals List Modal Component
const ProposalsModal = ({ 
  proposals, 
  loading, 
  onLoadProposal, 
  onDeleteProposal, 
  onClose 
}) => {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      onClick={onClose}
    >
      <div
        className="card shadow"
        style={{ width: "900px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
          <h5 className="mb-0">
            <FileText size={20} className="me-2" />
            Saved Proposals
          </h5>
          <button 
            className="btn-close btn-close-white" 
            onClick={onClose}
          ></button>
        </div>
        
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <Loader2 size={32} className="spinner" />
              <p className="mt-2">Loading proposals...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-4">
              <FileText size={48} className="text-muted mb-3" />
              <p>No saved proposals found.</p>
              <p className="text-muted">Create and save your first proposal!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Proposal #</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map(proposal => (
                    <tr key={proposal.id}>
                      <td>
                        <strong>{proposal.proposal_number}</strong>
                        {proposal.title && (
                          <div><small className="text-muted">{proposal.title}</small></div>
                        )}
                      </td>
                      <td>
                        <div className="fw-bold">{proposal.client_name}</div>
                        {proposal.client_email && (
                          <div><small>{proposal.client_email}</small></div>
                        )}
                        {proposal.client_phone && (
                          <div><small>{proposal.client_phone}</small></div>
                        )}
                      </td>
                      <td>
                        <div>{proposal.date}</div>
                        {proposal.due_date && (
                          <div><small className="text-muted">Due: {proposal.due_date}</small></div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {proposal.items?.length || 0} items
                        </span>
                      </td>
                      <td>
                        <strong>${proposal.grand_total}</strong>
                      </td>
                      <td>
                        <span className={`badge ${
                          proposal.status === 'accepted' ? 'bg-success' :
                          proposal.status === 'rejected' ? 'bg-danger' :
                          proposal.status === 'sent' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {proposal.status || 'draft'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => onLoadProposal(proposal)}
                            title="Load this proposal"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => onDeleteProposal(proposal.id)}
                            title="Delete this proposal"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Showing {proposals.length} proposal{proposals.length !== 1 ? 's' : ''}
            </small>
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProposalGenerator() {
  const [invoiceData, setInvoiceData] = useState({
    companyName: "Your Company Name",
    companyAddress: "123 Business Rd, City, Country",
    companyPhone: "+123456789",
    companyEmail: "info@company.com",
    companyLogo: null,
    clientName: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    invoiceNumber: `PROP-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentTerms: "Net 30",
    items: [],
    notes: "",
    template: TEMPLATES[0],
  });

  // API States
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState({
    products: false,
    services: false,
    clients: false,
    company: false,
    creatingProduct: false,
    creatingService: false,
    creatingClient: false,
    updatingCompany: false,
    proposals: false,
    savingProposal: false
  });
  const [error, setError] = useState({
    products: null,
    services: null,
    clients: null,
    company: null,
    proposals: null
  });

  // Client Search States
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);

  // Company Settings State
  const [showCompanySettings, setShowCompanySettings] = useState(false);

  // Proposal States
  const [savedProposals, setSavedProposals] = useState([]);
  const [showProposalsModal, setShowProposalsModal] = useState(false);
  const [currentProposalId, setCurrentProposalId] = useState(null);

  // Client Company Modal State
  const [showClientCompanyModal, setShowClientCompanyModal] = useState(false);
  const [clientCompanyFormData, setClientCompanyFormData] = useState({
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

  const [showProduct, setShowProduct] = useState(true);
  const [showService, setShowService] = useState(true);

  const style = invoiceData.template.style;

  // Pre-fill client company modal data
  useEffect(() => {
    if (showClientCompanyModal) {
      setClientCompanyFormData(prev => ({
        ...prev,
        name: invoiceData.clientName,
        contact: invoiceData.clientName,
        email: invoiceData.clientEmail,
        phone: invoiceData.clientPhone,
        address_line1: invoiceData.clientAddress
      }));
    }
  }, [showClientCompanyModal, invoiceData]);

  // Fetch Company Details
  const fetchCompanyDetails = async () => {
    setLoading(prev => ({ ...prev, company: true }));
    setError(prev => ({ ...prev, company: null }));
    
    try {
      const companyData = await apiService.company.getDetails();
      setCompanyDetails(companyData);
      
      // Update invoice data with company details
      setInvoiceData(prev => ({
        ...prev,
        companyName: companyData.companyName,
        companyAddress: companyData.companyAddress,
        companyPhone: companyData.companyPhone,
        companyEmail: companyData.companyEmail,
        companyLogo: companyData.companyLogo
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch company details';
      setError(prev => ({ ...prev, company: errorMessage }));
      console.error('Error fetching company details:', err);
    } finally {
      setLoading(prev => ({ ...prev, company: false }));
    }
  };

  // Update Company Details
  const updateCompanyDetailsHandler = async (formData) => {
    setLoading(prev => ({ ...prev, updatingCompany: true }));
    try {
      const updatedCompany = await apiService.company.updateDetails(formData);
      setCompanyDetails(updatedCompany);
      
      // Update invoice data
      setInvoiceData(prev => ({
        ...prev,
        companyName: updatedCompany.companyName,
        companyAddress: updatedCompany.companyAddress,
        companyPhone: updatedCompany.companyPhone,
        companyEmail: updatedCompany.companyEmail,
        companyLogo: updatedCompany.companyLogo
      }));
      
      setShowCompanySettings(false);
      alert('Company details updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update company details';
      setError(prev => ({ ...prev, company: errorMessage }));
      alert(`Error updating company details: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, updatingCompany: false }));
    }
  };

  // Upload Logo
  const handleLogoUpload = async (file) => {
    try {
      const logoUrl = await apiService.company.uploadLogo(file);
      return logoUrl;
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw err;
    }
  };

  // Fetch Products from API
  const fetchProducts = async () => {
    setLoading(prev => ({ ...prev, products: true }));
    setError(prev => ({ ...prev, products: null }));
    
    try {
      const productsData = await apiService.products.getAll();
      setProducts(productsData.products || []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch products';
      setError(prev => ({ ...prev, products: errorMessage }));
      console.error('Error fetching products:', err);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  // Fetch Services from API
  const fetchServices = async () => {
    setLoading(prev => ({ ...prev, services: true }));
    setError(prev => ({ ...prev, services: null }));
    
    try {
      const servicesData = await apiService.services.getAll();
      setServices(servicesData.services || []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch services';
      setError(prev => ({ ...prev, services: errorMessage }));
      console.error('Error fetching services:', err);
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  };

  // Fetch Clients from API
  const fetchClients = async () => {
    setLoading(prev => ({ ...prev, clients: true }));
    setError(prev => ({ ...prev, clients: null }));
    
    try {
      const clientsData = await apiService.clients.getAll();
      setClients(clientsData.clients || []);
      setFilteredClients(clientsData.clients || []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch clients';
      setError(prev => ({ ...prev, clients: errorMessage }));
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  // Fetch Proposals from API
  const fetchProposals = async () => {
    setLoading(prev => ({ ...prev, proposals: true }));
    setError(prev => ({ ...prev, proposals: null }));
    
    try {
      const proposalsData = await apiService.proposals.getAll();
      setSavedProposals(proposalsData.proposals || []);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch proposals';
      setError(prev => ({ ...prev, proposals: errorMessage }));
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(prev => ({ ...prev, proposals: false }));
    }
  };

  // Search Clients
  const handleClientSearch = (searchTerm) => {
    setClientSearch(searchTerm);
    if (searchTerm.length > 1) {
      const filtered = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
      );
      setFilteredClients(filtered);
      setShowClientDropdown(true);
    } else {
      setFilteredClients(clients);
      setShowClientDropdown(false);
    }
  };

  // Select Client
  const handleClientSelect = (client) => {
    setInvoiceData(prev => ({
      ...prev,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone || '',
      clientAddress: client.address || '',
    }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  // Create New Client from Current Data
  const createClientFromCurrentData = async () => {
    if (!invoiceData.clientName || !invoiceData.clientEmail) {
      alert('Client Name and Email are required to create a new client.');
      return;
    }

    setLoading(prev => ({ ...prev, creatingClient: true }));
    try {
      const newClient = await apiService.clients.createFromInvoice(invoiceData);
      
      // Add to local state
      setClients(prev => [...prev, newClient]);
      setFilteredClients(prev => [...prev, newClient]);
      
      // Select the newly created client
      handleClientSelect(newClient);
      
      alert('Client created successfully!');
    } catch (err) {
      const errorMessage = err.message || 'Failed to create client';
      setError(prev => ({ ...prev, clients: errorMessage }));
      alert(`Error creating client: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, creatingClient: false }));
    }
  };

  // Clear Client Selection
  const clearClientSelection = () => {
    setClientSearch('');
    setInvoiceData(prev => ({
      ...prev,
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
    }));
    setFilteredClients(clients);
  };

  // Create New Product via API
  const createNewProduct = async () => {
    const name = prompt("Enter Product Name");
    if (!name) return;

    const description = prompt("Enter Product Description") || "";
    const price = parseFloat(prompt("Enter Product Price")) || 0;

    setLoading(prev => ({ ...prev, creatingProduct: true }));
    
    try {
      const newProduct = await apiService.products.create({
        name,
        description,
        price
      });
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create product';
      setError(prev => ({ ...prev, products: errorMessage }));
      alert(`Error creating product: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, creatingProduct: false }));
    }
  };

  // Create New Service via API
  const createNewService = async () => {
    const name = prompt("Enter Service Name");
    if (!name) return;

    const description = prompt("Enter Service Description") || "";
    const price = parseFloat(prompt("Enter Service Price")) || 0;

    setLoading(prev => ({ ...prev, creatingService: true }));
    
    try {
      const newService = await apiService.services.create({
        name,
        description,
        price
      });
      setServices(prev => [...prev, newService]);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create service';
      setError(prev => ({ ...prev, services: errorMessage }));
      alert(`Error creating service: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, creatingService: false }));
    }
  };

  // Delete Product
  const deleteProductHandler = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiService.products.delete(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete product';
      setError(prev => ({ ...prev, products: errorMessage }));
      alert(`Error deleting product: ${errorMessage}`);
    }
  };

  // Delete Service
  const deleteServiceHandler = async (serviceId) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      await apiService.services.delete(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete service';
      setError(prev => ({ ...prev, services: errorMessage }));
      alert(`Error deleting service: ${errorMessage}`);
    }
  };

  // PROPOSAL MANAGEMENT FUNCTIONS

  // Save or Update Proposal
  const saveProposalHandler = async () => {
    if (!invoiceData.clientName || invoiceData.items.length === 0) {
      alert('Please add client information and at least one item before saving.');
      return;
    }

    setLoading(prev => ({ ...prev, savingProposal: true }));
    try {
      let savedProposal;
      if (currentProposalId) {
        // Update existing proposal
        savedProposal = await apiService.proposals.update(currentProposalId, invoiceData);
        alert('Proposal updated successfully!');
      } else {
        // Create new proposal
        savedProposal = await apiService.proposals.create(invoiceData);
        setCurrentProposalId(savedProposal.id);
        alert('Proposal saved successfully!');
      }
      
      // Refresh proposals list
      await fetchProposals();
      
    } catch (error) {
      console.error('Error saving proposal:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save proposal';
      setError(prev => ({ ...prev, proposals: errorMessage }));
      alert(`Error saving proposal: ${errorMessage}`);
    } finally {
      setLoading(prev => ({ ...prev, savingProposal: false }));
    }
  };

  // Load a saved proposal
  const loadProposal = (proposal) => {
    setInvoiceData({
      companyName: proposal.company_name || "Your Company Name",
      companyAddress: proposal.company_address || "123 Business Rd, City, Country",
      companyPhone: proposal.company_phone || "+123456789",
      companyEmail: proposal.company_email || "info@company.com",
      companyLogo: proposal.company_logo || null,
      clientName: proposal.client_name || "",
      clientAddress: proposal.client_address || "",
      clientPhone: proposal.client_phone || "",
      clientEmail: proposal.client_email || "",
      invoiceNumber: proposal.proposal_number || `PROP-${Date.now()}`,
      date: proposal.date || new Date().toISOString().split("T")[0],
      dueDate: proposal.due_date || "",
      items: proposal.items?.map(item => ({
        name: item.name,
        description: item.description,
        qty: item.quantity,
        price: item.price,
        gst: item.gst_rate,
        type: item.type
      })) || [],
      notes: proposal.notes || "",
      template: TEMPLATES.find(t => t.id === proposal.template) || TEMPLATES[0],
    });
    
    setCurrentProposalId(proposal.id);
    setShowProposalsModal(false);
    alert('Proposal loaded successfully!');
  };

  // Delete a proposal
  const deleteProposalHandler = async (proposalId) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return;

    try {
      await apiService.proposals.delete(proposalId);
      setSavedProposals(prev => prev.filter(p => p.id !== proposalId));
      
      if (currentProposalId === proposalId) {
        setCurrentProposalId(null);
      }
      
      alert('Proposal deleted successfully!');
    } catch (error) {
      console.error('Error deleting proposal:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to delete proposal';
      alert(`Error deleting proposal: ${errorMessage}`);
    }
  };

  // Create new proposal (reset form)
  const createNewProposal = () => {
    setInvoiceData({
      companyName: companyDetails?.companyName || "Your Company Name",
      companyAddress: companyDetails?.companyAddress || "123 Business Rd, City, Country",
      companyPhone: companyDetails?.companyPhone || "+123456789",
      companyEmail: companyDetails?.companyEmail || "info@company.com",
      companyLogo: companyDetails?.companyLogo || null,
      clientName: "",
      clientAddress: "",
      clientPhone: "",
      clientEmail: "",
      invoiceNumber: `PROP-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      items: [],
      notes: "",
      template: TEMPLATES[0],
    });
    setCurrentProposalId(null);
    alert('New proposal created!');
  };

  // Print Proposal
  const printProposal = () => {
    const invoicePages = document.querySelectorAll(".invoice-page, .explanation-page");
    const printWindow = window.open('', '_blank');
    
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proposal - ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice-page { margin-bottom: 20px; page-break-after: always; }
          .explanation-page { page-break-after: always; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .totals { text-align: right; margin-top: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          @media print {
            body { margin: 0; }
            .invoice-page, .explanation-page { page-break-after: always; }
          }
        </style>
      </head>
      <body>
    `;

    invoicePages.forEach(page => {
      printContent += page.outerHTML;
    });

    printContent += `
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for images to load before printing
    printWindow.onload = function() {
      printWindow.print();
      // printWindow.close(); // Uncomment if you want to auto-close after printing
    };
  };

  // Handle full client company form submission
  const handleCreateClientFromFullForm = async () => {
    try {
      const tenantId = localStorage.getItem("tenant_id");
      if (!tenantId) {
        alert("Tenant ID not found. Please login again.");
        return;
      }

      // Combine data from both forms
      const finalData = {
        name: clientCompanyFormData.name || invoiceData.clientName,
        contact: clientCompanyFormData.contact || invoiceData.clientName,
        email: clientCompanyFormData.email || invoiceData.clientEmail,
        phone: clientCompanyFormData.phone || invoiceData.clientPhone,
        address_line1: clientCompanyFormData.address_line1 || invoiceData.clientAddress,
        industry: clientCompanyFormData.industry,
        website: clientCompanyFormData.website,
        registration_number: clientCompanyFormData.registration_number,
        tax_id: clientCompanyFormData.tax_id,
        city: clientCompanyFormData.city,
        state: clientCompanyFormData.state,
        country: clientCompanyFormData.country,
        postal_code: clientCompanyFormData.postal_code,
        support_email: clientCompanyFormData.support_email,
        notes: clientCompanyFormData.notes,
        logo: clientCompanyFormData.logo
      };

      const formData = new FormData();
      Object.entries(finalData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });
      formData.append("tenant", tenantId);

      const newClient = await addClientCompany(formData);
      
      // Update the main form with the new client data
      setInvoiceData(prev => ({
        ...prev,
        clientName: finalData.name,
        clientEmail: finalData.email,
        clientPhone: finalData.phone,
        clientAddress: finalData.address_line1
      }));

      // Refresh clients list
      await fetchClients();
      
      // Close modal
      setShowClientCompanyModal(false);
      
      alert('Client company created successfully with full details!');
    } catch (err) {
      console.error('Error creating client:', err);
      alert(err.response?.data?.detail || err.message || 'Failed to create client company');
    }
  };

  // Refresh all data
  const refreshData = () => {
    fetchProducts();
    fetchServices();
    fetchClients();
    fetchCompanyDetails();
    fetchProposals();
  };

  // Load data on component mount
  useEffect(() => {
    fetchProducts();
    fetchServices();
    fetchClients();
    fetchCompanyDetails();
    fetchProposals();
  }, []);

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalGst = 0;
    let grandTotal = 0;

    invoiceData.items.forEach(item => {
      const itemSubtotal = (item.qty || 0) * (item.price || 0);
      const itemGst = itemSubtotal * ((item.gst || 0) / 100);
      subtotal += itemSubtotal;
      totalGst += itemGst;
    });

    grandTotal = subtotal + totalGst;

    return {
      subtotal: subtotal.toFixed(2),
      totalGst: totalGst.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    };
  };

  const totals = calculateTotals();

  const addItem = (item) => setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { ...item, qty: 1, gst: 10 }] });
  const removeItem = (index) => {
    const newItems = [...invoiceData.items];
    newItems.splice(index, 1);
    setInvoiceData({ ...invoiceData, items: newItems });
  };
  const updateItem = (index, key, value) => {
    const newItems = [...invoiceData.items];
    if (key === "qty") newItems[index][key] = value === "" ? "" : parseInt(value);
    else if (key === "price" || key === "gst") newItems[index][key] = value === "" ? "" : parseFloat(value);
    else newItems[index][key] = value;
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const chunkItems = (items, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  };
  const itemChunks = chunkItems(invoiceData.items, 10);

  const downloadInvoice = async () => {
    const invoicePages = document.querySelectorAll(".invoice-page, .explanation-page");
    const pdf = new jsPDF("p", "pt", "a4");
    for (let i = 0; i < invoicePages.length; i++) {
      const canvas = await html2canvas(invoicePages[i], { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      if (i < invoicePages.length - 1) pdf.addPage();
    }
    pdf.save(`${invoiceData.invoiceNumber}.pdf`);
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#e9ecef" }}>
      {/* Sidebar */}
      <div className="border-end p-3" style={{ width: 280 }}>
        {/* API Controls */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>API Controls</h5>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={refreshData}
              disabled={loading.products || loading.services || loading.clients || loading.company}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Company Settings Section */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>Company Settings</h5>
            {loading.company && <Loader2 size={16} className="spinner" />}
          </div>
          
          {error.company && (
            <div className="alert alert-danger py-2 mb-2">
              <small>{error.company}</small>
            </div>
          )}

          {companyDetails && (
            <div className="card mb-3">
              <div className="card-body p-3">
                <div className="d-flex align-items-center mb-2">
                  {companyDetails.companyLogo && (
                    <img 
                      src={companyDetails.companyLogo} 
                      alt="Logo" 
                      style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      className="me-2 rounded"
                    />
                  )}
                  <div className="flex-grow-1">
                    <strong className="d-block">{companyDetails.companyName}</strong>
                    <small className="text-muted">{companyDetails.companyEmail}</small>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-primary w-100 btn-sm"
                  onClick={() => setShowCompanySettings(true)}
                >
                  <Edit size={14} className="me-1" />
                  Edit Company
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Proposal Controls */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>Proposal Controls</h5>
            {loading.proposals && <Loader2 size={16} className="spinner" />}
          </div>
          
          <div className="d-grid gap-2">
            <button 
              className="btn btn-success btn-sm"
              onClick={saveProposalHandler}
              disabled={loading.savingProposal || invoiceData.items.length === 0}
            >
              {loading.savingProposal ? (
                <>
                  <Loader2 size={14} className="spinner me-1" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} className="me-1" />
                  {currentProposalId ? 'Update Proposal' : 'Save Proposal'}
                </>
              )}
            </button>
            
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setShowProposalsModal(true);
                fetchProposals();
              }}
            >
              <List size={14} className="me-1" />
              My Proposals ({savedProposals.length})
            </button>
            
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={createNewProposal}
            >
              <FileText size={14} className="me-1" />
              New Proposal
            </button>
          </div>
        </div>

        <h5>Filters</h5>
        <div className="mb-3">
          <input type="checkbox" checked={showProduct} onChange={() => setShowProduct(!showProduct)} id="productCheckbox" />
          <label htmlFor="productCheckbox" className="ms-2">Product</label>
          <input type="checkbox" checked={showService} onChange={() => setShowService(!showService)} id="serviceCheckbox" className="ms-3" />
          <label htmlFor="serviceCheckbox" className="ms-2">Service</label>
        </div>

        {showProduct && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Products</h5>
              {loading.products && <Loader2 size={16} className="spinner" />}
            </div>
            
            {error.products && (
              <div className="alert alert-danger py-2 mb-2">
                <small>{error.products}</small>
              </div>
            )}

            {products.map((p) => (
              <div key={p.id} className="d-flex align-items-center mb-2">
                <button 
                  className="btn btn-outline-success flex-grow-1 text-start" 
                  onClick={() => addItem(p)}
                  style={{ whiteSpace: 'normal' }}
                >
                  {p.name} - ${p.price}
                </button>
                <button 
                  className="btn btn-outline-danger ms-2"
                  onClick={() => deleteProductHandler(p.id)}
                  style={{ padding: '2px 6px' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            
            <button 
              className="btn btn-success w-100 mb-3" 
              onClick={createNewProduct}
              disabled={loading.creatingProduct}
            >
              {loading.creatingProduct ? <Loader2 size={16} className="spinner" /> : "+ Create Product"}
            </button>
          </>
        )}

        {showService && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Services</h5>
              {loading.services && <Loader2 size={16} className="spinner" />}
            </div>
            
            {error.services && (
              <div className="alert alert-danger py-2 mb-2">
                <small>{error.services}</small>
              </div>
            )}

            {services.map((s) => (
              <div key={s.id} className="d-flex align-items-center mb-2">
                <button 
                  className="btn btn-outline-info flex-grow-1 text-start" 
                  onClick={() => addItem(s)}
                  style={{ whiteSpace: 'normal' }}
                >
                  {s.name} - ${s.price}
                </button>
                <button 
                  className="btn btn-outline-danger ms-2"
                  onClick={() => deleteServiceHandler(s.id)}
                  style={{ padding: '2px 6px' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            
            <button 
              className="btn btn-info w-100 mb-3" 
              onClick={createNewService}
              disabled={loading.creatingService}
            >
              {loading.creatingService ? <Loader2 size={16} className="spinner" /> : "+ Create Service"}
            </button>
          </>
        )}

        {/* Template Selection */}
        <div className="mt-4">
          <h5>Select Template</h5>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`btn w-100 mb-2 ${invoiceData.template.id === t.id ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setInvoiceData({ ...invoiceData, template: t })}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Manual Logo Upload (Fallback) */}
        <div className="mt-4">
          <label className="form-label">Upload Logo (Manual)</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setInvoiceData({ ...invoiceData, companyLogo: URL.createObjectURL(e.target.files[0]) })}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Enhanced Client Form with Auto-complete */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <UserPlus size={18} className="me-2" />
                  Client Information
                </h5>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={fetchClients}
                    disabled={loading.clients}
                  >
                    {loading.clients ? <Loader2 size={14} className="spinner" /> : <RefreshCw size={14} />}
                  </button>
                  <span className="badge bg-secondary">{clients.length} clients</span>
                </div>
              </div>
              <div className="card-body">
                {/* Client Search & Select Section */}
                <div className="row mb-3">
                  <div className="col-md-8">
                    <label className="form-label">Select Existing Client</label>
                    <div className="position-relative">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Search size={14} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search clients by name, email, or phone..."
                          value={clientSearch}
                          onChange={(e) => handleClientSearch(e.target.value)}
                          onFocus={() => setShowClientDropdown(true)}
                        />
                      </div>
                      
                      {/* Client Dropdown */}
                      {showClientDropdown && filteredClients.length > 0 && (
                        <div 
                          className="position-absolute top-100 start-0 end-0 bg-white border mt-1 rounded shadow-lg z-3"
                          style={{ maxHeight: '200px', overflow: 'auto' }}
                        >
                          {filteredClients.map(client => (
                            <div
                              key={client.id}
                              className="p-2 border-bottom hover-bg-light cursor-pointer"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleClientSelect(client)}
                            >
                              <div className="fw-bold">{client.name}</div>
                              <small className="text-muted d-block">
                                {client.email} {client.phone && `• ${client.phone}`}
                              </small>
                              {client.contact_person && (
                                <small className="text-muted">Contact: {client.contact_person}</small>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {loading.clients && (
                        <div className="position-absolute top-50 end-0 translate-middle-y me-2">
                          <Loader2 size={16} className="spinner" />
                        </div>
                      )}
                    </div>
                    <div className="form-text">
                      Start typing to search through {clients.length} clients
                    </div>
                  </div>
                  
                  <div className="col-md-4 d-flex align-items-end gap-2">
                    <button
                      type="button"
                      className="btn btn-success flex-fill"
                      onClick={createClientFromCurrentData}
                      disabled={loading.creatingClient || !invoiceData.clientName || !invoiceData.clientEmail}
                    >
                      {loading.creatingClient ? <Loader2 size={14} className="spinner" /> : 'Save as New Client'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={clearClientSelection}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Client Details Form */}
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Client Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                      placeholder="Enter client company name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Client Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={invoiceData.clientEmail}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                      placeholder="client@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-md-6">
                    <label className="form-label">Client Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={invoiceData.clientPhone}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientPhone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Client Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={invoiceData.clientAddress}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                      placeholder="Street, City, Country"
                    />
                   <div className="mt-2">
                    <button 
                     type="button" 
                     className="btn btn-outline-primary btn-sm"
                     onClick={() => setShowClientCompanyModal(true)}
                      >
                    📋 Add More Company Details
                    </button>
                   <small className="text-muted ms-2">Click to add full company information</small>
                     </div>

                  </div>
                </div>

                {/* Client Quick Stats */}
                {invoiceData.clientName && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="alert alert-info py-2">
                        <small>
                          <strong>Ready to invoice:</strong> {invoiceData.clientName} 
                          {invoiceData.clientEmail && ` • ${invoiceData.clientEmail}`}
                        </small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Proposal Number</label>
            <input type="text" className="form-control" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={invoiceData.date} onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Due Date</label>
            <input type="date" className="form-control" value={invoiceData.dueDate} onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })} />
          </div>
        </div>

        {/* Editable Items Table */}
        <div className="table-responsive mb-3">
          <table className="table table-bordered align-middle">
            <thead style={{ ...style.tableHeader }}>
              <tr>
                <th>S.No</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>GST %</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index}>
                  <td style={style.tableCell}>{index + 1}</td>
                  <td style={style.tableCell}>
                    <input type="text" className="form-control" value={item.name} onChange={(e) => updateItem(index, "name", e.target.value)} />
                  </td>
                  <td style={style.tableCell}>
                    <input type="number" className="form-control" value={item.qty || ""} onChange={(e) => updateItem(index, "qty", e.target.value)} />
                  </td>
                  <td style={style.tableCell}>
                    <input type="number" className="form-control" value={item.price || ""} onChange={(e) => updateItem(index, "price", e.target.value)} />
                  </td>
                  <td style={style.tableCell}>
                    <input type="number" className="form-control" value={item.gst || 0} onChange={(e) => updateItem(index, "gst", e.target.value)} />
                  </td>
                  <td style={style.tableCell}>
                    ${((item.qty || 0) * (item.price || 0) * (1 + (item.gst || 0) / 100)).toFixed(2)}
                  </td>
                  <td>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Notes Section */}
        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            rows="3"
            value={invoiceData.notes}
            onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
            placeholder="Additional notes or terms and conditions..."
          />
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-4">
          <div className="btn-group" role="group">
            <button 
              className="btn btn-success"
              onClick={saveProposalHandler}
              disabled={loading.savingProposal || invoiceData.items.length === 0}
            >
              {loading.savingProposal ? (
                <>
                  <Loader2 size={16} className="spinner me-2" />
                  {currentProposalId ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={16} className="me-2" />
                  {currentProposalId ? 'Update Proposal' : 'Save Proposal'}
                </>
              )}
            </button>
            
            <button 
              className="btn btn-outline-primary"
              onClick={() => {
                setShowProposalsModal(true);
                fetchProposals();
              }}
            >
              <List size={16} className="me-2" />
              My Proposals
            </button>
            
            <button 
              className="btn btn-outline-secondary"
              onClick={createNewProposal}
            >
              <FileText size={16} className="me-2" />
              New Proposal
            </button>

            <button 
              className="btn btn-info"
              onClick={printProposal}
              disabled={invoiceData.items.length === 0}
            >
              <Printer size={16} className="me-2" />
              Print
            </button>
            
            <button className="btn btn-primary" onClick={downloadInvoice}>
              📄 Download PDF
            </button>
          </div>
          
          {currentProposalId && (
            <div className="mt-2">
              <small className="text-muted">
                Editing: Proposal #{currentProposalId}
              </small>
            </div>
          )}
        </div>

        {/* Default Template Preview */}
        {invoiceData.items.length === 0 && (
          <>
            <div className="invoice-page" style={{
              border: "1px solid #ccc",
              width: "500px",
              minHeight: "700px",
              margin: "30px auto",
              backgroundImage: `url(/proposal-templates/${invoiceData.template.file})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              padding: "20px",
              fontFamily: style.container.fontFamily,
              fontSize: style.container.fontSize,
              fontWeight: style.container.fontWeight,
              color: style.container.textColor,
              textAlign: style.container.textAlign,
            }}>
              {invoiceData.companyLogo && <img src={invoiceData.companyLogo} alt="Logo" style={{ maxHeight: 60 }} />}
              <h3 style={style.header}>{invoiceData.companyName}</h3>
              <p style={{ textAlign: "center", marginTop: 50 }}>Your proposal preview will appear here</p>
            </div>

            <div className="explanation-page" style={{
              border: "1px solid #ccc",
              width: "500px",
              minHeight: "700px",
              margin: "30px auto",
              backgroundImage: `url(/proposal-templates/${invoiceData.template.file})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              padding: "20px",
              fontFamily: style.container.fontFamily,
              fontSize: style.container.fontSize,
              fontWeight: style.container.fontWeight,
              color: style.container.textColor,
              textAlign: style.container.textAlign,
            }}>
              <h3 style={style.header}>Product & Service Explanations</h3>
              <p style={{ textAlign: "center", color: "#888", marginTop: 50 }}>No items added yet</p>
            </div>
          </>
        )}

        {/* --- PROPOSAL PAGES --- */}
        {itemChunks.map((itemChunk, pageIndex) => {
          const isFirstPage = pageIndex === 0;
          const isLastPage = pageIndex === itemChunks.length - 1;
          
          return (
            <div key={`invoice-${pageIndex}`} className="invoice-page" style={{
              border: "1px solid #ccc",
              width: "500px",
              minHeight: "700px",
              margin: "30px auto",
              backgroundImage: `url(/proposal-templates/${invoiceData.template.file})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              padding: "20px",
              fontFamily: style.container.fontFamily,
              fontSize: style.container.fontSize,
              fontWeight: style.container.fontWeight,
              color: style.container.textColor,
              textAlign: style.container.textAlign,
              position: "relative",
            }}>
              
              {/* COMPANY HEADER & CLIENT INFO - Show only on FIRST page */}
              {isFirstPage && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      {invoiceData.companyLogo && <img src={invoiceData.companyLogo} alt="Logo" style={{ maxHeight: 60, marginBottom: 10 }} />}
                      <h3 style={style.header}>{invoiceData.companyName}</h3>
                      <p style={style.clientInfo}>{renderAddress(invoiceData.companyAddress)}</p>
                      <p style={style.clientInfo}>{invoiceData.companyPhone} | {invoiceData.companyEmail}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <h4 style={style.subHeader}>PROPOSAL</h4>
                      <p style={style.clientInfo}>Proposal #: {invoiceData.invoiceNumber}</p>
                      <p style={style.clientInfo}>Date: {invoiceData.date}</p>
                      {invoiceData.dueDate && <p style={style.clientInfo}>Due Date: {invoiceData.dueDate}</p>}
                    </div>
                  </div>

                  {/* Client Information */}
                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <h5 style={style.subHeader}>Proposal For:</h5>
                    <p style={style.clientInfo}>{invoiceData.clientName}</p>
                    {invoiceData.clientAddress && (
                      <p style={style.clientInfo}>{renderAddress(invoiceData.clientAddress)}</p>
                    )}
                    {invoiceData.clientPhone && <p style={style.clientInfo}>{invoiceData.clientPhone}</p>}
                    {invoiceData.clientEmail && <p style={style.clientInfo}>{invoiceData.clientEmail}</p>}
                  </div>
                </>
              )}

              {/* ITEMS TABLE - Show on EVERY page */}
              <div style={{ marginTop: isFirstPage ? "30px" : "10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={style.tableHeader}>
                      <th style={{ padding: 8, border: "1px solid #ccc" }}>S.No</th>
                      <th style={{ padding: 8, border: "1px solid #ccc" }}>Item</th>
                      <th style={{ padding: 8, border: "1px solid #ccc" }}>Qty</th>
                      <th style={{ padding: 8, border: "1px solid #ccc" }}>Price</th>
                      <th style={{ padding: 8, border: "1px solid #ccc" }}>GST</th>
                      <th style={{ padding: 8, border: "1px solid #ccc" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemChunk.map((item, idx) => {
                      const globalIndex = pageIndex * 10 + idx;
                      return (
                        <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#f5f5f5", ...style.tableCell }}>
                          <td style={{ padding: 8, border: "1px solid #ccc" }}>{globalIndex + 1}</td>
                          <td style={{ padding: 8, border: "1px solid #ccc" }}>{item.name}</td>
                          <td style={{ padding: 8, border: "1px solid #ccc", textAlign: "center" }}>{item.qty}</td>
                          <td style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>${(item.price || 0).toFixed(2)}</td>
                          <td style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>{item.gst || 0}%</td>
                          <td style={{ padding: 8, border: "1px solid #ccc", textAlign: "right" }}>${((item.qty || 0) * (item.price || 0) * (1 + (item.gst || 0) / 100)).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* TOTALS SECTION - Only on LAST page */}
                {isLastPage && (
                  <div style={{ marginTop: 20, textAlign: "right" }}>
                    <div style={{ display: "inline-block", minWidth: "200px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={style.totals}>Subtotal:</span>
                        <span style={style.totals}>${totals.subtotal}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={style.totals}>Total GST:</span>
                        <span style={style.totals}>${totals.totalGst}</span>
                      </div>
                      <hr style={{ margin: "10px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={style.totals}>Grand Total:</span>
                        <span style={style.totals}>${totals.grandTotal}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTES & FOOTER - Only on LAST page */}
                {isLastPage && (
                  <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, padding: "0 20px" }}>
                    {invoiceData.notes && (
                      <div style={{ marginBottom: 15 }}>
                        <h5 style={style.subHeader}>Notes:</h5>
                        <p style={style.notes}>{invoiceData.notes}</p>
                      </div>
                    )}
                    <div style={{ textAlign: "center" }}>
                      <p style={style.footer}>Thank you for your business!</p>
                      <p style={style.footer}>{invoiceData.companyName} | {invoiceData.companyPhone} | {invoiceData.companyEmail}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* --- EXPLANATION PAGES --- */}
        {itemChunks.map((itemChunk, pageIndex) => (
          <div key={`explanation-${pageIndex}`} className="explanation-page" style={{
            border: "1px solid #ccc",
            width: "500px",
            minHeight: "700px",
            margin: "30px auto",
            backgroundImage: `url(/proposal-templates/${invoiceData.template.file})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            padding: "20px",
            fontFamily: style.container.fontFamily,
            fontSize: style.container.fontSize,
            fontWeight: style.container.fontWeight,
            color: style.container.textColor,
            textAlign: style.container.textAlign,
            position: "relative",
          }}>
            <h3 style={style.header}>Product & Service Explanations</h3>
            <div style={{ marginTop: 20 }}>
              {itemChunk.length ? (
                itemChunk.map((item, index) => (
                  <div key={index} style={{ marginBottom: 15, ...style.tableCell }}>
                    <h5 style={{ marginBottom: 5 }}>{item.name}</h5>
                    <p>{item.description || "No description provided."}</p>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#888" }}>No items to show</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Company Settings Modal */}
      {showCompanySettings && (
        <CompanySettingsModal
          companyDetails={companyDetails}
          onUpdate={updateCompanyDetailsHandler}
          onClose={() => setShowCompanySettings(false)}
          loading={loading.updatingCompany}
          onLogoUpload={handleLogoUpload}
        />
      )}

      {/* Proposals Modal */}
      {showProposalsModal && (
        <ProposalsModal
          proposals={savedProposals}
          loading={loading.proposals}
          onLoadProposal={loadProposal}
          onDeleteProposal={deleteProposalHandler}
          onClose={() => setShowProposalsModal(false)}
        />
      )}

      {/* Client Company Modal */}
      {showClientCompanyModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
          onClick={() => setShowClientCompanyModal(false)}
        >
          <div
            className="card shadow"
            style={{ width: "700px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">🏢 Add Client Company Details</h5>
              <button 
                className="btn-close btn-close-white" 
                onClick={() => setShowClientCompanyModal(false)}
              ></button>
            </div>
            
            <div className="card-body">
              <div className="alert alert-info">
                <small>
                  <strong>Note:</strong> Basic information is pre-filled from the form above. 
                  You can add additional details here.
                </small>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateClientFromFullForm();
              }}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Company Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.name}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        placeholder="Company name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Contact Person *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.contact}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          contact: e.target.value
                        }))}
                        placeholder="Contact person"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={clientCompanyFormData.email}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        placeholder="email@company.com"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.phone}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          phone: e.target.value
                        }))}
                        placeholder="Phone number"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.address_line1}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          address_line1: e.target.value
                        }))}
                        placeholder="Street address"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Industry</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.industry}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          industry: e.target.value
                        }))}
                        placeholder="Industry"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Website</label>
                      <input
                        type="url"
                        className="form-control"
                        value={clientCompanyFormData.website}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          website: e.target.value
                        }))}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Registration Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.registration_number}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          registration_number: e.target.value
                        }))}
                        placeholder="Registration number"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Tax ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.tax_id}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          tax_id: e.target.value
                        }))}
                        placeholder="Tax ID"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Support Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={clientCompanyFormData.support_email}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          support_email: e.target.value
                        }))}
                        placeholder="support@company.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.city}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          city: e.target.value
                        }))}
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.state}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          state: e.target.value
                        }))}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={clientCompanyFormData.postal_code}
                        onChange={(e) => setClientCompanyFormData(prev => ({
                          ...prev,
                          postal_code: e.target.value
                        }))}
                        placeholder="Postal code"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={clientCompanyFormData.country}
                    onChange={(e) => setClientCompanyFormData(prev => ({
                      ...prev,
                      country: e.target.value
                    }))}
                    placeholder="Country"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={clientCompanyFormData.notes}
                    onChange={(e) => setClientCompanyFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    placeholder="Additional notes about the client company..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Logo</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setClientCompanyFormData(prev => ({
                      ...prev,
                      logo: e.target.files[0]
                    }))}
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowClientCompanyModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    Save Client Company
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}