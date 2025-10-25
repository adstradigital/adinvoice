"use client";
import React, { useEffect, useState } from "react";
import { fetchSuperAdminAnalytics } from "../../../../Api/api_superadmin";

const SuperAdminDashboard = () => {
  const [merchantCount, setMerchantCount] = useState(0);
  const [merchantApprovalCount, setMerchantApprovalCount] = useState(0);
  const [commonEnquiryCount, setCommonEnquiryCount] = useState(0);
  const [merchantIssueReportCount, setMerchantIssueReportCount] = useState(0);

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

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      {/* Super Admin Main Metrics */}
      <div className="row mb-6">
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-secondary shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Merchants</h5>
              <p className="card-text fs-3">{merchantCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Merchant Approvals</h5>
              <p className="card-text fs-3">{merchantApprovalCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-warning shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Common Enquiries</h5>
              <p className="card-text fs-3">{commonEnquiryCount}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card text-white bg-danger shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Merchant Issues</h5>
              <p className="card-text fs-3">{merchantIssueReportCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
