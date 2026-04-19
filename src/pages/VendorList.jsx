import React, { useState } from 'react';
import { 
  Filter, 
  Settings, 
  UserPlus, 
  Edit3, 
  ChevronDown,
  ArrowUpDown,
  Star,
  Plus,
  Search
} from 'lucide-react';

const initialVendors = [
  { id: 1, code: '2', name: 'Diwakar Mani', email: 'diwakarmani@gmail.com', country: 'IND', motherTongue: 'HIN', ptft: 'PT', serviceQuality: 0, taskQuality: 0, timelyDelivery: 0 },
  { id: 2, code: '1134', name: 'YVONE HABON', email: 'yvez22.lh@gmail.com', country: 'PHL', motherTongue: 'ILO', ptft: 'FT', serviceQuality: 0, taskQuality: 0, timelyDelivery: 0 },
  { id: 3, code: '5', name: 'Diptirekha Das', email: 'sibtmail@yahoo.com', country: 'IND', motherTongue: 'ASM', ptft: 'PT', serviceQuality: 3, taskQuality: 3, timelyDelivery: 3 },
  { id: 4, code: '6', name: 'Nasim Zaman', email: 'zamansn@gmail.com', country: 'IND', motherTongue: 'ASM', ptft: 'FT', serviceQuality: 0, taskQuality: 0, timelyDelivery: 0 },
  { id: 5, code: '874', name: 'Test Test', email: 'nextbraveheart@gmail.com', country: 'IND', motherTongue: 'HIN', ptft: 'FT', serviceQuality: 0, taskQuality: 0, timelyDelivery: 0 },
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={16} 
          className={`${star <= rating ? 'fill-slate-700 text-slate-700' : 'text-slate-300'}`} 
        />
      ))}
    </div>
  );
};

