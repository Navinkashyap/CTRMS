import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createContact, getClients, getContact, updateContact } from "../lib/salesApi";

const byNameAsc = (a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });

const emptyContact = {
  clientId: "",
  clientCode: "",
  salutation: "Mr.",
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+91",
  phone: "",
  designation: "",
  department: "",
  status: "Active",
  remark: "",
};

const ContactForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ ...emptyContact, clientId: searchParams.get("clientId") || "" });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getClients().then(setClients).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getContact(id).then((contact) => setForm({ ...emptyContact, ...contact })).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const sortedClients = useMemo(() => [...clients].sort(byNameAsc), [clients]);

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find((c) => c._id === clientId);
    setForm((prev) => ({ ...prev, clientId, clientCode: client?.membershipCode || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEdit) await updateContact(id, form);
      else await createContact(form);
      navigate("/sales/contacts");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold text-slate-800 mb-5">{isEdit ? "Edit Contact" : "Add Client Contact"}</h2>

      {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className={labelCls}>Client *</label>
          <select name="clientId" required value={form.clientId} onChange={handleClientChange} className={inputCls}>
            <option value="">Select client</option>
            {sortedClients.map((c) => (
              <option key={c._id} value={c._id}>{c.name} ({c.membershipCode})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Salutation</label>
            <select name="salutation" value={form.salutation} onChange={handleChange} className={inputCls}>
              {["Mr.", "Ms.", "Mrs.", "Dr."].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>First Name *</label>
            <input name="firstName" required value={form.firstName} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Last Name *</label>
            <input name="lastName" required value={form.lastName} onChange={handleChange} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} className={inputCls} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelCls}>Code</label>
              <input name="countryCode" value={form.countryCode} onChange={handleChange} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={inputCls} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Designation</label>
            <input name="designation" value={form.designation} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <input name="department" value={form.department} onChange={handleChange} className={inputCls} />
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
          <label className={labelCls}>Remark</label>
          <textarea name="remark" rows={3} value={form.remark} onChange={handleChange} className={inputCls} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Contact"}
          </button>
          <button type="button" onClick={() => navigate("/sales/contacts")} className="px-5 py-2.5 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
