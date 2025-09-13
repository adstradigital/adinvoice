"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./client-admin-dashboard.css";
import DashboardPage from "../dashboard/dashboard";
import UserManagement from "../user-management/user-management";
import Invoices from "../invoices/invoices";
import CreateInvoicePage from "../create-invoice/create-invoices";
import InvoiceProposal from "@/components/proposel/page";
import Accounts from "@/components/adminconsole/accounting/page";
import Banking from "@/components/adminconsole/Banking/page";
import Payroll from "@/components/payroll/page";
import Help from "@/components/help/page";
import ReportsAnalytics from "@/components/report-and-analytics/reportandanalytics";
import SettingsPage from "../settings/settingspage";
import NotificationsPage from "@/components/notifications/notificationspage";
import TrashBin from "../trashbin/trashbin";
import SupportPage from "../support/support";
import ClientCompanies from "../client-companies/clientcompaniespage";
import ProductsServices from "../products-and-service-manage/products-and-service";
import CompanyDetailPage from "../company-details/company-details";
import ReceiptsPage from "../reciepts/reciepts";

export default function ClientAdminDashboard() {
  // ✅ Default page set to Dashboard
  const [activePage, setActivePage] = useState("Dashboard");

  // Shared state for invoices
  const [invoices, setInvoices] = useState([
    {
      number: "INV842002",
      status: "Draft",
      date: "2021-07-27",
      customer: "Kim Girocking",
      total: 152,
      due: 0,
    },
    {
      number: "INV842004",
      status: "Paid",
      date: "2021-07-25",
      customer: "Jackson Balalala",
      total: 200,
      due: 0,
    },
  ]);

  const renderContent = () => {
    switch (activePage) {
      case "Dashboard":
        return <DashboardPage />;
      case "User management":
        return <UserManagement />;
      case "Invoices":
        return (
          <Invoices
            invoices={invoices}
            setInvoices={setInvoices}
            setActivePage={setActivePage}
          />
        );
      case "create-invoices":
        return (
          <CreateInvoicePage
            invoices={invoices}
            setInvoices={setInvoices}
            setActivePage={setActivePage}
          />
        );
      case "Proposal":
        return <InvoiceProposal />;
      case "Company details":
        return <CompanyDetailPage />;
      case "Receipts":
        return <ReceiptsPage />
      case "Banking":
        return <Banking />;
      case "Accounting":
        return <Accounts />;
      case "Payroll":
        return <Payroll />;
      case "Settings":
        return <SettingsPage />;
      case "Notifications":
        return <NotificationsPage />;
      case "Support":
        return <SupportPage />;
      case "Trashbin":
        return <TrashBin />;
      case "Client Companies":
        return <ClientCompanies />;
      case "Products & Services":
        return <ProductsServices />;
      case "Report & Analytics":
        return <ReportsAnalytics />;
      // ✅ Optional: Receipts placeholder
      case "Receipts":
        return <h3 className="fw-bold">Receipts Page (Coming Soon)</h3>;
      default:
        return <h3 className="fw-bold">{activePage}</h3>;
    }
  };

  return (
    <div className="dashboard d-flex">
      {/* Sidebar */}
      <aside className="sidebar p-3">
        <h4 className="logo">Invoice.UI</h4>
        <ul className="nav flex-column">
          {[
            "Dashboard",
            "User management",
            "Invoices",
            "Company details",
            "Receipts",
            "Proposal",
            "Report & Analytics",
            "Client Companies",
            "Products & Services",
            "Notifications",
            "Settings",
            "Trashbin",
            "Support",
          ].map((item) => (
            <li key={item}>
              <button
                className={`nav-link w-100 text-start btn ${
                  activePage === item ? "bg-dark text-white" : "btn-light"
                }`}
                onClick={() => setActivePage(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
        {/* Enhanced Footer */}
  <div className="sidebar-footer text-center">
    <p>Designed & Developed by</p>
    <h6>Adstra Digital</h6>
  </div>

      </aside>
      

      {/* Main Content */}
      <main className="content flex-grow-1 p-4">{renderContent()}</main>
    </div>
    
  );
}
