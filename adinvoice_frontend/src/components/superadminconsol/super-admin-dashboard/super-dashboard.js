"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaHome,
  FaUser,
  FaChartBar,
  FaBell,
  FaUsers,
  FaStore,
  FaExclamationTriangle,
  FaPaperPlane,
  FaCheckCircle,
  FaFileInvoice,
  FaQuestionCircle,
} from "react-icons/fa";

import AnalyticsPage from "../analytics-and-reports/analytics";
import UserManagement from "../user-management/user-management";
import MerchantManagement from "../merchant-management/merchant-management";
import MerchantIssueReports from "../merchent-issue-reports/merchant-issue-reports";
import BulkNotificationReports from "../bulk-notification-reports/bulk-notification-reports";
import BulkNotificationSender from "../bulk-notification-sender/bulk-notification-sender";
import MerchantApproval from "../merchant-approvel/merchchant-approval";
import InvoiceTemplateImageManage from "../invoice-template-image-manage/invoice-template-image-manage";
import CommonEnquiries from "../common-enqueries/common-enqueries";
import SuperAdminHome from "../super-admin-home/super-admin-home";

import "./super-dashboard.css";

// A simple session check utility
const checkSession = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return { expired: true, message: "Session expired. Please login again." };
  }
  return { expired: false };
};

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("Home");
  const [sessionMessage, setSessionMessage] = useState("");
  const router = useRouter();

  const menuItems = [
    { name: "Home", icon: <FaHome /> },
    { name: "Analytics", icon: <FaChartBar /> },
    { name: "User Management", icon: <FaUsers /> },
    { name: "Merchant Management", icon: <FaStore /> },
    { name: "Merchant Issue Reports", icon: <FaExclamationTriangle /> },
    { name: "Bulk Notification Reports", icon: <FaBell /> },
    { name: "Bulk Notification Sender", icon: <FaPaperPlane /> },
    { name: "Merchant Approval", icon: <FaCheckCircle /> },
    { name: "Invoice Template Image Manage", icon: <FaFileInvoice /> },
    { name: "Common Enquiries", icon: <FaQuestionCircle /> },
  ];

  // Check session on component mount
  useEffect(() => {
    const session = checkSession();
    if (session.expired) {
      setSessionMessage(session.message);
      localStorage.removeItem("access_token");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/super-admin-signin");
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "Home":
        return <SuperAdminHome />;
      case "Analytics":
        return <AnalyticsPage />;
      case "User Management":
        return <UserManagement />;
      case "Merchant Management":
        return <MerchantManagement />;
      case "Merchant Issue Reports":
        return <MerchantIssueReports />;
      case "Bulk Notification Reports":
        return <BulkNotificationReports />;
      case "Bulk Notification Sender":
        return <BulkNotificationSender />;
      case "Merchant Approval":
        return <MerchantApproval />;
      case "Invoice Template Image Manage":
        return <InvoiceTemplateImageManage />;
      case "Common Enquiries":
        return <CommonEnquiries />;
      default:
        return <div className="content-card">Select a menu item.</div>;
    }
  };

  // Show session expired message if token is missing
  if (sessionMessage) {
    return (
      <div className="session-expired">
        <h3>{sessionMessage}</h3>
        <button onClick={handleLogout}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="sidebar-title">My Dashboard</h2>
        {menuItems.map((item) => (
          <div
            key={item.name}
            onClick={() => setActiveMenu(item.name)}
            className={`menu-item ${activeMenu === item.name ? "active" : ""}`}
          >
            <div className="icon">{item.icon}</div>
            <span>{item.name}</span>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="content-area">
        {/* Logout button at top-right */}
        <div className="logout-container">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
