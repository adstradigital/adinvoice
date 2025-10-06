"use client";

import React, { useState } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { loginUser } from "../../Api/index"; // Adjust path based on your folder structure
import { useRouter } from "next/navigation";

export default function SuperAdminSignin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser({ username, password });

      // ✅ Check role if you want to restrict only super-admins
      if (response.role && response.role !== "superadmin") {
        setError("You are not authorized as Super Admin.");
        setLoading(false);
        return;
      }

      // Redirect to super-admin dashboard
      router.push("/super-admin-dashboard"); // adjust your path
    } catch (err) {
      console.error(err);
      setError(err.detail || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <div
        className="p-4 bg-white shadow rounded"
        style={{ width: "400px", maxWidth: "90%" }}
      >
        <h2 className="mb-4 text-center">Super Admin Sign In</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Sign In"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
