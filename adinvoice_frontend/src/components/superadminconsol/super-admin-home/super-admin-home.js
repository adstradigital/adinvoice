"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchSuperAdminAnalytics } from "../../../../Api/api_superadmin";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SuperAdminDashboard = () => {
  const [merchantCount, setMerchantCount] = useState(0);
  const [merchantApprovalCount, setMerchantApprovalCount] = useState(0);
  const [commonEnquiryCount, setCommonEnquiryCount] = useState(0);
  const [merchantIssueReportCount, setMerchantIssueReportCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      const data = await fetchSuperAdminAnalytics();
      if (data.success) {
        setMerchantCount(data.merchant_count || 0);
        setMerchantApprovalCount(data.merchant_approval_count || 0);
        setCommonEnquiryCount(data.common_enquiry_count || 0);
        setMerchantIssueReportCount(data.merchant_issue_report_count || 0);
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const chartData = {
    labels: ["Merchants", "Approvals", "Enquiries", "Issue Reports"],
    datasets: [
      {
        label: "Count",
        data: [
          merchantCount,
          merchantApprovalCount,
          commonEnquiryCount,
          merchantIssueReportCount,
        ],
        backgroundColor: ["#0d6efd", "#198754", "#ffc107", "#dc3545"],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Super Admin Dashboard Analytics", font: { size: 18 } },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  if (loading) return <p className="text-center mt-5">Loading dashboard...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

  return (
    <div className="container py-5">
      <h1 className="text-3xl font-bold mb-4">Super Admin Dashboard</h1>

      {/* Metric Cards */}
      <div className="row mb-5 g-4">
        <div className="col-md-3">
          <div className="card shadow-sm rounded border-0 text-center">
            <div className="card-body">
              <h5 className="card-title text-primary">Merchants</h5>
              <p className="card-text fs-2">{merchantCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm rounded border-0 text-center">
            <div className="card-body">
              <h5 className="card-title text-success">Approvals</h5>
              <p className="card-text fs-2">{merchantApprovalCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm rounded border-0 text-center">
            <div className="card-body">
              <h5 className="card-title text-warning">Enquiries</h5>
              <p className="card-text fs-2">{commonEnquiryCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm rounded border-0 text-center">
            <div className="card-body">
              <h5 className="card-title text-danger">Issue Reports</h5>
              <p className="card-text fs-2">{merchantIssueReportCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Notifications */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card p-3 shadow-sm rounded" style={{ height: "450px" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 shadow-sm rounded" style={{ height: "450px", overflowY: "auto" }}>
            <h5 className="card-title mb-3">Latest Notifications</h5>
            <div className="d-flex flex-column gap-3">
              {notifications.length === 0 && <p className="text-muted">No notifications found.</p>}
              {notifications.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-light border-start border-4 border-primary rounded shadow-sm"
                >
                  <small className="text-muted">{item.sender_type || "Admin"}</small>
                  <p className="mb-0 mt-1">{item.message}</p>
                  <small className="text-muted">{new Date(item.created_at).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
