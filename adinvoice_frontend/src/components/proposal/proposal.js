"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Loader2, Search, UserPlus, Building, Edit, Save, FileText, List, Printer, Plus, Eye, Image } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Swal from "sweetalert2";

// Import your existing API functions - including template functions
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
  deleteProposal,
  getTemplates // Add this import
} from "../../../Api/api_clientadmin";

// Helper function to handle address objects
const renderAddress = (address) => {
  if (!address) return '';
  
  if (typeof address === 'object') {
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

// API Service Functions - Updated with Template Management
const apiService = {
  products: {
    async getAll() {
      try {
        const products = await getProductsServices();
        const productItems = products
          .filter(item => item.type === "product" || !item.type)
          .map(item => ({
            id: item.id,
            name: item.name,
            price: parseFloat(item.unit_price) || 0,
            description: item.description || "",
            hsn_sac: item.hsn_code || "",
            part_service_code: item.part_service_code || "",
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
          hsn_code: productData.hsn_code || "",
          part_service_code: productData.part_service_code || "",
          type: "product"
        };
        const newProduct = await addProduct(apiData);
        return {
          id: newProduct.id,
          name: newProduct.name,
          price: parseFloat(newProduct.unit_price) || 0,
          description: newProduct.description || "",
          hsn_sac: newProduct.hsn_code || "",
          part_service_code: newProduct.part_service_code || "",
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
            hsn_sac: item.hsn_code || "",
            part_service_code: item.part_service_code || "",
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
          hsn_code: serviceData.hsn_code || "",
          part_service_code: serviceData.part_service_code || "",
          type: "service"
        };
        const newService = await addProduct(apiData);
        return {
          id: newService.id,
          name: newService.name,
          price: parseFloat(newService.unit_price) || 0,
          description: newService.description || "",
          hsn_sac: newService.hsn_code || "",
          part_service_code: newService.part_service_code || "",
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
        
        console.log('Raw API Response:', clients);
        
        let clientsArray = [];
        
        if (Array.isArray(clients)) {
          clientsArray = clients;
        } else if (clients && Array.isArray(clients.results)) {
          clientsArray = clients.results;
        } else if (clients && Array.isArray(clients.items)) {
          clientsArray = clients.items;
        } else if (clients && typeof clients === 'object') {
          clientsArray = [clients];
        }
        
        const transformedClients = clientsArray.map(client => {
          const transformed = {
            id: client.id || client.client_id,
            name: client.company_name || client.name || client.business_name || 'Unnamed Client',
            email: client.email || client.contact_email || '',
            phone: client.phone || client.contact_phone || client.phone_number || '',
            address: this.extractAddress(client),
            contact_person: client.contact_person || client.primary_contact || '',
            tax_id: client.tax_id || client.tax_number || client.vat_number || '',
            status: client.status || client.is_active !== false ? 'active' : 'inactive',
            _original: client
          };
          
          return transformed;
        }).filter(client => client.name !== 'Unnamed Client');
        
        return { clients: transformedClients };
      } catch (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
    },  

    extractAddress(client) {
      if (client.address && typeof client.address === 'object') {
        return this.formatAddressObject(client.address);
      }
      
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

    async createFromInvoice(clientData) {
      try {
        const tenantId = localStorage.getItem("tenant_id");
        console.log('🔍 Tenant ID from localStorage:', tenantId);
        
        if (!tenantId) {
          throw new Error("Tenant ID not found. Please login again.");
        }

        const formData = new FormData();
        
        formData.append('name', clientData.clientName || '');
        formData.append('contact', clientData.clientName || '');
        formData.append('email', clientData.clientEmail || '');
        formData.append('phone', clientData.clientPhone || '');
        formData.append('address_line1', clientData.clientAddress || '');
        formData.append('tenant', tenantId);
        
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
        
        console.log('Raw Company API Response:', companyData);
        
        return {
          companyName: this.extractCompanyName(companyData),
          companyEmail: companyData.email || "info@company.com",
          companyPhone: companyData.phone || "+123456789",
          alternatePhone: companyData.alternate_phone || companyData.alternate_phone || "",
          companyAddress: this.formatCompanyAddress(companyData),
          website: companyData.website || "",
          designation: companyData.designation || "",
          industry: companyData.industry || "",
          experience: companyData.experience_years || companyData.experience || 0,
          dateOfBirth: companyData.date_of_birth || companyData.dob || "",
          linkedin: companyData.linkedin || companyData.linkedin_profile || "",
          twitter: companyData.twitter || companyData.twitter_profile || "",
          taxId: companyData.tax_id || companyData.vat_number || "",
          currency: companyData.currency || "USD",
          paymentTerms: companyData.payment_terms || "Net 30",
          companyLogo: companyData.logo || companyData.logo_url || null,
          _original: companyData
        };
      } catch (error) {
        console.error('Error fetching company details:', error);
        return this.getDefaultCompanyData();
      }
    },

    extractCompanyName(companyData) {
      const nameFields = [
        'company_name', 'business_name', 'name', 
        'organization', 'firm_name', 'enterprise_name'
      ];
      
      for (const field of nameFields) {
        if (companyData[field] && companyData[field] !== "--" && companyData[field] !== "-") {
          return companyData[field];
        }
      }
      
      if (companyData.email) {
        const username = companyData.email.split('@')[0];
        return username.charAt(0).toUpperCase() + username.slice(1) + " Company";
      }
      
      return "Your Company Name";
    },

    async updateDetails(companyData) {
      try {
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

  proposals: {
    async getAll() {
      try {
        const response = await getProposals();
        console.log('🔍 Raw API response for proposals:', response);
        
        // Handle different response structures
        let proposalsArray = [];
        
        if (Array.isArray(response)) {
          proposalsArray = response;
        } else if (response && Array.isArray(response.data)) {
          proposalsArray = response.data;
        } else if (response && Array.isArray(response.proposals)) {
          proposalsArray = response.proposals;
        } else if (response && Array.isArray(response.results)) {
          proposalsArray = response.results;
        } else if (response && Array.isArray(response.items)) {
          proposalsArray = response.items;
        } else if (response && typeof response === 'object') {
          // If it's a single object, wrap it in array
          proposalsArray = [response];
        }
        
        console.log('📊 Final proposals array:', proposalsArray);
        console.log('✅ Array length:', proposalsArray.length);
        
        // Transform the proposals data to ensure consistency
        const transformedProposals = proposalsArray.map(proposal => ({
          id: proposal.id,
          title: proposal.title,
          proposal_number: proposal.proposal_number,
          client_name: proposal.client_name,
          client_email: proposal.client_email,
          client_phone: proposal.client_phone,
          client_address: proposal.client_address,
          company_name: proposal.company_name,
          company_email: proposal.company_email,
          company_phone: proposal.company_phone,
          company_address: proposal.company_address,
          company_logo: proposal.company_logo,
          items: Array.isArray(proposal.items) ? proposal.items : [],
          subtotal: parseFloat(proposal.subtotal) || 0,
          total_gst: parseFloat(proposal.total_gst) || 0,
          grand_total: parseFloat(proposal.grand_total) || 0,
          date: proposal.date,
          due_date: proposal.due_date,
          notes: proposal.notes,
          template: proposal.template || 1, // Default to template 1 if not specified
          status: proposal.status || 'draft',
          _original: proposal
        }));
        
        return { proposals: transformedProposals };
      } catch (error) {
        console.error('❌ Error fetching proposals:', error);
        // Return empty array on error
        return { proposals: [] };
      }
    },

    async create(proposalData) {
      try {
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
            hsn_sac_code: item.hsn_sac || '',
            part_service_code: item.part_service_code || '',
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

        console.log('📤 Creating proposal with data:', apiData);
        const newProposal = await saveProposal(apiData);
        console.log('✅ Proposal created:', newProposal);
        return newProposal;
      } catch (error) {
        console.error('Error creating proposal:', error);
        throw error;
      }
    },

    async update(id, proposalData) {
      try {
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
            hsn_sac_code: item.hsn_sac || '',
            part_service_code: item.part_service_code || '',
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
  },

  // Add Templates API
  templates: {
    async getAll() {
      try {
        const templates = await getTemplates();
        console.log('📋 Raw templates API response:', templates);
        
        // Transform templates to match your expected format
        const transformedTemplates = (templates || []).map(template => ({
          id: template.id,
          name: template.title,
          file: template.file,
          style: this.generateTemplateStyle(template.id), // Generate dynamic styles
          imageUrl: `http://127.0.0.1:8000/uploads/${template.file}`,
          _original: template
        }));
        
        console.log('🎨 Transformed templates:', transformedTemplates);
        return { templates: transformedTemplates };
      } catch (error) {
        console.error('Error fetching templates:', error);
        // Return default templates if API fails
        return { templates: this.getDefaultTemplates() };
      }
    },

    generateTemplateStyle(templateId) {
      // Generate styles based on template ID or use defaults
      const baseStyles = {
        container: { fontFamily: "Arial, sans-serif", fontSize: "14px", fontWeight: "normal", textColor: "#333", textAlign: "left" },
        header: { color: "#2c3e50", fontSize: "24px", fontWeight: "bold", textAlign: "center" },
        subHeader: { color: "#34495e", fontSize: "18px", fontWeight: "bold" },
        clientInfo: { fontSize: "14px", fontWeight: "normal", textColor: "#555" },
        tableHeader: { backgroundColor: "#f8f9fa", fontWeight: "bold", textAlign: "left", fontSize: "14px", color: "#2c3e50" },
        tableCell: { fontSize: "14px", color: "#333", textAlign: "left" },
        totals: { fontSize: "16px", fontWeight: "bold", textAlign: "right", color: "#2c3e50" },
        notes: { fontSize: "13px", color: "#666", textAlign: "left" },
        footer: { fontSize: "12px", color: "#777", textAlign: "center" },
      };

      // You can customize styles based on template ID
      switch(templateId) {
        case 1:
          return {
            ...baseStyles,
            header: { ...baseStyles.header, color: "#1b4496", textAlign: "left" },
            container: { ...baseStyles.container, fontFamily: "Times New Roman, serif" }
          };
        case 2:
          return {
            ...baseStyles,
            header: { ...baseStyles.header, color: "#473b32", textAlign: "center" },
            tableHeader: { ...baseStyles.tableHeader, textAlign: "center" },
            tableCell: { ...baseStyles.tableCell, textAlign: "center" }
          };
        case 3:
          return {
            ...baseStyles,
            header: { ...baseStyles.header, color: "#ffffff", textAlign: "right" },
            container: { ...baseStyles.container, textAlign: "right" },
            tableHeader: { ...baseStyles.tableHeader, textAlign: "right" },
            tableCell: { ...baseStyles.tableCell, textAlign: "right" },
            totals: { ...baseStyles.totals, textAlign: "right" }
          };
        default:
          return baseStyles;
      }
    },

    getDefaultTemplates() {
      // Fallback templates if API fails
      return [
        {
          id: 1,
          name: "Classic",
          file: "template_1.jpg",
          style: {
            container: { fontFamily: "Times New Roman, serif", fontSize: "14px", fontWeight: "normal", textColor: "#dfdcdcff", textAlign: "left"},
            header: { color: "#b2b4b6ff", fontSize: "20px", fontWeight: "bold", textAlign: "left" },
            subHeader: { color: "#1b4496ff", fontSize: "16px", fontWeight: "bold"},
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
        }
      ];
    }
  },
};

// Simple Template Selection Modal Component
const TemplateSelectionModal = ({ 
  show, 
  onClose, 
  templates, 
  onSelectTemplate, 
  currentTemplate,
  loading = false 
}) => {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      onClick={onClose}
    >
      <div
        className="card shadow"
        style={{ width: "90%", maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Select Template</h5>
          <button 
            className="btn-close btn-close-white" 
            onClick={onClose}
          ></button>
        </div>
        
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <Loader2 size={32} className="spinner" />
              <p className="mt-2">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4">
              <p>No templates available.</p>
            </div>
          ) : (
            <div className="row g-3">
              {templates.map((template) => (
                <div key={template.id} className="col-md-6">
                  <div 
                    className={`card template-card ${currentTemplate?.id === template.id ? 'border-primary' : 'border-light'}`}
                    style={{ 
                      cursor: 'pointer',
                      border: currentTemplate?.id === template.id ? '3px solid #0d6efd' : '1px solid #dee2e6'
                    }}
                    onClick={() => onSelectTemplate(template)}
                  >
                    <div className="card-img-top template-preview">
                      <img 
                        src={template.imageUrl || `/proposal-templates/${template.file}`} 
                        alt={template.name}
                        style={{ 
                          width: '100%', 
                          height: '150px', 
                          objectFit: 'cover',
                          background: '#f8f9fa'
                        }}
                        onError={(e) => {
                          e.target.src = '/proposal-templates/default-template.jpg';
                        }}
                      />
                    </div>
                    <div className="card-body text-center p-2">
                      <h6 className="card-title mb-1">{template.name}</h6>
                      {currentTemplate?.id === template.id && (
                        <span className="badge bg-success">Selected</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-end">
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

// Product/Service Creation Modal Component
const ProductServiceModal = ({ 
  show, 
  onClose, 
  onSave, 
  type, // 'product' or 'service'
  loading 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    hsn_code: '',
    part_service_code: '',
    stock_quantity:'',
    delivery_available: true,
    is_active: true,
    type: type
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setFormData({
        name: '',
        description: '',
        price: '',
        hsn_code: '',
        part_service_code: '',
        stock_quantity: '',
        delivery_available: true,
        is_active: true,
        type: type
      });
    }
  }, [show, type]);

  return (
  <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      onClick={onClose}
    >
      <div
        className="card shadow"
        style={{ width: "500px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {type === 'product' ? 'Create Product' : 'Create Service'}
          </h5>
          <button 
            className="btn-close btn-close-white" 
            onClick={onClose}
          ></button>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={`Enter ${type} name`}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={`Enter ${type} description`}
                rows="2"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">HSN/SAC Code</label>
              <input
                type="text"
                className="form-control"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleInputChange}
                placeholder="Enter HSN or SAC code"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Part/Service Code</label>
              <input
                type="text"
                className="form-control"
                name="part_service_code"
                value={formData.part_service_code}
                onChange={handleInputChange}
                placeholder="Enter internal code"
              />
            </div>
          </form>
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-between">
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.price}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner me-2" />
                  Creating...
                </>
              ) : (
                `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      if (file.size > 5 * 1024 * 1024) {
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
            <h5 className="modal-title">Company Settings</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
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
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Company Logo</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={uploadingLogo}
                />
                {uploadingLogo && <div className="form-text">Uploading...</div>}
                {formData.companyLogo && (
                  <div className="mt-2">
                    <img 
                      src={formData.companyLogo} 
                      alt="Company Logo" 
                      style={{ maxHeight: '60px', maxWidth: '200px' }}
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

// View Proposal Modal Component
const ViewProposalModal = ({ proposal, onClose }) => {
  if (!proposal) return null;

  const style = TEMPLATES.find(t => t.id === (proposal.template?.id || proposal.template || 1))?.style || TEMPLATES[0].style;

  const calculateTotals = (items) => {
    let subtotal = 0;
    let totalGst = 0;
    let grandTotal = 0;

    items.forEach(item => {
      const itemSubtotal = (item.quantity || item.qty || 0) * (item.price || 0);
      const itemGst = itemSubtotal * ((item.gst_rate || item.gst || 0) / 100);
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

  const totals = calculateTotals(proposal.items || []);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1070 }}
      onClick={onClose}
    >
      <div
        className="card shadow"
        style={{ width: "90%", maxWidth: "1000px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
          <h5 className="mb-0">View Proposal - {proposal.proposal_number}</h5>
          <button 
            className="btn-close btn-close-white" 
            onClick={onClose}
          ></button>
        </div>
        
        <div className="card-body p-0">
          {/* Proposal Preview */}
          <div className="invoice-page" style={{
            width: "100%",
            minHeight: "800px",
            backgroundImage: `url(/proposal-templates/${TEMPLATES.find(t => t.id === (proposal.template?.id || proposal.template || 1))?.file || 'template_1.jpg'})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            padding: "40px",
            fontFamily: style.container.fontFamily,
            fontSize: style.container.fontSize,
            fontWeight: style.container.fontWeight,
            color: style.container.textColor,
            textAlign: style.container.textAlign,
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" }}>
              <div>
                {proposal.company_logo && (
                  <img src={proposal.company_logo} alt="Logo" style={{ maxHeight: "80px", marginBottom: "20px" }} />
                )}
                <h3 style={style.header}>{proposal.company_name}</h3>
                <p style={style.clientInfo}>{proposal.company_address}</p>
                <p style={style.clientInfo}>{proposal.company_phone} | {proposal.company_email}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h4 style={style.subHeader}>PROPOSAL</h4>
                <p style={style.clientInfo}>Proposal #: {proposal.proposal_number}</p>
                <p style={style.clientInfo}>Date: {proposal.date}</p>
                {proposal.due_date && <p style={style.clientInfo}>Due Date: {proposal.due_date}</p>}
              </div>
            </div>

            {/* Client Information */}
            <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "10px" }}>
              <h5 style={style.subHeader}>Proposal For:</h5>
              <p style={style.clientInfo}><strong>{proposal.client_name}</strong></p>
              {proposal.client_address && <p style={style.clientInfo}>{proposal.client_address}</p>}
              {proposal.client_phone && <p style={style.clientInfo}>{proposal.client_phone}</p>}
              {proposal.client_email && <p style={style.clientInfo}>{proposal.client_email}</p>}
            </div>

            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
              <thead>
                <tr style={style.tableHeader}>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>S.No</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Item</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Description</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>HSN/SAC</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Part/Service Code</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Qty</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Price</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>GST %</th>
                  <th style={{ padding: "12px", border: "1px solid #ddd" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(proposal.items || []).map((item, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa", ...style.tableCell }}>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>{index + 1}</td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>{item.name}</td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>{item.description || "-"}</td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>{item.hsn_sac_code || "-"}</td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>{item.part_service_code || "-"}</td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{item.quantity || item.qty || 1}</td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "right" }}>${(item.price || 0).toFixed(2)}</td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "right" }}>{item.gst_rate || item.gst || 0}%</td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "right" }}>
                      ${(((item.quantity || item.qty || 0) * (item.price || 0)) * (1 + (item.gst_rate || item.gst || 0) / 100)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ textAlign: "right", marginBottom: "30px" }}>
              <div style={{ display: "inline-block", minWidth: "300px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", padding: "5px 0" }}>
                  <span style={{ ...style.totals, fontSize: "16px" }}>Subtotal:</span>
                  <span style={{ ...style.totals, fontSize: "16px" }}>${totals.subtotal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", padding: "5px 0" }}>
                  <span style={{ ...style.totals, fontSize: "16px" }}>Total GST:</span>
                  <span style={{ ...style.totals, fontSize: "16px" }}>${totals.totalGst}</span>
                </div>
                <hr style={{ margin: "15px 0", borderColor: "#ddd" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", padding: "5px 0" }}>
                  <span style={{ ...style.totals, fontSize: "18px", fontWeight: "bold" }}>Grand Total:</span>
                  <span style={{ ...style.totals, fontSize: "18px", fontWeight: "bold" }}>${totals.grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {proposal.notes && (
              <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "10px" }}>
                <h5 style={style.subHeader}>Notes:</h5>
                <p style={style.notes}>{proposal.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div style={{ textAlign: "center", marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #ddd" }}>
              <p style={style.footer}>Thank you for your business!</p>
            </div>
          </div>
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-end">
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

// Client Company Details Modal Component
const ClientCompanyModal = ({ 
  show, 
  onClose, 
  onSave, 
  initialData,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    industry: "",
    website: "",
    registration_number: "",
    tax_id: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    support_email: "",
    notes: "",
    logo: null,
  });

  // Initialize form with initial data when modal opens
  useEffect(() => {
    if (show && initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || "",
        contact: initialData.contact || initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address_line1: initialData.address_line1 || initialData.address || "",
      }));
    }
  }, [show, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      onClick={onClose}
    >
      <div
        className="card shadow"
        style={{ width: "700px", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Add Client Company Details</h5>
          <button 
            className="btn-close btn-close-white" 
            onClick={onClose}
          ></button>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contact Person *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="Enter contact person name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="company@example.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Address Line 1 *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    placeholder="Street address, P.O. box"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Address Line 2</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Postal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        placeholder="ZIP or postal code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                name="notes"
                rows="2"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this client..."
              />
            </div>
          </form>
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-between">
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.contact || !formData.email || !formData.address_line1}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner me-2" />
                  Saving...
                </>
              ) : (
                'Save Client Company'
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
  onViewProposal,
  onClose 
}) => {
  
  const safeProposals = Array.isArray(proposals) ? proposals : [];

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
          <h5 className="mb-0">Saved Proposals ({safeProposals.length})</h5>
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
          ) : safeProposals.length === 0 ? (
            <div className="text-center py-4">
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
                  {safeProposals.map(proposal => (
                    <tr key={proposal.id}>
                      <td>
                        <strong>{proposal.proposal_number}</strong>
                      </td>
                      <td>
                        <div className="fw-bold">{proposal.client_name}</div>
                        {proposal.client_email && (
                          <div><small>{proposal.client_email}</small></div>
                        )}
                      </td>
                      <td>
                        <div>{proposal.date}</div>
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
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-outline-info"
                            onClick={() => onViewProposal(proposal)}
                            title="View this proposal"
                          >
                            <Eye size={14} />
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
          <div className="d-flex justify-content-end">
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

// Default templates fallback
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
    template: TEMPLATES[0], // Set default template
  });

  // API States
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]); // Add templates state
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState({
    products: false,
    services: false, 
    clients: false,
    templates: false, // Add templates loading state
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
    templates: null, // Add templates error state
    company: null,
    proposals: null
  });

  // Client Search States
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);

  // Company Settings State
  const [showCompanySettings, setShowCompanySettings] = useState(false);

  // Template Selection State
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Proposal States
  const [savedProposals, setSavedProposals] = useState([]);
  const [showProposalsModal, setShowProposalsModal] = useState(false);
  const [currentProposalId, setCurrentProposalId] = useState(null);
  const [viewingProposal, setViewingProposal] = useState(null);

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

  // Product/Service Modal States
  const [showProductServiceModal, setShowProductServiceModal] = useState(false);
  const [currentProductServiceType, setCurrentProductServiceType] = useState('product');
  const [creatingProductService, setCreatingProductService] = useState(false);

  const [showProduct, setShowProduct] = useState(true);
  const [showService, setShowService] = useState(true);

  // Fetch Templates from API
  const fetchTemplates = async () => {
    setLoading(prev => ({ ...prev, templates: true }));
    setError(prev => ({ ...prev, templates: null }));
    
    try {
      const templatesData = await apiService.templates.getAll();
      console.log('📋 Fetched templates:', templatesData);
      setTemplates(templatesData.templates || []);
      
      // Set default template if none is selected
      if (templatesData.templates.length > 0 && !invoiceData.template) {
        setInvoiceData(prev => ({
          ...prev,
          template: templatesData.templates[0]
        }));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch templates';
      setError(prev => ({ ...prev, templates: errorMessage }));
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(prev => ({ ...prev, templates: false }));
    }
  };

  // Handle Template Selection
  const handleTemplateSelect = (template) => {
    setInvoiceData(prev => ({
      ...prev,
      template: template
    }));
    setShowTemplateModal(false);
    
    Swal.fire({
      icon: 'success',
      title: 'Template Selected!',
      text: `"${template.name}" template is now active`,
      timer: 2000
    });
  };

  // Fetch Company Details
  const fetchCompanyDetails = async () => {
    setLoading(prev => ({ ...prev, company: true }));
    setError(prev => ({ ...prev, company: null }));
    
    try {
      const companyData = await apiService.company.getDetails();
      setCompanyDetails(companyData);
      
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
      console.log('🔄 Starting to fetch proposals...');
      const proposalsData = await apiService.proposals.getAll();
      
      console.log('📦 Raw proposals API response:', proposalsData);
      console.log('🔍 Proposals array:', proposalsData.proposals);
      console.log('✅ Is array?', Array.isArray(proposalsData.proposals));
      console.log('📊 Number of proposals:', proposalsData.proposals?.length || 0);
      
      if (proposalsData.proposals && proposalsData.proposals.length > 0) {
        console.log('📝 First proposal sample:', proposalsData.proposals[0]);
      }
      
      setSavedProposals(proposalsData.proposals || []);
      
      console.log('💾 Saved to state:', proposalsData.proposals?.length || 0);
      
    } catch (err) {
      console.error('❌ Error fetching proposals:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch proposals';
      setError(prev => ({ ...prev, proposals: errorMessage }));
      console.error('Error fetching proposals:', err);
      setSavedProposals([]);
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
      
      setClients(prev => [...prev, newClient]);
      setFilteredClients(prev => [...prev, newClient]);
      
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

  // Enhanced Create Product/Service Functions
  const handleCreateProductService = (type) => {
    setCurrentProductServiceType(type);
    setShowProductServiceModal(true);
  };

  const handleSaveProductService = async (formData) => {
    setCreatingProductService(true);
    
    try {
      if (currentProductServiceType === 'product') {
        const newProduct = await apiService.products.create(formData);
        setProducts(prev => [...prev, newProduct]);
        
        // Auto-add to invoice items
        addItem(newProduct);
        
        Swal.fire({
          icon: 'success',
          title: 'Product Created!',
          text: 'Product has been created and added to your proposal',
          timer: 2000
        });
      } else {
        const newService = await apiService.services.create(formData);
        setServices(prev => [...prev, newService]);
        
        // Auto-add to invoice items
        addItem(newService);
        
        Swal.fire({
          icon: 'success',
          title: 'Service Created!',
          text: 'Service has been created and added to your proposal',
          timer: 2000
        });
      }
      
      setShowProductServiceModal(false);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || `Failed to create ${currentProductServiceType}`;
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: errorMessage
      });
    } finally {
      setCreatingProductService(false);
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
        savedProposal = await apiService.proposals.update(currentProposalId, invoiceData);
        alert('Proposal updated successfully!');
      } else {
        savedProposal = await apiService.proposals.create(invoiceData);
        setCurrentProposalId(savedProposal.id);
        alert('Proposal saved successfully!');
      }
      
      console.log('🔄 Refreshing proposals list...');
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

  // Load a saved proposal - FIXED VERSION
  const loadProposal = (proposal) => {
    console.log('🔄 Loading proposal:', proposal);
    
    // Find the correct template - handle both number and object formats
    let templateId = proposal.template;
    if (typeof templateId === 'object') {
      templateId = templateId.id || 1;
    }
    
    const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
    
    console.log('🎨 Selected template:', template);
    console.log('📦 Proposal items:', proposal.items);

    // Transform items to ensure they have the correct structure
    const transformedItems = (proposal.items || []).map(item => ({
      name: item.name || '',
      description: item.description || '',
      qty: item.quantity || item.qty || 1,
      price: item.price || 0,
      gst: item.gst_rate || item.gst || 0,
      hsn_sac: item.hsn_sac_code || '',
      part_service_code: item.part_service_code || '',
      type: item.type || 'product'
    }));

    const newInvoiceData = {
      companyName: proposal.company_name || companyDetails?.companyName || "Your Company Name",
      companyAddress: proposal.company_address || companyDetails?.companyAddress || "123 Business Rd, City, Country",
      companyPhone: proposal.company_phone || companyDetails?.companyPhone || "+123456789",
      companyEmail: proposal.company_email || companyDetails?.companyEmail || "info@company.com",
      companyLogo: proposal.company_logo || companyDetails?.companyLogo || null,
      clientName: proposal.client_name || "",
      clientAddress: proposal.client_address || "",
      clientPhone: proposal.client_phone || "",
      clientEmail: proposal.client_email || "",
      invoiceNumber: proposal.proposal_number || `PROP-${Date.now()}`,
      date: proposal.date || new Date().toISOString().split("T")[0],
      dueDate: proposal.due_date || "",
      items: transformedItems,
      notes: proposal.notes || "",
      template: template,
    };

    console.log('📝 Setting invoice data:', newInvoiceData);
    setInvoiceData(newInvoiceData);
    
    setCurrentProposalId(proposal.id);
    setShowProposalsModal(false);
    
    Swal.fire({
      icon: 'success',
      title: 'Proposal Loaded!',
      text: 'Proposal has been loaded successfully. You can now edit it.',
      timer: 2000
    });
  };

  // View Proposal
  const viewProposal = (proposal) => {
    setViewingProposal(proposal);
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
    const newInvoiceData = {
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
      template: invoiceData.template || TEMPLATES[0], // Keep current template or default
    };
    
    setInvoiceData(newInvoiceData);
    setCurrentProposalId(null);
    
    Swal.fire({
      icon: 'success',
      title: 'New Proposal Created!',
      text: 'You can now create a new proposal.',
      timer: 2000
    });
  };

  // Enhanced Print Proposal with Background Images
  const printProposal = () => {
    if (invoiceData.items.length === 0) {
      alert('Please add items to the proposal before printing.');
      return;
    }

    const invoicePages = document.querySelectorAll(".invoice-page, .explanation-page");
    
    if (invoicePages.length === 0) {
      alert('No proposal content found to print. Please generate the proposal first.');
      return;
    }

    const printWindow = window.open('', '_blank');
    
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proposal - ${invoiceData.invoiceNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-page { 
            width: 500px; 
            min-height: 700px; 
            margin: 0 auto 20px auto; 
            padding: 20px; 
            position: relative;
            page-break-after: always;
            background-size: cover;
            background-repeat: no-repeat;
          }
          .explanation-page { 
            width: 500px; 
            min-height: 700px; 
            margin: 0 auto 20px auto; 
            padding: 20px; 
            position: relative;
            page-break-after: always;
            background-size: cover;
            background-repeat: no-repeat;
          }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .totals { text-align: right; margin-top: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          @media print {
            body { margin: 0; padding: 0; }
            .invoice-page, .explanation-page { 
              page-break-after: always; 
              margin: 0 auto;
            }
          }
        </style>
      </head>
      <body>
    `;

    invoicePages.forEach((page, index) => {
      // Get the background image from the original page
      const computedStyle = window.getComputedStyle(page);
      const backgroundImage = computedStyle.backgroundImage;
      
      // Extract the image URL from the background-image property
      const imageUrl = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
      
      // Create a new div with the same content and background
      const pageContent = page.innerHTML;
      
      printContent += `
        <div class="${page.classList.contains('invoice-page') ? 'invoice-page' : 'explanation-page'}" 
             style="background-image: url('${imageUrl}'); font-family: ${computedStyle.fontFamily}; font-size: ${computedStyle.fontSize}; color: ${computedStyle.color}; text-align: ${computedStyle.textAlign};">
          ${pageContent}
        </div>
      `;
    });

    printContent += `
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        // printWindow.close(); // Uncomment if you want to auto-close after printing
      }, 500);
    };
  };

  // Handle full client company form submission
  const handleCreateClientFromFullForm = async (formData) => {
    try {
      const tenantId = localStorage.getItem("tenant_id");
      if (!tenantId) {
        alert("Tenant ID not found. Please login again.");
        return;
      }

      const finalData = {
        name: formData.name || invoiceData.clientName,
        contact: formData.contact || invoiceData.clientName,
        email: formData.email || invoiceData.clientEmail,
        phone: formData.phone || invoiceData.clientPhone,
        address_line1: formData.address_line1 || invoiceData.clientAddress,
        industry: formData.industry,
        website: formData.website,
        registration_number: formData.registration_number,
        tax_id: formData.tax_id,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postal_code,
        support_email: formData.support_email,
        notes: formData.notes,
        logo: formData.logo
      };

      const apiFormData = new FormData();
      Object.entries(finalData).forEach(([key, value]) => {
        if (value !== null && value !== "" && value !== undefined) {
          apiFormData.append(key, value);
        }
      });
      apiFormData.append("tenant", tenantId);

      const newClient = await addClientCompany(apiFormData);
      
      setInvoiceData(prev => ({
        ...prev,
        clientName: finalData.name,
        clientEmail: finalData.email,
        clientPhone: finalData.phone,
        clientAddress: finalData.address_line1
      }));

      await fetchClients();
      
      setShowClientCompanyModal(false);
      
      alert('Client company created successfully with full details!');
    } catch (err) {
      console.error('Error creating client:', err);
      alert(err.response?.data?.detail || err.message || 'Failed to create client company');
    }
  };

  // Refresh all data - Updated to include templates
  const refreshData = () => {
    fetchProducts();
    fetchServices();
    fetchClients();
    fetchTemplates(); // Add templates refresh
    fetchCompanyDetails();
    fetchProposals();
  };

  // Load data on component mount - Updated to include templates
  useEffect(() => {
    fetchProducts();
    fetchServices();
    fetchClients();
    fetchTemplates(); // Add templates fetch
    fetchCompanyDetails();
    fetchProposals();
  }, []);

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

  // Item management functions
  const addItem = (item) => setInvoiceData({ 
    ...invoiceData, 
    items: [...invoiceData.items, { 
      ...item, 
      qty: 1, 
      gst: 10,
      description: item.description || "",
      hsn_sac: item.hsn_sac || "",
      part_service_code: item.part_service_code || ""
    }] 
  });
  
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

  // ADD THE MISSING chunkItems FUNCTION
  const chunkItems = (items, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const itemChunks = chunkItems(invoiceData.items, 10);

  const downloadInvoice = async () => {
    if (invoiceData.items.length === 0) {
      alert('Please add items to the proposal before downloading.');
      return;
    }

    const invoicePages = document.querySelectorAll(".invoice-page, .explanation-page");
    
    if (invoicePages.length === 0) {
      alert('No proposal content found to download. Please generate the proposal first.');
      return;
    }

    const pdf = new jsPDF("p", "pt", "a4");
    for (let i = 0; i < invoicePages.length; i++) {
      const canvas = await html2canvas(invoicePages[i], { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
      if (i < invoicePages.length - 1) pdf.addPage();
    }
    pdf.save(`${invoiceData.invoiceNumber}.pdf`);
  };

  // Get current style for rendering
  const style = invoiceData.template?.style || TEMPLATES[0].style;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Simplified Sidebar */}
      <div className="border-end p-3" style={{ width: 280, background: "white" }}>
        {/* Template Section */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6>Template</h6>
            {loading.templates && <Loader2 size={14} className="spinner" />}
          </div>
          
          {invoiceData.template ? (
            <div className="card mb-2">
              <div className="card-body p-2 text-center">
                <div className="mb-1">
                  <img 
                    src={invoiceData.template.imageUrl || `/proposal-templates/${invoiceData.template.file}`} 
                    alt={invoiceData.template.name}
                    style={{ 
                      width: '100%', 
                      height: '60px', 
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                    onError={(e) => {
                      e.target.src = '/proposal-templates/default-template.jpg';
                    }}
                  />
                </div>
                <small className="d-block text-muted">{invoiceData.template.name}</small>
              </div>
            </div>
          ) : null}
          
          <button 
            className="btn btn-outline-primary w-100 btn-sm"
            onClick={() => setShowTemplateModal(true)}
          >
            Change Template
          </button>
        </div>

        {/* Company Section */}
        {/* <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6>Company</h6>
            {loading.company && <Loader2 size={14} className="spinner" />}
          </div>

          {companyDetails && (
            <div className="card mb-2">
              <div className="card-body p-2">
                <div className="d-flex align-items-center mb-1">
                  {companyDetails.companyLogo && (
                    <img 
                      src={companyDetails.companyLogo} 
                      alt="Logo" 
                      style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                      className="me-2 rounded"
                    />
                  )}
                  <div className="flex-grow-1">
                    <small className="d-block fw-bold">{companyDetails.companyName}</small>
                  </div>
                </div>
                <button 
                  className="btn btn-outline-primary w-100 btn-sm"
                  onClick={() => setShowCompanySettings(true)}
                >
                  Edit Company
                </button>
              </div>
            </div>
          )}
        </div> */}

        {/* Proposal Controls */}
        <div className="mb-4">
          <h6 className="mb-2">Proposal</h6>
          
          <div className="d-grid gap-1">
            <button 
              className="btn btn-success btn-sm"
              onClick={saveProposalHandler}
              disabled={loading.savingProposal || invoiceData.items.length === 0 || !invoiceData.template}
            >
              {loading.savingProposal ? (
                <>
                  <Loader2 size={12} className="spinner me-1" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={12} className="me-1" />
                  {currentProposalId ? 'Update' : 'Save'}
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
              <List size={12} className="me-1" />
              My Proposals ({savedProposals.length})
            </button>
            
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={createNewProposal}
            >
              <FileText size={12} className="me-1" />
              New Proposal
            </button>
          </div>
        </div>

        {/* Products & Services */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6>Products & Services</h6>
            <div className="form-check form-check-inline">
              <input type="checkbox" checked={showProduct} onChange={() => setShowProduct(!showProduct)} id="productCheckbox" className="form-check-input" />
              <label htmlFor="productCheckbox" className="form-check-label small">Products</label>
            </div>
            <div className="form-check form-check-inline">
              <input type="checkbox" checked={showService} onChange={() => setShowService(!showService)} id="serviceCheckbox" className="form-check-input" />
              <label htmlFor="serviceCheckbox" className="form-check-label small">Services</label>
            </div>
          </div>

          {showProduct && (
            <>
              {products.map((p) => (
                <div key={p.id} className="d-flex align-items-center mb-1">
                  <button 
                    className="btn btn-outline-success flex-grow-1 text-start btn-sm" 
                    onClick={() => addItem(p)}
                    style={{ whiteSpace: 'normal', fontSize: '12px' }}
                  >
                    {p.name} - ${p.price}
                  </button>
                </div>
              ))}
              
              <button 
                className="btn btn-success w-100 btn-sm mb-2" 
                onClick={() => handleCreateProductService('product')}
                disabled={creatingProductService}
              >
                <Plus size={12} className="me-1" />
                New Product
              </button>
            </>
          )}

          {showService && (
            <>
              {services.map((s) => (
                <div key={s.id} className="d-flex align-items-center mb-1">
                  <button 
                    className="btn btn-outline-info flex-grow-1 text-start btn-sm" 
                    onClick={() => addItem(s)}
                    style={{ whiteSpace: 'normal', fontSize: '12px' }}
                  >
                    {s.name} - ${s.price}
                  </button>
                </div>
              ))}
              
              <button 
                className="btn btn-info w-100 btn-sm" 
                onClick={() => handleCreateProductService('service')}
                disabled={creatingProductService}
              >
                <Plus size={12} className="me-1" />
                New Service
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Template Status Alert */}
        {!invoiceData.template && (
          <div className="alert alert-warning mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <span>Please select a template to continue.</span>
              <button 
                className="btn btn-warning btn-sm"
                onClick={() => setShowTemplateModal(true)}
              >
                Select Template
              </button>
            </div>
          </div>
        )}

        {/* Simplified Client Form */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Client Information</h6>
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
                          placeholder="Search clients..."
                          value={clientSearch}
                          onChange={(e) => handleClientSearch(e.target.value)}
                          onFocus={() => setShowClientDropdown(true)}
                        />
                      </div>
                      
                      {/* Client Dropdown */}
                      {showClientDropdown && filteredClients.length > 0 && (
                        <div 
                          className="position-absolute top-100 start-0 end-0 bg-white border mt-1 rounded shadow-lg z-3"
                          style={{ maxHeight: '150px', overflow: 'auto' }}
                        >
                          {filteredClients.map(client => (
                            <div
                              key={client.id}
                              className="p-2 border-bottom hover-bg-light cursor-pointer"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleClientSelect(client)}
                            >
                              <div className="fw-bold small">{client.name}</div>
                              <small className="text-muted d-block">
                                {client.email}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-4 d-flex align-items-end gap-1">
                    <button
                      type="button"
                      className="btn btn-success flex-fill btn-sm"
                      onClick={createClientFromCurrentData}
                      disabled={loading.creatingClient || !invoiceData.clientName || !invoiceData.clientEmail}
                    >
                      {loading.creatingClient ? <Loader2 size={12} className="spinner" /> : 'Save Client'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Proposal Number</label>
            <input type="text" className="form-control" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}  readOnly/>
            
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
                <th>Description</th>
                <th>HSN/SAC</th>
                <th>Part/Service Code</th>
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
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      value={item.name} 
                      onChange={(e) => updateItem(index, "name", e.target.value)} 
                    />
                  </td>
                  <td style={style.tableCell}>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      value={item.description || ""} 
                      onChange={(e) => updateItem(index, "description", e.target.value)} 
                      placeholder="Item description"
                    />
                  </td>
                  <td style={style.tableCell}>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      value={item.hsn_sac || ""} 
                      onChange={(e) => updateItem(index, "hsn_sac", e.target.value)} 
                      placeholder="HSN/SAC code"
                    />
                  </td>
                  <td style={style.tableCell}>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      value={item.part_service_code || ""} 
                      onChange={(e) => updateItem(index, "part_service_code", e.target.value)} 
                      placeholder="Part/Service code"
                    />
                  </td>
                  <td style={style.tableCell}>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      value={item.qty || ""} 
                      onChange={(e) => updateItem(index, "qty", e.target.value)} 
                    />
                  </td>
                  <td style={style.tableCell}>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      value={item.price || ""} 
                      onChange={(e) => updateItem(index, "price", e.target.value)} 
                    />
                  </td>
                  <td style={style.tableCell}>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      value={item.gst || 0} 
                      onChange={(e) => updateItem(index, "gst", e.target.value)} 
                    />
                  </td>
                  <td style={style.tableCell}>
                    ${((item.qty || 0) * (item.price || 0) * (1 + (item.gst || 0) / 100)).toFixed(2)}
                  </td>
                  <td>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}>
                      <Trash2 size={12} />
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
            rows="2"
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
              disabled={loading.savingProposal || invoiceData.items.length === 0 || !invoiceData.template}
            >
              {loading.savingProposal ? (
                <>
                  <Loader2 size={14} className="spinner me-2" />
                  {currentProposalId ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={14} className="me-2" />
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
              <List size={14} className="me-2" />
              My Proposals
            </button>

            <button 
              className="btn btn-info"
              onClick={printProposal}
              disabled={invoiceData.items.length === 0 || !invoiceData.template}
            >
              <Printer size={14} className="me-2" />
              Print
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={downloadInvoice}
              disabled={!invoiceData.template}
            >
              Download PDF
            </button>

            <button 
              className="btn btn-warning"
              onClick={() => setShowTemplateModal(true)}
            >
              Change Template
            </button>
          </div>
        </div>

        {/* Default Template Preview */}
        {invoiceData.items.length === 0 && (
          <>
            <div className="invoice-page" style={{
              border: "1px solid #ccc",
              width: "500px",
              minHeight: "700px",
              margin: "30px auto",
              backgroundImage: invoiceData.template ? `url(${invoiceData.template.imageUrl || `/proposal-templates/${invoiceData.template.file}`})` : 'none',
              backgroundColor: invoiceData.template ? 'transparent' : '#f8f9fa',
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
              <p style={{ textAlign: "center", marginTop: 50 }}>
                {invoiceData.template ? 'Your proposal preview will appear here' : 'Please select a template first'}
              </p>
            </div>

            <div className="explanation-page" style={{
              border: "1px solid #ccc",
              width: "500px",
              minHeight: "700px",
              margin: "30px auto",
              backgroundImage: invoiceData.template ? `url(${invoiceData.template.imageUrl || `/proposal-templates/${invoiceData.template.file}`})` : 'none',
              backgroundColor: invoiceData.template ? 'transparent' : '#f8f9fa',
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
              <p style={{ textAlign: "center", color: "#888", marginTop: 50 }}>
                {invoiceData.template ? 'No items added yet' : 'Please select a template first'}
              </p>
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
              backgroundImage: invoiceData.template ? `url(${invoiceData.template.imageUrl || `/proposal-templates/${invoiceData.template.file}`})` : 'none',
              backgroundColor: invoiceData.template ? 'transparent' : '#f8f9fa',
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
                      <th style={{ padding: 8, border: "1px solid #ccc" }}>HSN/SAC</th>
                      <th style={{ padding: 8, border: "1px solid #ccc" }}>Part/Service Code</th>
                      <th style={{ padding: 8, border: "1px solid #ccc" }}>Qty</th>
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
                          <td style={{ padding: 8, border: "1px solid #ccc" }}>{item.hsn_sac || "-"}</td>
                          <td style={{ padding: 8, border: "1px solid #ccc" }}>{item.part_service_code || "-"}</td>
                          <td style={{ padding: 8, border: "1px solid #ccc", textAlign: "center" }}>{item.qty}</td>
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
            backgroundImage: invoiceData.template ? `url(${invoiceData.template.imageUrl || `/proposal-templates/${invoiceData.template.file}`})` : 'none',
            backgroundColor: invoiceData.template ? 'transparent' : '#f8f9fa',
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

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <TemplateSelectionModal
          show={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          templates={templates}
          onSelectTemplate={handleTemplateSelect}
          currentTemplate={invoiceData.template}
          loading={loading.templates}
        />
      )}

      {/* Proposals Modal */}
      {showProposalsModal && (
        <ProposalsModal
          proposals={savedProposals}
          loading={loading.proposals}
          onLoadProposal={loadProposal}
          onDeleteProposal={deleteProposalHandler}
          onViewProposal={viewProposal}
          onClose={() => setShowProposalsModal(false)}
        />
      )}

      {/* View Proposal Modal */}
      {viewingProposal && (
        <ViewProposalModal
          proposal={viewingProposal}
          onClose={() => setViewingProposal(null)}
        />
      )}

      {/* Client Company Modal */}
      {showClientCompanyModal && (
        <ClientCompanyModal
          show={showClientCompanyModal}
          onClose={() => setShowClientCompanyModal(false)}
          onSave={handleCreateClientFromFullForm}
          initialData={invoiceData}
          loading={loading.creatingClient}
        />
      )}

      {/* Product/Service Creation Modal */}
      {showProductServiceModal && (
        <ProductServiceModal
          show={showProductServiceModal}
          onClose={() => setShowProductServiceModal(false)}
          onSave={handleSaveProductService}
          type={currentProductServiceType}
          loading={creatingProductService}
        />
      )}
    </div>
  );
}