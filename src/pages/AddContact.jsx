import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  CircleAlert,
  CircleCheckBig,
} from 'lucide-react';
import { getDepartments } from '../lib/departmentApi';
import { createContact, updateContact } from '../lib/contactApi';
import { getClients } from '../lib/clientApi';
import { countryCodes } from '../lib/countryCodes';

const byNameAsc = (a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });

const emptyContact = {
  salutation: 'Mr.',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  company: '',
  clientId: '',
  clientCode: '',
  designation: '',
  status: 'Active',
  dob: '',
  department: '',
  countryCode: '+91',
  isWhatsapp: false,
  remark: '',
};

const inputClass =
  'w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs';

const FormField = ({ label, required, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const SelectField = ({ value, onChange, required, disabled, children, className = '' }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`${inputClass} appearance-none pr-9 cursor-pointer ${className}`}
    >
      {children}
    </select>
    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center">
      <ChevronDown className="w-4 h-4" />
    </div>
  </div>
);

// Type-search Country Code with ONLY numeric code shown
const NumericCountryCodeSearch = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typed, setTyped] = useState(value || '+91');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setTyped(value || '+91');
  }, [value]);

  const filtered = useMemo(() => {
    const q = typed.replace(/\+/g, '').trim().toLowerCase();
    if (!q) return countryCodes.slice(0, 40);
    return countryCodes.filter(
      (c) =>
        c.code.replace(/\+/g, '').includes(q) ||
        c.label.toLowerCase().includes(q)
    );
  }, [typed]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setTyped(value || '+91');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [value]);

  const handleSelect = (code) => {
    onChange(code);
    setTyped(code);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    let inputVal = e.target.value.trim();
    if (!inputVal.startsWith('+') && inputVal.length > 0) {
      inputVal = '+' + inputVal.replace(/\D/g, '');
    } else {
      inputVal = '+' + inputVal.slice(1).replace(/\D/g, '');
    }
    setTyped(inputVal);
    onChange(inputVal);
    setIsOpen(true);
  };

  return (
    <div className="relative w-24 shrink-0" ref={wrapperRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={typed}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="+91"
          className="w-full h-[42px] px-2.5 pr-6 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
        />
        <ChevronDown
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-auto cursor-pointer transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-56 overflow-y-auto p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <button
                key={`${c.code}-${c.label}`}
                type="button"
                onClick={() => handleSelect(c.code)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${
                  c.code === value ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="font-mono font-bold">{c.code}</span>
                <span className="text-slate-400 font-medium">({c.label})</span>
              </button>
            ))
          ) : (
            <p className="p-2.5 text-center text-slate-400 text-xs">No matching code</p>
          )}
        </div>
      )}
    </div>
  );
};

export default function AddContact() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingContact = location.state?.contact;
  const isEditMode = Boolean(editingContact);

  const [formData, setFormData] = useState(emptyContact);
  const [departments, setDepartments] = useState([]);
  const [clients, setClients] = useState([]);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depsData, clientsData] = await Promise.all([
          getDepartments().catch(() => []),
          getClients().catch(() => []),
        ]);
        setDepartments(depsData || []);
        setClients(clientsData || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();

    if (isEditMode && editingContact) {
      let phone = editingContact.phone || '';
      let countryCode = editingContact.countryCode || '+91';
      const matched = countryCodes.find((c) => phone.startsWith(c.code + ' ') || phone.startsWith(c.code));
      if (matched) {
        countryCode = matched.code;
        phone = phone.replace(matched.code, '').trim();
      }
      setFormData({
        ...emptyContact,
        ...editingContact,
        countryCode,
        phone: phone.replace(/\D/g, ''),
      });
    }
  }, [editingContact, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const sortedClients = useMemo(() => [...clients].sort(byNameAsc), [clients]);

  const handleClientChange = (e) => {
    const selectedName = e.target.value;
    const client = clients.find((c) => c.name === selectedName);
    setFormData((prev) => ({
      ...prev,
      company: selectedName,
      clientId: client?._id || '',
      clientCode: client?.membershipCode || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const payload = {
        ...formData,
        phone: formData.phone ? `${formData.countryCode} ${formData.phone}`.trim() : '',
      };

      if (isEditMode) {
        await updateContact(editingContact._id, payload);
        setSuccessMessage('Contact updated successfully!');
      } else {
        await createContact(payload);
        setSuccessMessage('Contact added successfully!');
      }
      setTimeout(() => {
        navigate('/contacts');
      }, 700);
    } catch (err) {
      console.error('Error saving contact:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to save contact. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-12 w-full space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/contacts')}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 shadow-xs transition-all shrink-0"
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Contact' : 'Add Client Contact'}
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-normal mt-0.5">
            Client Contact Profile & Details
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Section 1: Primary Information */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Primary Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Selection */}
              <FormField label="Client" required>
                <SelectField
                  value={formData.company}
                  onChange={handleClientChange}
                  required
                >
                  <option value="" disabled>Select client</option>
                  {sortedClients.map((client) => (
                    <option key={client._id} value={client.name}>
                      {client.name} {client.membershipCode ? `(${client.membershipCode})` : ''}
                    </option>
                  ))}
                </SelectField>
              </FormField>

              {/* Status */}
              <FormField label="Status" required>
                <SelectField
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </SelectField>
              </FormField>

              {/* Salutation + First Name */}
              <div className="flex items-start gap-3 w-full">
                <FormField label="Salutation" className="w-28 shrink-0">
                  <SelectField
                    value={formData.salutation}
                    onChange={(e) => updateField('salutation', e.target.value)}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                  </SelectField>
                </FormField>

                <FormField label="First Name" required className="flex-1 min-w-0">
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                  />
                </FormField>
              </div>

              {/* Last Name */}
              <FormField label="Last Name" required>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Contact Information */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Address */}
              <FormField label="Email Address" required>
                <input
                  type="email"
                  required
                  className={inputClass}
                  placeholder="contact@company.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </FormField>

              {/* Phone Number with WhatsApp toggle */}
              <FormField label="Phone Number">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 w-full">
                    <NumericCountryCodeSearch
                      value={formData.countryCode}
                      onChange={(val) => updateField('countryCode', val)}
                    />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={15}
                      className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                      checked={formData.isWhatsapp}
                      onChange={(e) => updateField('isWhatsapp', e.target.checked)}
                    />
                    <span className="text-xs font-semibold text-slate-600">Available on WhatsApp</span>
                  </label>
                </div>
              </FormField>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Professional Information */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Designation */}
              <FormField label="Designation">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Procurement Lead"
                  value={formData.designation}
                  onChange={(e) => updateField('designation', e.target.value)}
                />
              </FormField>

              {/* Department */}
              <FormField label="Department">
                {departments.length > 0 ? (
                  <SelectField
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d._id || d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </SelectField>
                ) : (
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. Localization"
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                  />
                )}
              </FormField>

              {/* Date of Birth */}
              <FormField label="Date of Birth">
                <input
                  type="date"
                  className={inputClass}
                  value={formData.dob || ''}
                  onChange={(e) => updateField('dob', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Additional Information */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Additional Information
            </h3>
            <div>
              <FormField label="Remarks / Notes">
                <textarea
                  rows={4}
                  className={`${inputClass} min-h-[110px] resize-y`}
                  placeholder="Enter any remarks or notes about this contact..."
                  value={formData.remark}
                  onChange={(e) => updateField('remark', e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/contacts')}
              className="px-6 py-2.5 bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Client Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
