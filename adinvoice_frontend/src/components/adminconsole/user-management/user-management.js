// UserManagement.jsx
"use client";
import React, { useState, useEffect } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchPermissions,
  createPermission,
  updatePermission,
  deletePermission,
} from "../../../../Api/api_clientadmin";
import "bootstrap/dist/css/bootstrap.min.css";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [error, setError] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [editPerm, setEditPerm] = useState(null);

  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    role_ids: [],
  });

  const [roleForm, setRoleForm] = useState({ name: "", permission_ids: [] });
  const [permForm, setPermForm] = useState({ description: "", code: "" });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const tenantId = localStorage.getItem("tenant_id");
      if (!tenantId) throw new Error("Tenant ID not found in localStorage");
      const [usersData, rolesData, permsData] = await Promise.all([
        fetchUsers(tenantId),
        fetchRoles(tenantId),
        fetchPermissions(tenantId),
      ]);
      setUsers(usersData.results || []);
      setRoles(rolesData || []);
      setPermissions(permsData || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    }
  };

  // ---------------- User Handlers ----------------
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const handleUserSave = async (e) => {
    e.preventDefault();
    try {
      const tenantId = localStorage.getItem("tenant_id");
      if (!tenantId) throw new Error("Tenant ID not found");

      const payload = {
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        role_ids: userForm.role_ids ? [Number(userForm.role_ids)] : [],
      };

      if (editUser) {
        await updateUser(editUser.id, payload);
      } else {
        await createUser(tenantId, payload);
      }

      setShowUserModal(false);
      setEditUser(null);
      setUserForm({ username: "", email: "", password: "", role_ids: [] });
      setError(null);
      fetchAll();
    } catch (err) {
      setError(err.message || "Failed to save user");
    }
  };

  const handleUserEdit = (user) => {
    setEditUser(user);
    setUserForm({
      username: user.username || "",
      email: user.email || "",
      role_ids: user.roles?.length
        ? user.roles.map((r) => r.id.toString())
        : [],
    });

    setShowUserModal(true);
  };

  const handleUserDelete = async (id) => {
    if (confirm("Delete user?")) {
      try {
        await deleteUser(id);
        setError(null);
        fetchAll();
      } catch (err) {
        setError(err.message || "Failed to delete user");
      }
    }
  };

  // ---------------- Role Handlers ----------------
  const handleRoleChange = (e) => {
    const { name, value, type, options } = e.target;
    if (type === "select-multiple") {
      const selectedValues = Array.from(options)
        .filter((o) => o.selected)
        .map((o) => o.value);
      setRoleForm({ ...roleForm, [name]: selectedValues });
    } else {
      setRoleForm({ ...roleForm, [name]: value });
    }
  };

  const handleRoleSave = async (e) => {
    e.preventDefault();
    try {
      const tenantId = localStorage.getItem("tenant_id");
      if (!tenantId) throw new Error("Tenant ID not found");

      // Convert permission_ids to numbers
      const payload = {
        ...roleForm,
        permission_ids: roleForm.permission_ids.map(Number),
      };

      if (editRole) {
        await updateRole(editRole.id, payload);
      } else {
        await createRole(tenantId, payload);
      }

      setShowRoleModal(false);
      setEditRole(null);
      setRoleForm({ name: "", permission_ids: [] });
      fetchAll();
    } catch (err) {
      setError(err.message || "Failed to save role");
    }
  };

  const handleRoleEdit = (role) => {
    setEditRole(role);
    setRoleForm({
      name: role.name || "",
      permission_ids: role.permissions?.map((p) => p.id.toString()) || [],
    });
    setShowRoleModal(true);
  };

  const handleRoleDelete = async (id) => {
    if (confirm("Delete role?")) {
      try {
        await deleteRole(id);
        setError(null);
        fetchAll();
      } catch (err) {
        setError(err.message || "Failed to delete role");
      }
    }
  };

  // ---------------- Permission Handlers ----------------
  const handlePermChange = (e) =>
    setPermForm({ ...permForm, [e.target.name]: e.target.value });

  const handlePermSave = async (e) => {
    e.preventDefault();
    try {
      const tenantId = localStorage.getItem("tenant_id");
      if (!tenantId) throw new Error("Tenant ID not found");
      if (editPerm) {
        await updatePermission(editPerm.id, permForm);
      } else {
        await createPermission(tenantId, permForm);
      }
      setShowPermModal(false);
      setEditPerm(null);
      setPermForm({ description: "", code: "" });
      setError(null);
      fetchAll();
    } catch (err) {
      setError(err.message || "Failed to save permission");
    }
  };

  const handlePermEdit = (perm) => {
    setEditPerm(perm);
    setPermForm({ description: perm.description || "", code: perm.code || "" });
    setShowPermModal(true);
  };

  const handlePermDelete = async (id) => {
    if (confirm("Delete permission?")) {
      try {
        await deletePermission(id);
        setError(null);
        fetchAll();
      } catch (err) {
        setError(err.message || "Failed to delete permission");
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>User Management</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            Roles
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${
              activeTab === "permissions" ? "active" : ""
            }`}
            onClick={() => setActiveTab("permissions")}
          >
            Permissions
          </button>
        </li>
      </ul>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="mt-3">
          <button
            className="btn btn-primary mb-3"
            onClick={() => {
              setEditUser(null);
              setUserForm({ username: "", email: "", role_id: "" });
              setShowUserModal(true);
            }}
          >
            Add User
          </button>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.roles && u.roles.length > 0
                      ? u.roles.map((r) => r.name).join(", ")
                      : "No Roles"}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleUserEdit(u)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleUserDelete(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div className="mt-3">
          <button
            className="btn btn-primary mb-3"
            onClick={() => {
              setEditRole(null);
              setRoleForm({ name: "", permission_ids: [] });
              setShowRoleModal(true);
            }}
          >
            Add Role
          </button>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    {r.permissions
                      ?.map((p) => p.description || p.code)
                      .join(", ")}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleRoleEdit(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRoleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === "permissions" && (
        <div className="mt-3">
          <button
            className="btn btn-primary mb-3"
            onClick={() => {
              setEditPerm(null);
              setPermForm({ description: "", code: "" });
              setShowPermModal(true);
            }}
          >
            Add Permission
          </button>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Description</th>
                <th>Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.id}>
                  <td>{p.description || p.code}</td>
                  <td>{p.code}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handlePermEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handlePermDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showUserModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <form className="modal-content" onSubmit={handleUserSave}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editUser ? "Edit User" : "Add User"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowUserModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-3"
                    placeholder="Username"
                    name="username"
                    value={userForm.username || ""}
                    onChange={handleUserChange}
                  />

                  <input
                    className="form-control mb-3"
                    placeholder="Email"
                    name="email"
                    type="email"
                    value={userForm.email || ""}
                    onChange={handleUserChange}
                  />

                  {!editUser && (
                    <input
                      className="form-control mb-3"
                      placeholder="Password"
                      name="password"
                      type="password"
                      value={userForm.password || ""}
                      onChange={handleUserChange}
                    />
                  )}

                  <select
                    className="form-control mb-3"
                    name="role_ids"
                    value={userForm.role_ids?.[0] || ""} // take first role for now
                    onChange={(e) =>
                      setUserForm({ ...userForm, role_ids: [e.target.value] })
                    }
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {showRoleModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <form className="modal-content" onSubmit={handleRoleSave}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editRole ? "Edit Role" : "Add Role"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowRoleModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-3"
                    placeholder="Role Name"
                    name="name"
                    value={roleForm.name}
                    onChange={handleRoleChange}
                    required
                  />
                  <select
                    className="form-control mb-3"
                    multiple
                    name="permission_ids"
                    value={roleForm.permission_ids}
                    onChange={handleRoleChange}
                  >
                    {permissions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.description || p.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {showPermModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <form className="modal-content" onSubmit={handlePermSave}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editPerm ? "Edit Permission" : "Add Permission"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowPermModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-3"
                    placeholder="Description"
                    name="description"
                    value={permForm.description}
                    onChange={handlePermChange}
                  />
                  <input
                    className="form-control mb-3"
                    placeholder="Code"
                    name="code"
                    value={permForm.code}
                    onChange={handlePermChange}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
