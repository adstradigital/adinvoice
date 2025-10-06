"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import "./client-admin-dashboard.css";

// Import subpages
import DashboardPage from "../dashboard/dashboard";
import UserManagement from "../user-management/user-management";
import Invoices from "../invoices/invoices";
import CreateInvoicePage from "../create-invoice/create-invoices";
import InvoiceProposal from "@/components/proposal/page";
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
import { jwtDecode } from "jwt-decode";

export default function ClientAdminDashboard() {
  const router = useRouter();

  // ✅ Protect route
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/signin");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token expired
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/signin");
      }
    } catch (err) {
      console.error("Invalid token", err);
      router.push("/signin");
    }
  }, [router]);

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

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/signin");
  };

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
        return <ReceiptsPage />;
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

          {/* Logout Button */}
          <li className="mt-3">
            <button
              className="btn btn-danger w-100"
              onClick={handleLogout}
            >
              Logout
            </button>
          </li>
        </ul>

        {/* Sidebar Footer */}
        <div className="sidebar-footer text-center mt-auto">
          <p>Designed & Developed by</p>
          <h6>Adstra Digital</h6>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content flex-grow-1 p-4">{renderContent()}</main>
    </div>
  );
}
