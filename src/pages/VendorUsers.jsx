import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

// Same endpoint the Vendor Manager portal uses to create vendors (VMSUser, role "Vendor").
// Admin and VMS tokens share one JWT secret, so the admin token is accepted here.
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const TITLES = ['Mr.', 'Ms.', 'Mrs.'];

const emptyForm = {
  title: 'Mr.',
  firstName: '',
  lastName: '',
  countryCode: '',
  contactNo: '',
  email: '',
  dob: '',
  address: '',
  password: '',
};

const inputCls =
  'w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none';

const splitName = (full = '') => {
  const parts = full.split(' ').filter(Boolean);
  const title = TITLES.includes(parts[0]) ? parts.shift() : 'Mr.';
  return { title, firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
};

export default function VendorUsers() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vms/users');
      setVendors(data.filter((u) => (u.role || '').toLowerCase() === 'vendor'));
    } catch (error) {
      alert(error.response?.data?.message || 'Could not load vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return vendors.filter(
      (v) =>
        (v.name || '').toLowerCase().includes(q) ||
        (v.email || '').toLowerCase().includes(q) ||
        (v.contactNo || '').includes(q)
    );
  }, [vendors, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEdit = (vendor) => {
    setEditingId(vendor._id);
    setForm({
      ...emptyForm,
      ...splitName(vendor.name),
      countryCode: vendor.countryCode || '',
      contactNo: vendor.contactNo || '',
      email: vendor.email || '',
      dob: vendor.dob || '',
      address: vendor.address || '',
    });
    setIsModalOpen(true);
  };

  const setField = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !form.password) {
      alert('Password is required.');
      return;
    }

    const payload = {
      name: `${form.title} ${form.firstName} ${form.lastName}`.trim(),
      countryCode: form.countryCode,
      contactNo: form.contactNo,
      email: form.email.trim(),
      dob: form.dob,
      address: form.address,
      role: 'Vendor',
    };

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/vms/users/${editingId}`, payload);
      } else {
        await api.post('/vms/users', { ...payload, password: form.password });
      }
      setIsModalOpen(false);
      await loadVendors();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save vendor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await api.delete(`/vms/users/${id}`);
      setVendors((prev) => prev.filter((v) => v._id !== id));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete vendor.');
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:px-8 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vendors</h1>
            <p className="text-slate-500 text-sm font-medium">
              Create vendor accounts that can log in to the Vendor portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Vendor
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {['S.No.', 'Name', 'Email', 'Contact', 'DOB', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-slate-500 font-medium">
                    Loading vendors...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-16 text-center text-slate-500 font-medium">
                    No vendors found.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((v, idx) => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{v.name}</td>
                    <td className="px-6 py-4 text-slate-600">{v.email}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {[v.countryCode, v.contactNo].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{v.dob || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-medium border ${
                          v.isActive === false
                            ? 'bg-slate-50 text-slate-500 border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}
                      >
                        {v.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-2 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !saving && setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-white text-lg font-semibold">
                {editingId ? 'Edit Vendor' : 'Create New Vendor'}
              </h2>
              <button
                onClick={() => !saving && setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select name="title" value={form.title} onChange={setField} className={`${inputCls} !w-24`}>
                      {TITLES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      name="firstName"
                      required
                      placeholder="First Name"
                      value={form.firstName}
                      onChange={setField}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Name</label>
                  <input
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={setField}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Contact No.</label>
                  <div className="flex gap-2">
                    <input
                      name="countryCode"
                      placeholder="+91"
                      value={form.countryCode}
                      onChange={setField}
                      className={`${inputCls} !w-24`}
                    />
                    <input
                      name="contactNo"
                      placeholder="Contact number"
                      value={form.contactNo}
                      onChange={setField}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="vendor@example.com"
                    value={form.email}
                    onChange={setField}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Date of Birth</label>
                  <input type="date" name="dob" value={form.dob} onChange={setField} className={inputCls} />
                </div>

                {!editingId && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        required
                        placeholder="Password"
                        value={form.password}
                        onChange={setField}
                        className={`${inputCls} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Address</label>
                  <textarea
                    name="address"
                    rows={3}
                    placeholder="Address"
                    value={form.address}
                    onChange={setField}
                    className={`${inputCls} h-auto py-3`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Vendor' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
