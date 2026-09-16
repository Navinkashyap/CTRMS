import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createClient, getClient, updateClient } from "../lib/salesApi";

const emptyClient = {
  name: "",
  membershipCode: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  currency: "USD",
  status: "Active",
  notes: "",
};

const statusOptions = ["Active", "Inactive", "Onboarding", "Client", "Prospect Warm", "Prospect Cold"];

const ClientForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyClient);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getClient(id).then((client) => setForm({ ...emptyClient, ...client })).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEdit) await updateClient(id, form);
      else await createClient(form);
      navigate("/sales/clients");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold text-slate-800 mb-5">{isEdit ? "Edit Client" : "Add Client"}</h2>

      {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Client Name *</label>
            <input name="name" required value={form.name} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Membership Code *</label>
            <input
              name="membershipCode"
              required
              disabled={isEdit}
              value={form.membershipCode}
              onChange={handleChange}
              className={`${inputCls} disabled:bg-slate-100`}
              placeholder="e.g. MEM-001"
            />
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input name="website" value={form.website} onChange={handleChange} className={inputCls} placeholder="https://" />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <input name="currency" value={form.currency} onChange={handleChange} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Address</label>
            <input name="address" value={form.address} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input name="city" value={form.city} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>State</label>
            <input name="state" value={form.state} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Zip</label>
            <input name="zip" value={form.zip} onChange={handleChange} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input name="country" value={form.country} onChange={handleChange} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea name="notes" rows={3} value={form.notes} onChange={handleChange} className={inputCls} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Client"}
          </button>
          <button type="button" onClick={() => navigate("/sales/clients")} className="px-5 py-2.5 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;
