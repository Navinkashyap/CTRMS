import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createProject, getClients, getContacts } from "../lib/salesApi";

const byNameAsc = (a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
const byFirstNameAsc = (a, b) =>
  `${a.firstName || ""} ${a.lastName || ""}`.localeCompare(
    `${b.firstName || ""} ${b.lastName || ""}`,
    undefined,
    { sensitivity: "base" }
  );

const emptyProject = {
  projectName: "",
  client: "",
  clientContact: "",
  jobType: "",
  priority: "Medium",
  deadline: "",
  amount: "",
  description: "",
};

const ProjectForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ ...emptyProject, client: searchParams.get("clientId") || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getClients().then(setClients).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.client) {
      setContacts([]);
      return;
    }
    getContacts({ clientId: form.client }).then(setContacts).catch(() => {});
  }, [form.client]);

  const sortedClients = useMemo(() => [...clients].sort(byNameAsc), [clients]);
  const sortedContacts = useMemo(() => [...contacts].sort(byFirstNameAsc), [contacts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // A different client invalidates whatever contact was picked before —
      // clear it so the dropdown never holds a value that isn't one of its
      // own options.
      ...(name === "client" && value !== prev.client ? { clientContact: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createProject({ ...form, clientContact: form.clientContact || undefined });
      navigate("/sales/projects");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold text-slate-800 mb-5">Create Project</h2>

      {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className={labelCls}>Project Name *</label>
          <input name="projectName" required value={form.projectName} onChange={handleChange} className={inputCls} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Client *</label>
            <select name="client" required value={form.client} onChange={handleChange} className={inputCls}>
              <option value="">Select client</option>
              {sortedClients.map((c) => (
                <option key={c._id} value={c._id}>{c.name} ({c.membershipCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Client Contact</label>
            <select name="clientContact" value={form.clientContact} onChange={handleChange} className={inputCls}>
              <option value="">Select contact (optional)</option>
              {sortedContacts.map((c) => (
                <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Job Type</label>
            <input name="jobType" value={form.jobType} onChange={handleChange} className={inputCls} placeholder="e.g. Translation" />
          </div>
          <div>
            <label className={labelCls}>Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className={inputCls}>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Deadline</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Estimated Amount</label>
          <input name="amount" value={form.amount} onChange={handleChange} className={inputCls} placeholder="e.g. 500 USD" />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} className={inputCls} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60">
            {saving ? "Creating..." : "Create Project"}
          </button>
          <button type="button" onClick={() => navigate("/sales/projects")} className="px-5 py-2.5 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
