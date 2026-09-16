import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createSalesUser, getSalesUser, updateSalesUser } from "../lib/salesApi";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  mobile: "",
  dob: "",
  gender: "",
  status: "Active",
  permissions: {
    clients: { add: true, view: true, edit: true },
    contacts: { add: true, view: true, edit: true },
    projects: { create: true, view: true },
  },
};

const PermissionRow = ({ module, actions, permissions, onToggle }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm font-medium text-slate-700 capitalize">{module}</span>
    <div className="flex gap-4">
      {actions.map((action) => (
        <label key={action} className="flex items-center gap-1.5 text-sm text-slate-600 capitalize">
          <input
            type="checkbox"
            checked={Boolean(permissions?.[module]?.[action])}
            onChange={() => onToggle(module, action)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          {action}
        </label>
      ))}
    </div>
  </div>
);

const SalesUserForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getSalesUser(id).then((user) => setForm({ ...emptyForm, ...user, password: "" })).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const togglePermission = (module, action) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: { ...prev.permissions[module], [action]: !prev.permissions[module]?.[action] },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      if (isEdit) await updateSalesUser(id, payload);
      else await createSalesUser(payload);
      navigate("/sales/users");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save Sales Manager");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-800 mb-5">{isEdit ? "Edit Sales Manager" : "Add Sales Manager"}</h2>

      {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name *</label>
            <input name="name" required value={form.name} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input
              type="email"
              name="email"
              required
              disabled={isEdit}
              value={form.email}
              onChange={handleChange}
              className={`${inputCls} disabled:bg-slate-100 disabled:text-slate-500`}
            />
          </div>
          <div>
            <label className={labelCls}>Mobile Number *</label>
            <input
              type="tel"
              name="mobile"
              required
              value={form.mobile}
              onChange={handleChange}
              className={inputCls}
              placeholder="10-digit mobile number"
            />
          </div>
          <div>
            <label className={labelCls}>Date of Birth *</label>
            <input type="date" name="dob" required value={form.dob} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Gender *</label>
            <select name="gender" required value={form.gender} onChange={handleChange} className={inputCls}>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{isEdit ? "New Password" : "Password *"}</label>
            <input
              type="password"
              name="password"
              required={!isEdit}
              value={form.password}
              onChange={handleChange}
              placeholder={isEdit ? "Leave blank to keep current" : ""}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 mb-1">Permissions</p>
          <p className="text-xs text-slate-500 mb-3">Control exactly what this Sales Manager can do.</p>
          <div className="border border-slate-200 rounded-xl px-4">
            <PermissionRow module="clients" actions={["add", "view", "edit"]} permissions={form.permissions} onToggle={togglePermission} />
            <PermissionRow module="contacts" actions={["add", "view", "edit"]} permissions={form.permissions} onToggle={togglePermission} />
            <PermissionRow module="projects" actions={["create", "view"]} permissions={form.permissions} onToggle={togglePermission} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Account"}
          </button>
          <button type="button" onClick={() => navigate("/sales/users")} className="px-5 py-2.5 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalesUserForm;
