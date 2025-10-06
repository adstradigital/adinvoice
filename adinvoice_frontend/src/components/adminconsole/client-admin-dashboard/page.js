// src/app/client-admin-dashboard/page.js
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ClientAdminDashboard from "@/components/adminconsole/client-admin-dashboard/client-admin-dashboard";

export default function Page() {
  return (
    <ProtectedRoute>
      <ClientAdminDashboard />
    </ProtectedRoute>
  );
}