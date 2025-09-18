"use client";
import React from "react";
import "./analytics.css";
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
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Analytics() {
  // Dummy data
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

  // KPI calculations
  const totalSales = salesData.reduce((acc, item) => acc + item.sales, 0);
  const totalProfit = salesData.reduce((acc, item) => acc + item.profit, 0);
  const avgSales = (totalSales / salesData.length).toFixed(0);
  const avgProfit = (totalProfit / salesData.length).toFixed(0);

  return (
    <div>
      {/* KPI Mini Cards */}
      <div className="analytics-grid">
        <div className="mini-card">
          <h4>Total Sales</h4>
          <p>${totalSales.toLocaleString()}</p>
        </div>
        <div className="mini-card">
          <h4>Total Profit</h4>
          <p>${totalProfit.toLocaleString()}</p>
        </div>
        <div className="mini-card">
          <h4>Avg Sales / Month</h4>
          <p>${avgSales}</p>
        </div>
        <div className="mini-card">
          <h4>Avg Profit / Month</h4>
          <p>${avgProfit}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "20px" }}
      >
        {/* Line Chart */}
        <div className="chart-card">
          <h3>📈 Monthly Sales & Profit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
          <p className="chart-insight">
            🔍 Sales peaked in March with ${salesData[2].sales}, while profits hit ${salesData[2].profit}.
          </p>
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <h3>📊 Sales by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="chart-insight">💡 June sales rebounded after a dip in May.</p>
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <h3>🛒 Product Share</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} label dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="chart-insight">🏆 Product A leads with 40% of total sales share.</p>
        </div>

        {/* Profit Trend */}
        <div className="chart-card">
          <h3>📉 Profit Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="chart-insight">📊 Profits were highest in March, showing strong growth potential.</p>
        </div>
      </div>
    </div>
  );
}
