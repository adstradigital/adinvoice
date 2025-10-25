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
import { fetchClientAdminAnalytics } from "../../../../Api/api_clientadmin";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [proposalCount, setProposalCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [receiptCount, setReceiptCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analyticsData = await fetchClientAdminAnalytics();

        if (analyticsData?.success) {
          setProposalCount(analyticsData.proposal_count || 0);
          setInvoiceCount(analyticsData.invoice_count || 0);
          setReceiptCount(analyticsData.receipt_count || 0);
          setNotifications(analyticsData.notification || []);
        }
      } catch (err) {
        setError("Failed to load analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const chartData = {
    labels: ["Proposals", "Invoices", "Receipts"],
    datasets: [
      {
        label: "Overall Count",
        data: [proposalCount, invoiceCount, receiptCount],
        backgroundColor: ["#1d4ed8", "#16a34a", "#f59e0b"],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows card height to control chart
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Overall Analytics",
        font: { size: 18 },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Metric Cards */}
      <div className="row mb-6">
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Proposals</h5>
              <p className="card-text fs-3">{proposalCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Invoices</h5>
              <p className="card-text fs-3">{invoiceCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-warning shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Receipts</h5>
              <p className="card-text fs-3">{receiptCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-info shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Clients</h5>
              <p className="card-text fs-3">{notifications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Notifications Half & Half */}
      <div className="row">
        {/* Left: Chart */}
        <div className="col-md-6 mb-4">
          <div className="card p-3 shadow-sm" style={{ height: "450px" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Right: Latest Notifications */}
        <div className="col-md-6 mb-4">
          <div className="card p-3 shadow-sm" style={{ height: "450px", overflowY: "auto" }}>
            <h5 className="card-title mb-3">Latest Notifications</h5>
            <div className="d-flex flex-column gap-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-100 border-start border-4 border-primary rounded shadow-sm"
                  >
                    <small className="text-muted">{item.sender_type || "Admin"}</small>
                    <p className="mb-0 mt-1">{item.message}</p>
                  </div>
                ))
              ) : (
                <p>No notifications available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default Dashboard;
