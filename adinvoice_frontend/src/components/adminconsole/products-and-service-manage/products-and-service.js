"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getProductsServices,
  addProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  createCategory,
} from "../../../../Api/api_clientadmin";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

export default function ProductsServices() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [submitting, setSubmitting] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  function getEmptyForm() {
    return {
      type: "",
      category: "",
      name: "",
      description: "",
      price: "",
      is_active: true,
      hsn_code: "", // ✅ changed from sku
      stock_quantity: "",
      delivery_available: true,
    };
  }

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProductsServices();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const data = await listCategories();
    setCategories(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      alert("Failed to delete product/service.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    // Ensure price is a positive integer (>=1)
    if (name === "price") {
      let strValue = String(newValue); // convert to string
      strValue = strValue.replace(/\D/g, ""); // remove non-digits
      newValue = strValue === "" ? "" : parseInt(strValue, 10);
      if (newValue < 1) newValue = 1; // enforce minimum 1
    }

    // Ensure stock quantity is non-negative integer (>=0)
    if (name === "stock_quantity") {
      let strValue = String(newValue); // convert to string
      strValue = strValue.replace(/\D/g, ""); // remove non-digits
      newValue = strValue === "" ? "" : parseInt(strValue, 10);
      if (newValue < 0) newValue = 0; // enforce minimum 0
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, formData);
        setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const newProduct = await addProduct(formData);
        setProducts([...products, newProduct]);
      }
      handleClose();
    } catch (error) {
      // Check if token expired
      if (error?.code === "token_not_valid") {
        Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Your session has expired. Please login again.",
          confirmButtonText: "Login",
        }).then(() => {
          window.location.href = "/signin";
        });
        return;
      }

      // Handle validation errors
      const apiErrors = error?.error || error;
      const messages = [];

      for (const key in apiErrors) {
        if (Array.isArray(apiErrors[key])) {
          apiErrors[key].forEach((msg) => messages.push(`${key}: ${msg}`));
        } else {
          messages.push(`${key}: ${apiErrors[key]}`);
        }
      }

      Swal.fire({
        icon: "error",
        title: "Failed to save product/service",
        html: messages.join("<br>"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      type: product.type || "",
      category: product.category || "",
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      is_active: product.is_active,
      hsn_code: product.hsn_code || "",
      stock_quantity: product.stock_quantity,
      delivery_available: product.delivery_available,
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData(getEmptyForm());
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(getEmptyForm());
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const newCategory = await createCategory(newCategoryName);
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, category: newCategory.id });
      setNewCategoryName("");
      setShowCategoryModal(false);
    } catch (err) {
      alert("Failed to create category");
    }
  };

  return (
    <div className="card shadow border-0 p-4 my-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4>📦 Products & Services</h4>
          <p>Manage products and services offered.</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Create Product/Service
        </Button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered mt-3">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Description</th>
              <th>Unit Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No products/services found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.type}</td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.price}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
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

      {/* Modal for create/edit */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? "Edit" : "Create"} Product/Service
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Type Dropdown */}
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select type</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
              </Form.Select>
            </Form.Group>

            {/* Category Dropdown + Add Button */}
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  variant="outline-primary"
                  className="ms-2"
                  onClick={() => setShowCategoryModal(true)}
                >
                  + Add
                </Button>
              </div>
            </Form.Group>

            {/* Name */}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                required
              />
            </Form.Group>

            {/* Description */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
              />
            </Form.Group>

            {/* Price */}
            <Form.Group className="mb-3">
              <Form.Label>Unit Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>HSN Code</Form.Label>
              <Form.Control
                type="text"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleInputChange}
                placeholder="Enter HSN Code"
              />
            </Form.Group>

            {/* Stock */}
            <Form.Group className="mb-3">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                placeholder="Enter stock quantity"
              />
            </Form.Group>

            {/* Active */}
            <Form.Group className="mb-3 form-check">
              <Form.Check
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                label="Active"
              />
            </Form.Group>

            {/* Delivery */}
            <Form.Group className="mb-3 form-check">
              <Form.Check
                type="checkbox"
                name="delivery_available"
                checked={formData.delivery_available}
                onChange={handleInputChange}
                label="Delivery Available"
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <Spinner animation="border" size="sm" />
              ) : editingProduct ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal for create category */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Category</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCategorySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCategoryModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
