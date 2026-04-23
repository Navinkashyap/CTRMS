import React, { useState, useEffect } from 'react';
import {
  Filter,
  Settings,
  ChevronDown,
  ArrowUpDown,
  Star,
  Plus,
  Search,
  X,
  Trash2
} from 'lucide-react';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../lib/vendorApi';

// Initial data placeholder removed - fetching from API instead

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={`${star <= rating
            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]'
            : 'text-slate-200 fill-slate-50'
            } transition-all duration-300`}
        />
      ))}
    </div>
  );
};

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
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

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setIsLoading(true);
      const data = await getVendors();
      setVendors(data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [filters, setFilters] = useState({
    code: '',
    name: '',
    email: '',
    country: '',
    motherTongue: '',
    ptft: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        mobile: formData.mobile,
        dob: formData.dob,
        gender: formData.gender,
        country: formData.country,
        availability: formData.availability,
        ptft: formData.availability === 'Full Time' ? 'FT' : 'PT',
        address: formData.address,
        isActive: formData.isActive
      };

      if (editingVendor) {
        await updateVendor(editingVendor._id, payload);
      } else {
        // Generate a simple code if not provided by backend (backend handles code now but frontend can propose one or backend can auto-gen)
        const newPayload = {
          ...payload,
          code: Math.floor(Math.random() * 10000).toString()
        };
        await createVendor(newPayload);
      }

      await loadVendors();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save vendor:', error);
      alert('Failed to save vendor. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', mobile: '', email: '', dob: '', gender: '',
      country: '', state: '', city: '', zipCode: '', availability: 'Full Time',
      address: '', isActive: true
    });
    setEditingVendor(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await deleteVendor(id);
        await loadVendors();
      } catch (error) {
        console.error('Failed to delete vendor:', error);
      }
    }
  };

  const handleEdit = (vendor) => {
    const nameParts = vendor.name.split(' ');
    const first = nameParts[0] || '';
    const last = nameParts.slice(1).join(' ') || '';

    setEditingVendor(vendor);
    setFormData({
      firstName: first,
      lastName: last,
      email: vendor.email || '',
      mobile: vendor.mobile || '',
      dob: vendor.dob || '',
      gender: vendor.gender || '',
      country: vendor.country || '',
      availability: vendor.availability || 'Full Time',
      address: vendor.address || '',
      isActive: vendor.isActive ?? true,
      // Reset others if not in vendor object
      state: '', city: '', zipCode: ''
    });
    setIsModalOpen(true);
  };

  const filteredVendors = vendors.filter(vendor =>
    Object.keys(filters).every(key =>
      vendor[key]?.toString().toLowerCase().includes(filters[key].toLowerCase())
    )
  );

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:px-8 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Vendor Directory
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide flex items-center gap-3">
              Global Resource Management
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold text-[10px] uppercase tracking-wider">
                {filteredVendors.length} ACTIVE VENDORS
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Quick Search..."
                className="w-72 pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>

            <button
              onClick={() => { setEditingVendor(null); setIsModalOpen(true); }}
              className="group relative flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Plus className="relative w-4 h-4" />
              <span className="relative">Add New Vendor</span>
            </button>
          </div>
        </div>

        {/* Premium Filter Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-wrap items-end gap-4 overflow-hidden relative">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Category</label>
            <div className="relative">
              <select className="w-full h-10 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white">
                <option>All Services</option>
                <option>Translation</option>
                <option>Interpretation</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Source Language</label>
            <div className="relative">
              <select className="w-full h-10 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Language</label>
            <div className="relative">
              <select className="w-full h-10 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white">
                <option>All Targets</option>
                <option>Hindi</option>
                <option>Bengali</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button className="h-10 px-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-semibold text-sm hover:bg-indigo-100 transition-all shadow-sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>

        {/* Premium Vendor Table */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-sm border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100/80">
                  <th className="px-6 py-5 font-semibold text-slate-500 text-xs w-16 text-center">#</th>
                  <th className="px-6 py-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Code</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 pointer-events-none" />
                      </div>
                      <input
                        type="text"
                        placeholder="Filter..."
                        className="w-50 h-8 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 font-sans"
                        value={filters.code}
                        onChange={(e) => handleFilterChange('code', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Full Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 pointer-events-none" />
                      </div>
                      <input
                        type="text"
                        placeholder="Filter..."
                        className="w-full h-8 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 font-sans"
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Email Contact</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 pointer-events-none" />
                      </div>
                      <input
                        type="text"
                        placeholder="Filter..."
                        className="w-full h-8 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 font-sans"
                        value={filters.email}
                        onChange={(e) => handleFilterChange('email', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3 w-40">
                    <div className="flex flex-col gap-2 text-center h-[52px] justify-between">
                      <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider mt-1">Ratings</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-xs text-center uppercase tracking-wider flex-col justify-end pt-[28px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredVendors.map((vendor, index) => (
                  <tr key={vendor._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-400 font-medium text-sm">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-[11px] font-semibold border border-slate-200 text-center">
                        {vendor.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0 line-clamp-1">
                          {vendor.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{vendor.name}</div>
                          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {vendor.country}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-700">{vendor.email}</div>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100/50 hover:bg-indigo-100 transition-colors cursor-pointer">{vendor.ptft}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer">{vendor.motherTongue}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-widest pl-0.5">
                            <span>Service</span>
                            <span>{vendor.serviceQuality}/5</span>
                          </div>
                          <StarRating rating={vendor.serviceQuality} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-widest pl-0.5">
                            <span>Task</span>
                            <span>{vendor.taskQuality}/5</span>
                          </div>
                          <StarRating rating={vendor.taskQuality} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(vendor)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                          title="Edit Vendor"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm"
                          title="Delete Vendor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing <span className="text-slate-900 font-semibold">{filteredVendors.length}</span> of <span className="text-slate-900 font-semibold">{vendors.length}</span> Vendors
            </p>
            <div className="flex items-center gap-1">
              <button disabled className="px-3 py-1.5 text-sm font-medium text-slate-400 bg-white border border-slate-200 rounded-lg hover:text-indigo-600 transition-colors disabled:opacity-50 cursor-not-allowed">
                Previous
              </button>
              <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold text-sm shadow-sm shadow-indigo-200 ml-1">1</button>
              <button className="w-8 h-8 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-100 transition-all">2</button>
              <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-indigo-600 hover:border-indigo-200 transition-colors ml-1">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Premium Add/Edit Vendor Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-[#fafbfc] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex flex-col h-full max-h-[90vh]">
                {/* Modal Header */}
                <div className="px-6 sm:px-10 py-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {editingVendor ? 'Modify Partner Details' : 'Onboard New Vendor'}
                    </h2>
                    <p className="text-slate-500 font-medium text-sm">Manage resource profile information</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 custom-scrollbar bg-[#fafbfc]">
                  <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
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

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-600 rounded-xl text-sm font-semibold transition-all shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
                      >
                        {editingVendor ? 'Save Changes' : 'Create Vendor'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
