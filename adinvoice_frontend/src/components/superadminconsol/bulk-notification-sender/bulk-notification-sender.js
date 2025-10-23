// bulk-notification-sender.js
import { useState, useEffect } from "react";
import { createNotificationSuperAdmin } from "../../../../Api/api_superadmin";
import { fetchClientAdminNotifications } from "../../../../Api/api_clientadmin";

const BulkNotificationSender = () => {
  const [form, setForm] = useState({ message: "", type: "announcement" });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load existing notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchClientAdminNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("❌ Failed to fetch notifications:", err);
        setError(err.detail || "Failed to load notifications");
      }
    };

    loadNotifications();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createNotificationSuperAdmin({
        message: form.message,
        notification_type: form.type,
      });
      alert("✅ Notification sent successfully!");
      setForm({ message: "", type: "announcement" });

      // Refresh notifications after sending
      const updated = await fetchClientAdminNotifications();
      setNotifications(updated);
    } catch (err) {
      console.error("❌ Error sending notification:", err);
      setError(err.detail || "You are not authorized to perform this action.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Send Bulk Notification</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Enter message..."
          className="w-full p-2 border rounded mb-2"
          required
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full p-2 border rounded mb-2"
        >
          <option value="announcement">Announcement</option>
          <option value="update">Update</option>
          <option value="alert">Alert</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </form>

      <h3 className="text-lg font-semibold mb-2">Previous Notifications</h3>
      <ul className="list-disc pl-5">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <li key={n.id}>
              [{n.notification_type}] {n.message}
            </li>
          ))
        ) : (
          <li>No notifications yet.</li>
        )}
      </ul>
    </div>
  );
};

export default BulkNotificationSender;
