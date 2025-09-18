"use client";
import React, { useEffect, useState } from "react";
import { getProductsServices } from "../../../../Api/index"; // Make sure this API exists in your index.js

export default function ProductsServices() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProductsServices();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products/services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    // Placeholder for delete functionality
    console.log("Delete item:", id);
  };

  return (
    <div className="card shadow border-0 p-4 my-3">
      <h4>📦 Products & Services</h4>
      <p>Manage products and services offered.</p>

      <div className="table-responsive">
        <table className="table table-bordered mt-3">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Unit Price</th>
              <th>Tax</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No products/services found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.type}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.tax || "-"}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
