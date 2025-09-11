"use client";
import React, { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Invoice Due", message: "Invoice #INV842002 is due tomorrow." },
    { id: 2, title: "New User", message: "A new user has registered: Jackson Balalala." },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({ title: "", message: "" });

  const openModal = (notification = null) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({ title: notification.title, message: notification.message });
    } else {
      setEditingNotification(null);
      setFormData({ title: "", message: "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNotification) {
      setNotifications(
        notifications.map((n) =>
          n.id === editingNotification.id ? { ...n, ...formData } : n
        )
      );
    } else {
      const newNotification = { id: notifications.length + 1, ...formData };
      setNotifications([...notifications, newNotification]);
    }
    closeModal();
  };

  const handleDelete = (id) => setNotifications(notifications.filter((n) => n.id !== id));

  return (
    <div className="card shadow border-0 p-4 my-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Notifications</h4>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
          <Plus size={16} /> Add Notification
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.title}</td>
                <td>{n.message}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => openModal(n)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(n.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingNotification ? "Edit Notification" : "Add Notification"}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingNotification ? "Save Changes" : "Add Notification"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
