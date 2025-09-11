"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./client-admin-dashboard.css";
import UserManagement from "../user-management/user-management";
import Invoices from "../invoices/invoices";
import CreateInvoicePage from "../create-invoice/create-invoices";

export default function ClientAdminDashboard() {
  const [activePage, setActivePage] = useState("Invoices");

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
      case "Launchpad":
        return <h3 className="fw-bold"> Launchpad </h3>;
      case "Dashboard":
        return <h3 className="fw-bold">📊 Dashboard Overview</h3>;
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
      case "Invoice Proposal":
        return <h3 className="fw-bold">Invoice Proposal</h3>;
      case "Settings":
        return <h3 className="fw-bold">⚙️ Settings</h3>;
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
            "Launchpad",
            "Dashboard",
            "User management",
            "Invoices",
            "Receipts",
            "Invoice Proposal",
            "Accounting",
            "Banking",
            "Payroll",
            "Help",
            "Notifications",
            "Settings",
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
      </aside>

      {/* Main Content */}
      <main className="content flex-grow-1 p-4">{renderContent()}</main>
    </div>
  );
}
