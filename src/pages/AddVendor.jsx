import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { createVendor, updateVendor } from '../lib/vendorApi';

export default function AddVendor() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingVendor = location.state?.vendor;
  const isEditMode = Boolean(editingVendor?._id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
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

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const nameParts = editingVendor.name.split(' ');
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ') || '';

      setFormData({
        firstName: first,
        lastName: last,
        email: editingVendor.email || '',
        mobile: editingVendor.mobile || '',
        dob: editingVendor.dob || '',
        gender: editingVendor.gender || '',
        country: editingVendor.country || '',
        availability: editingVendor.availability || 'Full Time',
        address: editingVendor.address || '',
        isActive: editingVendor.isActive ?? true,
        state: '', city: '', zipCode: ''
      });
    }
  }, [editingVendor, isEditMode]);

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

      if (isEditMode) {
        await updateVendor(editingVendor._id, payload);
      } else {
        const newPayload = {
          ...payload,
          code: Math.floor(Math.random() * 10000).toString()
        };
        await createVendor(newPayload);
      }

      navigate('/vendors');
    } catch (error) {
      console.error('Failed to save vendor:', error);
      alert('Failed to save vendor. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700 bg-[#fafbfc] min-h-screen">
      <div className="max-w-[1000px] mx-auto space-y-8 p-4 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vendors')}
              className="p-3 bg-white text-slate-600 hover:text-indigo-600 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
                {isEditMode ? 'Modify Partner Details' : 'Onboard New Vendor'}
              </h1>
              <p className="text-slate-500 font-medium tracking-wide">Manage resource profile information</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 lg:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Section: Basic Info */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">Identity Details</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">First Name <span className="text-rose-500">*</span></label>
                <input
                  type="text" name="firstName" required placeholder="John"
                  className="w-full h-12 px-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.firstName} onChange={handleFormChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Last Name <span className="text-rose-500">*</span></label>
                <input
                  type="text" name="lastName" required placeholder="Doe"
                  className="w-full h-12 px-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.lastName} onChange={handleFormChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Email <span className="text-rose-500">*</span></label>
                <input
                  type="email" name="email" required placeholder="john@example.com"
                  className="w-full h-12 px-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.email} onChange={handleFormChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Mobile <span className="text-rose-500">*</span></label>
                <div className="flex h-12 bg-slate-50 border border-slate-200 hover:bg-slate-100/50 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                  <div className="flex items-center gap-2 px-4 border-r border-slate-200 text-sm font-semibold text-slate-600 bg-slate-100/50">
                    <img src="https://flagcdn.com/in.svg" alt="India" className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel" name="mobile" required placeholder="9876543210"
                    className="flex-1 px-4 bg-transparent border-none text-sm font-medium outline-none"
                    value={formData.mobile} onChange={handleFormChange}
                  />
                </div>
              </div>

              {/* Section: Professional Info */}
              <div className="md:col-span-2 pt-2">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">Professional Profile</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Birth Date <span className="text-rose-500">*</span></label>
                <input
                  type="date" name="dob" required
                  className="w-full h-12 px-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  value={formData.dob} onChange={handleFormChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Gender <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select
                    name="gender" required
                    className="w-full h-12 px-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer"
                    value={formData.gender} onChange={handleFormChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Primary Region <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select
                    name="country" required
                    className="w-full h-12 px-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer"
                    value={formData.country} onChange={handleFormChange}
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Availability</label>
                <div className="flex items-center gap-6 h-12 px-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio" name="availability" value="Full Time"
                      checked={formData.availability === 'Full Time'} onChange={handleFormChange}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Full Time</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio" name="availability" value="Part Time"
                      checked={formData.availability === 'Part Time'} onChange={handleFormChange}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Part Time</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Physical Address</label>
                <textarea
                  name="address" placeholder="Corporate or Residential address..." rows={3}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                  value={formData.address} onChange={handleFormChange}
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm mt-2">
                <div className="space-y-0.5">
                  <label className="text-sm font-bold text-slate-800">System Visibility</label>
                  <p className="text-xs font-medium text-slate-500">Enable or disable this vendor's profile</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${formData.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-12 h-6 rounded-full p-0.5 cursor-pointer transition-all duration-300 ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => navigate('/vendors')}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-600 rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Vendor')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
