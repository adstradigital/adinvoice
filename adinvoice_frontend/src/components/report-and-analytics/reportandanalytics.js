"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area, ResponsiveContainer
} from "recharts";

export default function ReportsAnalytics() {
  const [salesData, setSalesData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your backend endpoints
        const salesResponse = await axios.get("https://dummyjson.com/carts"); 
        const pieResponse = await axios.get("https://dummyjson.com/products"); 

        // Map dummy sales data
        const sales = salesResponse.data.carts.slice(0, 5).map((item, index) => ({
          month: ["Jan", "Feb", "Mar", "Apr", "May"][index],
          revenue: item.discountedTotal,
          expenses: Math.floor(item.discountedTotal * 0.6),
        }));
        setSalesData(sales);

        // Map dummy pie chart data
        const pie = pieResponse.data.products.slice(0, 4).map((item, index) => ({
          name: item.title,
          value: item.price,
        }));
        setPieData(pie);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center mt-4">Loading analytics data...</p>;
  }

  return (
    <div className="container my-4">
      <h2 className="mb-4">📊 Reports & Analytics</h2>

      <div className="row g-4">
        {/* Pie Chart */}
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5 className="mb-3">Data Distribution</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5 className="mb-3">Revenue vs Expenses</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#4CAF50" />
                <Bar dataKey="expenses" fill="#F44336" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5 className="mb-3">Revenue Growth</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2196F3" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#FF5722" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart */}
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h5 className="mb-3">Cash Flow</h5>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="expenses" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
