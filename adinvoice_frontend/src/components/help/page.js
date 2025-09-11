"use client";
import React, { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";

export default function Help() {
  const [faqs, setFaqs] = useState([
    { id: 1, question: "How do I create an invoice?", answer: "Go to Invoices > Add Invoice and fill the details." },
    { id: 2, question: "How to add a new account?", answer: "Go to Accounting > Add Account and fill the account details." },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });

  const openModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({ question: faq.question, answer: faq.answer });
    } else {
      setEditingFaq(null);
      setFormData({ question: "", answer: "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingFaq) {
      setFaqs(faqs.map((f) => (f.id === editingFaq.id ? { ...f, ...formData } : f)));
    } else {
      const newFaq = { id: faqs.length + 1, ...formData };
      setFaqs([...faqs, newFaq]);
    }
    closeModal();
  };

  const handleDelete = (id) => setFaqs(faqs.filter((f) => f.id !== id));

  return (
    <div className="card shadow border-0 p-4 my-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Help / FAQs</h4>
        <button className="btn btn-primary btn-sm" onClick={() => openModal()}>
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {/* FAQs Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Question</th>
              <th>Answer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td>{faq.id}</td>
                <td>{faq.question}</td>
                <td>{faq.answer}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModal(faq)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(faq.id)}>
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
                <h5 className="modal-title">{editingFaq ? "Edit FAQ" : "Add FAQ"}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Question</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Answer</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingFaq ? "Save Changes" : "Add FAQ"}
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
