"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Bell,
  FileText,
  CheckCircle,
  Clock,
  MapPin,
  FileCheck,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  // ✅ Dummy States (no axios)
  const [company, setCompany] = useState(null);
  const [leftChartData, setLeftChartData] = useState([]);
  const [rightChartData, setRightChartData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load dummy data on mount
  useEffect(() => {
    const dummyCompany = {
      name: "Tech Solutions Ltd.",
      contact: "John Doe",
      clients: 120,
      totalInvoices: 350,
      location: "New York, USA",
      taxId: "TX123456789",
    };

    const dummyLeftChart = [
      { name: "Proposals", value: 15 },
      { name: "Invoices", value: 25 },
      { name: "Receipts", value: 10 },
      { name: "Quantity", value: 40 },
    ];

    const dummyRightChart = [
      { name: "Pending", value: 8 },
      { name: "Completed", value: 20 },
      { name: "Partial", value: 5 },
    ];

    const dummyNotifications = [
      { message: "Invoice INV-001 has been paid", type: "success" },
      { message: "New proposal created", type: "info" },
      { message: "Payment pending for INV-005", type: "warning" },
    ];

    setCompany(dummyCompany);
    setLeftChartData(dummyLeftChart);
    setRightChartData(dummyRightChart);
    setNotifications(dummyNotifications);
    setLoading(false);
  }, []);

  const getBadgeColor = (type) => {
    switch (type) {
      case "success":
        return "bg-success text-white";
      case "info":
        return "bg-info text-white";
      case "warning":
        return "bg-warning text-dark";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4 text-primary">Dashboard Overview</h2>

      {loading ? (
        <p className="text-muted">Loading dashboard data...</p>
      ) : (
        <div className="row g-4 align-items-stretch">
          {/* Left Column */}
          <div className="col-lg-6 d-flex flex-column gap-4">
            {/* Company Details Card */}
            <div className="card shadow-sm p-4 h-100">
              <h5 className="mb-3">Company Details</h5>
              {company ? (
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <FileText className="me-2 text-primary" />{" "}
                    <strong>Name:</strong> {company.name}
                  </div>
                  <div className="col-md-6 mb-2">
                    <Bell className="me-2 text-secondary" />{" "}
                    <strong>Contact:</strong> {company.contact}
                  </div>
                  <div className="col-md-6 mb-2">
                    <CheckCircle className="me-2 text-success" />{" "}
                    <strong>Clients:</strong> {company.clients}
                  </div>
                  <div className="col-md-6 mb-2">
                    <Clock className="me-2 text-warning" />{" "}
                    <strong>Total Invoices:</strong> {company.totalInvoices}
                  </div>
                  <div className="col-md-6 mb-2">
                    <MapPin className="me-2 text-info" />{" "}
                    <strong>Location:</strong> {company.location}
                  </div>
                  <div className="col-md-6 mb-2">
                    <FileCheck className="me-2 text-danger" />{" "}
                    <strong>Tax ID:</strong> {company.taxId}
                  </div>
                </div>
              ) : (
                <p className="text-muted">No company details found</p>
              )}
            </div>

            {/* Left Chart */}
            <div className="card shadow-sm p-3">
              <h5 className="mb-3">Proposals, Invoices, Receipts, Quantity</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={leftChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
              <div className="d-flex gap-2 mt-3 flex-wrap">
                <button className="btn btn-primary btn-sm">Create Proposal</button>
                <button className="btn btn-secondary btn-sm">Add Invoice</button>
                <button className="btn btn-info btn-sm text-white">
                  Add Receipt
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-6 d-flex flex-column gap-4">
            {/* Latest Notifications */}
            <div className="card shadow-sm p-3 h-100">
              <h5 className="mb-3">Latest Notifications</h5>
              <ul className="list-group list-group-flush">
                {notifications.length > 0 ? (
                  notifications.map((n, idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {n.message}
                      <span
                        className={`badge rounded-pill ${getBadgeColor(n.type)}`}
                      >
                        {n.type.toUpperCase()}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-muted text-center">
                    No notifications found
                  </li>
                )}
              </ul>
              <button
                className="btn btn-outline-primary btn-sm mt-3"
                onClick={() => router.push("/notifications")}
              >
                View More
              </button>
            </div>

            {/* Payments Chart */}
            <div className="card shadow-sm p-3">
              <h5 className="mb-3">Payments Status</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={rightChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#FF9800" name="Pending" />
                  <Bar dataKey="value" fill="#4CAF50" name="Completed" />
                  <Bar dataKey="value" fill="#2196F3" name="Partial" />
                </BarChart>
              </ResponsiveContainer>
              <div className="d-flex gap-2 mt-3 flex-wrap">
                <button className="btn btn-warning btn-sm">View Pending</button>
                <button className="btn btn-success btn-sm">View Completed</button>
                <button className="btn btn-info btn-sm text-white">
                  View Partial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
