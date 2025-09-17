"use client";
import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./super-admin-home.css";

export default function SuperAdminHome() {
  const salesData = [
    { month: "Jan", sales: 4000, profit: 2400 },
    { month: "Feb", sales: 3000, profit: 1398 },
    { month: "Mar", sales: 2000, profit: 9800 },
    { month: "Apr", sales: 2780, profit: 3908 },
    { month: "May", sales: 1890, profit: 4800 },
    { month: "Jun", sales: 2390, profit: 3800 },
    { month: "Jul", sales: 3490, profit: 4300 },
  ];

  const pieData = [
    { name: "Product A", value: 400 },
    { name: "Product B", value: 300 },
    { name: "Product C", value: 300 },
    { name: "Product D", value: 200 },
  ];

  const COLORS = ["#4f46e5", "#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📊 Super Admin Dashboard</h2>
      <div className="row">
        {/* Line Chart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3 chart-card">
            <h5>Monthly Sales & Profit</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3 chart-card">
            <h5>Sales by Month</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3 chart-card">
            <h5>Product Share</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Trend */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm p-3 chart-card">
            <h5>Profit Trend</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
