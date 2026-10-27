import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { createProjectManager, updateProjectManager } from '../lib/projectManagerApi';

export default function AddProjectManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingProjectManager = location.state?.projectManager;
  const isEditMode = Boolean(editingProjectManager?._id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: '',
    dob: '',
    gender: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    availability: 'Full Time',
    address: '',
    isActive: true
  });

  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const nameParts = editingProjectManager.name.split(' ');
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ') || '';

      setFormData({
        firstName: first,
        lastName: last,
        email: editingProjectManager.email || '',
        mobile: editingProjectManager.mobile || '',
        dob: editingProjectManager.dob || '',
        gender: editingProjectManager.gender || '',
        country: editingProjectManager.country || '',
        availability: editingProjectManager.availability || 'Full Time',
        address: editingProjectManager.address || '',
        isActive: editingProjectManager.isActive ?? true,
        state: '', city: '', zipCode: ''
      });
    }
  }, [editingProjectManager, isEditMode]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        dob: formData.dob,
        gender: formData.gender,
        country: formData.country,
        availability: formData.availability,
        ptft: formData.availability === 'Full Time' ? 'FT' : 'PT',
        address: formData.address.trim(),
        isActive: formData.isActive
      };

      // Include password only when creating a new projectManager
      if (!isEditMode && formData.password.trim()) {
        payload.password = formData.password;
      }

      if (isEditMode) {
        await updateProjectManager(editingProjectManager._id, payload);
      } else {
        const newPayload = {
          ...payload,
          code: Math.floor(Math.random() * 10000).toString()
        };
        await createProjectManager(newPayload);
      }

      navigate('/project-managers');
    } catch (error) {
      console.error('Failed to save projectManager:', error);
      alert('Failed to save projectManager. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-6 animate-in fade-in duration-700 bg-[#fafbfc] min-h-screen">
      <div className="max-w-[1200px] mx-auto space-y-4 p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-md py-3.5 px-5 sm:px-6 rounded-2xl border border-white/80 shadow-xs">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate('/project-managers')}
              className="p-2 bg-white text-slate-600 hover:text-indigo-600 rounded-xl shadow-xs hover:shadow-sm transition-all group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
                {isEditMode ? 'Modify Partner Details' : 'Onboard New Project Manager'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">Manage resource profile information</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-7 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5">

              {/* Section: Basic Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full">Identity Details</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
              </div>

              {/* Row 1: Three fields in a row */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">First Name <span className="text-rose-500">*</span></label>
                <input
                  type="text" name="firstName" required placeholder="John"
                  className="w-full h-10 px-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.firstName} onChange={handleFormChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">Last Name <span className="text-rose-500">*</span></label>
                <input
                  type="text" name="lastName" required placeholder="Doe"
                  className="w-full h-10 px-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.lastName} onChange={handleFormChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">Email <span className="text-rose-500">*</span></label>
                <input
                  type="email" name="email" required placeholder="john@example.com"
                  className="w-full h-10 px-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.email} onChange={handleFormChange}
                />
              </div>

              {/* Password field - only shown when creating a new projectManager */}
              {!isEditMode && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">Password <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required={!isEditMode}
                      minLength={6}
                      placeholder="Min. 6 characters"
                      className="w-full h-10 px-3.5 pr-10 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                      value={formData.password}
                      onChange={handleFormChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">Mobile <span className="text-rose-500">*</span></label>
                <div className="flex h-10 bg-slate-50 border border-slate-200 hover:bg-slate-100/50 rounded-lg overflow-hidden focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                  <div className="flex items-center gap-1.5 px-3 border-r border-slate-200 text-sm font-semibold text-slate-600 bg-slate-100/50">
                    <img src="https://flagcdn.com/in.svg" alt="India" className="w-4 h-3 object-cover rounded-sm shadow-xs" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel" name="mobile" required placeholder="9876543210"
                    className="flex-1 px-3 bg-transparent border-none text-sm font-medium outline-none"
                    value={formData.mobile} onChange={handleFormChange}
                  />
                </div>
              </div>

              {/* Section: Professional Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 pt-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full">Professional Profile</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
              </div>

              {/* Row: Three fields in a row */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">Birth Date <span className="text-rose-500">*</span></label>
                <input
                  type="date" name="dob" required
                  className="w-full h-10 px-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.dob} onChange={handleFormChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">Gender <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select
                    name="gender" required
                    className="w-full h-10 px-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer"
                    value={formData.gender} onChange={handleFormChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">Primary Region <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select
                    name="country" required
                    className="w-full h-10 px-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer"
                    value={formData.country} onChange={handleFormChange}
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Row: Availability (1 col) + Address (2 cols) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">Availability</label>
                <div className="flex items-center gap-4 h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg w-full">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio" name="availability" value="Full Time"
                      checked={formData.availability === 'Full Time'} onChange={handleFormChange}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Full Time</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio" name="availability" value="Part Time"
                      checked={formData.availability === 'Part Time'} onChange={handleFormChange}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Part Time</span>
                  </label>
                </div>
              </div>

              <div className="col-span-1 md:col-span-1 lg:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700 tracking-wider ml-0.5">Physical Address</label>
                <textarea
                  name="address" placeholder="Corporate or Residential address..." rows={1}
                  className="w-full h-10 px-3.5 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                  value={formData.address} onChange={handleFormChange}
                />
              </div>

              {/* System Visibility */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-between py-2.5 px-4 bg-slate-50/80 rounded-xl border border-slate-200/80 mt-1">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-800">System Visibility</label>
                  <p className="text-[11px] font-medium text-slate-500">Enable or disable this Project Manager's profile</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${formData.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-all duration-300 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => navigate('/project-managers')}
                className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-600 rounded-lg text-sm font-semibold transition-all shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Project Manager')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
