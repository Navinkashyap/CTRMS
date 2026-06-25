import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Globe,
  MapPin,
  Calendar,
  ChevronLeft,
  Save,
  X,
  CheckCircle2,
  CircleAlert,
  Building,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { getDepartments } from '../lib/departmentApi';
import { createContact, updateContact } from '../lib/contactApi';
import { getClients } from '../lib/clientApi';
import { countryCodes } from '../lib/countryCodes';

export default function AddContact() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingContact = location.state?.contact;
  const isEditMode = Boolean(editingContact);

  const [formData, setFormData] = useState({
    salutation: 'Mr.',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    company: '',
    designation: '',
    status: 'Active',
    dob: '',
    department: '',
    countryCode: '+91',
    isWhatsapp: false,
    remark: ''
  });

  const [departments, setDepartments] = useState([]);
  const [clients, setClients] = useState([]);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depsData, clientsData] = await Promise.all([
          getDepartments(),
          getClients()
        ]);
        setDepartments(depsData);
        setClients(clientsData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();

    if (isEditMode) {
      setFormData(editingContact);
    }
  }, [editingContact, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMessage('');
      if (isEditMode) {
        await updateContact(editingContact._id, formData);
        setSuccessMessage('Contact updated successfully!');
      } else {
        await createContact(formData);
        setSuccessMessage('Contact added successfully!');
      }
      setTimeout(() => {
        navigate('/contacts');
      }, 1500);
    } catch (err) {
      console.error("Error saving contact:", err);
      setErrorMessage(err.response?.data?.message || 'Failed to save contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1000px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/contacts')}
              className="p-3 bg-white text-slate-600 hover:text-indigo-600 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
                {isEditMode ? 'Edit Contact' : 'Add New Contact'}
              </h1>
              <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Contact Directory Management
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600"></div>

          <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
            {successMessage && (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl animate-in slide-in-from-top-2">
                <CircleAlert className="w-5 h-5" />
                <span className="font-bold">{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Salutation + First Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">First Name <span className="text-rose-500">*</span></label>
                <div className="relative group flex gap-2">
                  <div className="relative w-[30%]">
                    <select
                      className="w-full px-3 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                      value={formData.salutation}
                      onChange={(e) => updateField('salutation', e.target.value)}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex justify-between items-center">
                  <span>Phone Number</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                      checked={formData.isWhatsapp}
                      onChange={(e) => updateField('isWhatsapp', e.target.checked)}
                    />
                    <span className="text-[9px] font-bold">WhatsApp</span>
                  </label>
                </label>
                <div className="relative group flex gap-2 w-full">
                  <div className="relative w-[90px] shrink-0">
                    <select
                      className="w-full px-2 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none cursor-pointer"
                      value={formData.countryCode}
                      onChange={(e) => updateField('countryCode', e.target.value)}
                      title={countryCodes.find(c => c.code === formData.countryCode)?.label || 'Country Code'}
                    >
                      {countryCodes.map((c) => (
                        <option key={c.label} value={c.code}>{c.code} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="tel"
                      maxLength={10}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Client</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <select
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    value={formData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                  >
                    <option value="" disabled>Select Client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client.name}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Designation</label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    placeholder="Enter designation"
                    value={formData.designation}
                    onChange={(e) => updateField('designation', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Department */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Department</label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <select
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                  >
                    <option value="" disabled>Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Date of Birth</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="date"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.dob}
                    onChange={(e) => updateField('dob', e.target.value)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Status</label>
                <select
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Remark */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Remark</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <textarea
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none min-h-[100px]"
                    placeholder="Enter remarks..."
                    value={formData.remark}
                    onChange={(e) => updateField('remark', e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-end gap-4 border-t border-slate-50">
              <button
                type="button"
                onClick={() => navigate('/contacts')}
                className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 border border-slate-200"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 hover:translate-y-[-2px] transition-all active:scale-95 flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditMode ? 'Update Contact' : 'Save Contact'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