export default function VendorList() {
  const [vendors, setVendors] = useState(initialVendors);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingVendor) {
      setVendors(vendors.map(v => v.id === editingVendor.id ? { 
        ...v, 
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        country: formData.country,
        ptft: formData.availability === 'Full Time' ? 'FT' : 'PT'
      } : v));
      setEditingVendor(null);
    } else {
      const newVendor = {
        id: Date.now(),
        code: Math.floor(Math.random() * 10000).toString(),
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        country: formData.country || 'N/A',
        motherTongue: 'N/A',
        ptft: formData.availability === 'Full Time' ? 'FT' : 'PT',
        serviceQuality: 0,
        taskQuality: 0,
        timelyDelivery: 0
      };
      setVendors(prev => [...prev, newVendor]);
    }
    setIsModalOpen(false);
    // Reset form
    setFormData({
      firstName: '', lastName: '', mobile: '', email: '', dob: '', gender: '',
      country: '', state: '', city: '', zipCode: '', availability: 'Full Time',
      address: '', isActive: true
    });
  };

  const handleEdit = (vendor) => {
    const [first, ...last] = vendor.name.split(' ');
    setEditingVendor(vendor);
    setFormData({
      firstName: first,
      lastName: last.join(' '),
      email: vendor.email,
      country: vendor.country,
      availability: vendor.ptft === 'FT' ? 'Full Time' : 'Part Time',
      isActive: true,
      // Placeholder for others
      mobile: '', dob: '', gender: '', state: '', city: '', zipCode: '', address: ''
    });
    setIsModalOpen(true);
  };

  const filteredVendors = vendors.filter(vendor => 
    Object.keys(filters).every(key => 
      vendor[key].toString().toLowerCase().includes(filters[key].toLowerCase())
    )
  );

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-8 p-4">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Vendor Directory</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setEditingVendor(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Vendor
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#eef2ff] p-4 rounded flex flex-wrap items-end gap-6 border-l-4 border-indigo-200">
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-bold text-slate-600">Service</label>
            <div className="relative">
              <select className="w-full h-10 px-3 bg-white border border-slate-200 rounded text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>Select Service</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-bold text-slate-600">Source</label>
            <div className="relative">
              <select className="w-full h-10 px-3 bg-white border border-slate-200 rounded text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>English</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-bold text-slate-600">Target</label>
            <div className="relative">
              <select className="w-full h-10 px-3 bg-white border border-slate-200 rounded text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>Select Target</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex-[2]"></div>
        </div>

        {/* Vendor Table */}
        <div className="border border-slate-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  <th className="p-3 w-12 font-bold text-slate-600 border-r">#</th>
                  <th className="p-1 font-bold text-slate-600 border-r">
                    <div className="flex flex-col gap-1 p-1">
                      <div className="flex items-center justify-between">
                        <span>Code</span>
                        <ArrowUpDown className="w-3 h-3 cursor-pointer" />
                      </div>
                      <input 
                        type="text" 
                        className="w-full h-7 px-2 border rounded focus:outline-none font-normal"
                        value={filters.code}
                        onChange={(e) => handleFilterChange('code', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-1 font-bold text-slate-600 border-r">
                    <div className="flex flex-col gap-1 p-1">
                      <div className="flex items-center justify-between">
                        <span>Full Name</span>
                        <ArrowUpDown className="w-3 h-3 cursor-pointer" />
                      </div>
                      <input 
                        type="text" 
                        className="w-full h-7 px-2 border rounded focus:outline-none font-normal"
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-1 font-bold text-slate-600 border-r">
                    <div className="flex flex-col gap-1 p-1">
                      <div className="flex items-center justify-between">
                        <span>Email</span>
                        <ArrowUpDown className="w-3 h-3 cursor-pointer" />
                      </div>
                      <input 
                        type="text" 
                        className="w-full h-7 px-2 border rounded focus:outline-none font-normal"
                        value={filters.email}
                        onChange={(e) => handleFilterChange('email', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-1 font-bold text-slate-600 border-r">
                    <div className="flex flex-col gap-1 p-1">
                      <div className="flex items-center justify-between">
                        <span>Country</span>
                        <ArrowUpDown className="w-3 h-3 cursor-pointer" />
                      </div>
                      <input 
                        type="text" 
                        className="w-full h-7 px-2 border rounded focus:outline-none font-normal"
                        value={filters.country}
                        onChange={(e) => handleFilterChange('country', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-1 font-bold text-slate-600 border-r">
                    <div className="flex flex-col gap-1 p-1">
                      <div className="flex items-center justify-between">
                        <span>Mother Tongue</span>
                        <ArrowUpDown className="w-3 h-3 cursor-pointer" />
                      </div>
                      <input 
                        type="text" 
                        className="w-full h-7 px-2 border rounded focus:outline-none font-normal"
                        value={filters.motherTongue}
                        onChange={(e) => handleFilterChange('motherTongue', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-1 font-bold text-slate-600 border-r">
                    <div className="flex flex-col gap-1 p-1">
                      <div className="flex items-center justify-between">
                        <span>PT/FT</span>
                        <ArrowUpDown className="w-3 h-3 cursor-pointer" />
                      </div>
                      <input 
                        type="text" 
                        className="w-full h-7 px-2 border rounded focus:outline-none font-normal"
                        value={filters.ptft}
                        onChange={(e) => handleFilterChange('ptft', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-3 font-bold text-slate-600 border-r">Service Quality</th>
                  <th className="p-3 font-bold text-slate-600 border-r">Task Quality</th>
                  <th className="p-3 font-bold text-slate-600 border-r">Timely Delivery</th>
                  <th className="p-3 font-bold text-slate-600 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.map((vendor, index) => (
                  <tr key={vendor.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100 transition-colors`}>
                    <td className="p-3 text-slate-600 border-r">{index + 1}</td>
                    <td className="p-3 text-slate-700 font-medium border-r">{vendor.code}</td>
                    <td className="p-3 text-slate-700 border-r">{vendor.name}</td>
                    <td className="p-3 text-slate-600 border-r text-[13px]">{vendor.email}</td>
                    <td className="p-3 text-slate-700 border-r">{vendor.country}</td>
                    <td className="p-3 text-slate-700 border-r">{vendor.motherTongue}</td>
                    <td className="p-3 text-slate-700 border-r">{vendor.ptft}</td>
                    <td className="p-3 border-r">
                      <StarRating rating={vendor.serviceQuality} />
                    </td>
                    <td className="p-3 border-r">
                      <StarRating rating={vendor.taskQuality} />
                    </td>
                    <td className="p-3 border-r">
                      <StarRating rating={vendor.timelyDelivery} />
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleEdit(vendor)}
                        className="p-2 bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Vendor Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl bg-white animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="firstName"
                        required
                        placeholder="Enter First Name"
                        className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.firstName}
                        onChange={handleFormChange}
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        name="lastName"
                        required
                        placeholder="Enter Last Name"
                        className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.lastName}
                        onChange={handleFormChange}
                      />
                    </div>

                    {/* Mobile */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-sm font-bold text-slate-700">
                        Mobile <span className="text-red-500">*</span>
                      </label>
                      <div className="flex h-11 border border-slate-200 rounded-lg overflow-hidden">
                        <div className="flex items-center gap-1.5 px-3 bg-slate-50 border-r border-slate-200 text-sm font-medium text-slate-600">
                          <img src="https://flagcdn.com/in.svg" alt="India" className="w-5 h-3.5 object-cover rounded-sm" />
                          <span>+91</span>
                          <ChevronDown size={14} />
                        </div>
                        <input 
                          type="tel" 
                          name="mobile"
                          required
                          placeholder="Enter Mobile No"
                          className="flex-1 px-4 text-sm focus:outline-none"
                          value={formData.mobile}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        placeholder="Enter Email"
                        className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.email}
                        onChange={handleFormChange}
                      />
                    </div>

                    {/* DOB */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">
                        DOB <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type="date" 
                          name="dob"
                          required
                          className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none bg-white"
                          value={formData.dob}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          name="gender"
                          required
                          className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={formData.gender}
                          onChange={handleFormChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          name="country"
                          required
                          className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={formData.country}
                          onChange={handleFormChange}
                        >
                          <option value="">Select</option>
                          <option value="India">India</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* State */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">State</label>
                      <div className="relative">
                        <select 
                          name="state"
                          className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={formData.state}
                          onChange={handleFormChange}
                        >
                          <option value="">Select</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">City</label>
                      <div className="relative">
                        <select 
                          name="city"
                          className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          value={formData.city}
                          onChange={handleFormChange}
                        >
                          <option value="">Select</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Zip Code */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700">Zip Code</label>
                      <input 
                        type="text" 
                        name="zipCode"
                        placeholder="Zip Code"
                        className="w-full h-11 px-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={formData.zipCode}
                        onChange={handleFormChange}
                      />
                    </div>

                    {/* Availability */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 block">Availability</label>
                      <div className="flex items-center gap-6 h-11">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="availability"
                            value="Full Time"
                            checked={formData.availability === 'Full Time'}
                            onChange={handleFormChange}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Full Time</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="availability"
                            value="Part Time"
                            checked={formData.availability === 'Part Time'}
                            onChange={handleFormChange}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Part Time</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">Address</label>
                    <textarea 
                      name="address"
                      placeholder="Enter Address"
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      value={formData.address}
                      onChange={handleFormChange}
                    />
                  </div>

                  {/* Active Checkbox */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      name="isActive"
                      id="isActive"
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">Active</label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center gap-3 pt-4">
                    <button 
                      type="submit"
                      className="px-8 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-200"
                    >
                      Add
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
