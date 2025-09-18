"use client";
import { useState } from "react";
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
import "./super-dashboard.css";
import AnalyticsPage from "../analytics-and-reports/analytics";
import UserManagement from "../user-management/user-management";
import MerchantManagement from "../merchant-management/merchant-management";
import MerchantIssueReports from "../merchent-issue-reports/merchant-issue-reports";
import BulkNotificationReports from "../bulk-notification-reports/bulk-notification-reports";
import BulkNotificationSender from "../bulk-notification-sender/bulk-notification-sender";
import MerchantApproval from "../merchant-approvel/merchchant-approval";
import InvoiceTemplateImageManage from "../invoice-template-image-manage/invoice-template-image-manage";
import CommonEnquiries from "../common-enqueries/common-enqueries";
import { Home } from "lucide-react";
import SuperAdminHome from "../super-admin-home/super-admin-home";


export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("Home");

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
            {item.name === "Notifications" && (
              <span className="badge">3</span>
            )}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="content-area">{renderContent()}</div>
    </div>
  );
}
