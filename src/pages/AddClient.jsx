import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Building2,
  ChevronLeft,
  CircleAlert,
  CircleCheckBig,
  CircleDollarSign,
  Calendar,
  Flag,
  Globe,
  Mail,
  Map,
  MapPin,
  Phone,
  UploadCloud,
  FileText,
  X,
  Briefcase,
  Paperclip,
  User,
  MessageSquare,
} from 'lucide-react';

import { createClient, getNextMembershipCode, updateClient } from '../lib/clientApi';
import { getTypes } from '../lib/typeApi';
import { getMemberships } from '../lib/membershipApi';
import { getCountries, createCountry } from '../lib/countryApi';
import { getStates, createState } from '../lib/stateApi';
import { getCities, createCity } from '../lib/cityApi';
import { countryCodes } from '../lib/countryCodes';

const getInitialFormData = () => ({
  domain: '',
  status: 'Client',
  membership: [],
  membershipCode: '',
  name: '',
  website: '',
  email: '',
  phone: '',
  countryCode: '+91',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  currency: 'USD',
  gstIn: '',
  vat: '',
  registrationDate: new Date().toISOString().split('T')[0],
  createdBy: 'System Admin',
  notes: '',
});

const normalizeClientForForm = (client) => {
  let countryCode = '+91';
  let phone = client?.phone || '';
  
  const knownCodes = ['+91', '+1', '+44', '+61', '+971', '+65', '+86', '+81', '+49', '+33'];
  for (const code of knownCodes) {
    if (phone.startsWith(code + ' ')) {
      countryCode = code;
      phone = phone.substring(code.length + 1);
      break;
    } else if (phone.startsWith(code + '-')) {
      countryCode = code;
      phone = phone.substring(code.length + 1);
      break;
    } else if (phone.startsWith(code)) {
      countryCode = code;
      phone = phone.substring(code.length);
      break;
    }
  }

  return {
    ...getInitialFormData(),
    ...client,
    countryCode,
    phone,
    membership: Array.isArray(client?.membership) ? client.membership : client?.membership ? [client.membership] : [],
    state: client?.state || '',
    zip: client?.zip || '',
    registrationDate: client?.registrationDate
      ? new Date(client.registrationDate).toISOString().split('T')[0]
      : getInitialFormData().registrationDate,
    existingDocuments: client?.documents || [],
    gstIn: client?.gstIn || '',
    vat: client?.vat || '',
    notes: client?.notes || '',
  };
};

const inputClass =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all';

const FormField = ({ icon: Icon, label, required, children, className = '' }) => (
  <div className={`flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 focus-within:border-indigo-100 focus-within:bg-white transition-colors ${className}`}>
    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-indigo-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      {children}
    </div>
  </div>
);

const getStatusBadgeClass = (status) => {
  if (['Active', 'Client'].includes(status)) {
    return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
  }
  if (['Onboarding', 'Prospect Warm'].includes(status)) {
    return 'text-amber-700 bg-amber-50 border border-amber-200';
  }
  if (status === 'Prospect Cold') {
    return 'text-blue-700 bg-blue-50 border border-blue-200';
  }
  return 'text-slate-600 bg-slate-100 border border-slate-200';
};

export default function AddClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingClient = location.state?.client;
  const isEditMode = Boolean(editingClient?._id);

  const [formData, setFormData] = useState(getInitialFormData);
  const [loadingCode, setLoadingCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [domains, setDomains] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [typesData, membershipsData, countriesData, statesData, citiesData] = await Promise.all([
          getTypes(),
          getMemberships(),
          getCountries(),
          getStates(),
          getCities()
        ]);
        setDomains(typesData.filter(t => t.status === 'Active'));
        setMemberships(membershipsData.filter(m => m.status === 'Active'));
        setCountries(countriesData.filter(c => c.status === 'Active'));
        setStates(statesData.filter(s => s.status === 'Active'));
        setCities(citiesData.filter(c => c.status === 'Active'));

        // Set defaults if not editing
        if (!isEditMode) {
          setFormData(prev => ({
            ...prev,
            domain: typesData[0]?.type || '',
            membership: [],
          }));
        }
      } catch (error) {
        console.error('Error loading options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    const loadMembershipCode = async () => {
      setLoadingCode(true);
      setErrorMessage('');

      try {
        const membershipCode = await getNextMembershipCode();
        setFormData((prev) => ({
          ...prev,
          membershipCode,
        }));
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Could not load membership code.');
      } finally {
        setLoadingCode(false);
      }
    };

    loadOptions();

    if (isEditMode) {
      setFormData(normalizeClientForForm(editingClient));
      return;
    }

    setFormData(getInitialFormData());
    loadMembershipCode();
  }, [editingClient, isEditMode]);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCountryChange = async (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      const newName = window.prompt('Enter new Country name:');
      if (newName?.trim()) {
        const code = window.prompt('Enter Country Code (e.g., +1):') || '+00';
        try {
          const newCountry = await createCountry({
            name: newName.trim(),
            code: code.trim(),
            shortName: newName.substring(0, 3).toUpperCase(),
            status: 'Active'
          });
          setCountries(prev => [...prev, newCountry]);
          updateField('country', newCountry.name);
          updateField('currency', newName.trim().toLowerCase() === 'india' ? 'INR' : formData.currency);
        } catch (err) {
          alert('Failed to add new country.');
          updateField('country', '');
        }
      } else {
        updateField('country', '');
      }
    } else {
      updateField('country', value);
      if (value.toLowerCase() === 'india') {
        updateField('currency', 'INR');
      }
    }
  };

  const handleStateChange = async (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      const newName = window.prompt('Enter new State name:');
      if (newName?.trim()) {
        try {
          const newState = await createState({
            name: newName.trim(),
            shortName: newName.substring(0, 2).toUpperCase(),
            country: formData.country || 'Unknown',
            status: 'Active'
          });
          setStates(prev => [...prev, newState]);
          updateField('state', newState.name);
        } catch (err) {
          alert('Failed to add new state.');
          updateField('state', '');
        }
      } else {
        updateField('state', '');
      }
    } else {
      updateField('state', value);
    }
  };

  const handleCityChange = async (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      const newName = window.prompt('Enter new City name:');
      if (newName?.trim()) {
        try {
          const newCity = await createCity({
            name: newName.trim(),
            shortName: newName.substring(0, 3).toUpperCase(),
            district: newName.trim(),
            status: 'Active'
          });
          setCities(prev => [...prev, newCity]);
          updateField('city', newCity.name);
        } catch (err) {
          alert('Failed to add new city.');
          updateField('city', '');
        }
      } else {
        updateField('city', '');
      }
    } else {
      updateField('city', value);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      existingDocuments: prev.existingDocuments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('domain', formData.domain.trim());
      formDataToSend.append('status', formData.status);
      if (Array.isArray(formData.membership)) {
        formData.membership.forEach(m => formDataToSend.append('membership', m));
      } else {
        formDataToSend.append('membership', formData.membership || '');
      }
      formDataToSend.append('membershipCode', formData.membershipCode.trim());
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('website', formData.website.trim());
      if (formData.email) formDataToSend.append('email', formData.email.trim());
      
      const formattedPhone = formData.phone.trim() ? `${formData.countryCode} ${formData.phone.trim()}` : '';
      formDataToSend.append('phone', formattedPhone);
      
      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('city', formData.city.trim());
      if (formData.state) formDataToSend.append('state', formData.state.trim());
      if (formData.zip) formDataToSend.append('zip', formData.zip.trim());
      formDataToSend.append('country', formData.country.trim());
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('gstIn', formData.gstIn.trim());
      formDataToSend.append('vat', formData.vat.trim());
      formDataToSend.append('registrationDate', formData.registrationDate);
      formDataToSend.append('createdBy', formData.createdBy || 'System Admin');
      formDataToSend.append('notes', formData.notes || '');

      if (isEditMode) {
        formDataToSend.append('existingDocuments', JSON.stringify(formData.existingDocuments || []));
      }

      selectedFiles.forEach(file => {
        formDataToSend.append('documents', file);
      });

      if (isEditMode) {
        await updateClient(editingClient._id, formDataToSend);
      } else {
        await createClient(formDataToSend);
      }

      setSuccessMessage(isEditMode ? 'Client updated successfully.' : 'Client created successfully.');
      setTimeout(() => navigate('/clients'), 700);
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      setErrorMessage(
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors.join(', ')
          : error.response?.data?.message || 'Unable to save client right now.'
      );
    } finally {
      setSaving(false);
    }
  };

  const getFileUrl = (url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
      : 'http://localhost:5000';
    return `${backendUrl}${url}`;
  };


  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8">
      <div className="max-w-[1000px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 sm:px-8 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/clients')}
              className="p-2.5 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3 flex-wrap">
                {isEditMode ? formData.name || 'Edit Client' : 'Add New Client'}
                {isEditMode && formData.status && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(formData.status)}`}>
                    {formData.status}
                  </span>
                )}
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">
                {isEditMode ? 'Edit Client Profile & Details' : 'Client Profile & Details'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
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

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Primary Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField icon={Building2} label="Company Name" required>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Company Name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </FormField>

                <FormField icon={Award} label="Client Code">
                  <input
                    type="text"
                    readOnly
                    className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`}
                    value={loadingCode ? 'Loading...' : formData.membershipCode?.replace('CLI-', '') || formData.membershipCode || ''}
                  />
                </FormField>

                <FormField icon={Globe} label="Domain">
                  <select
                    className={inputClass}
                    value={formData.domain}
                    onChange={(e) => updateField('domain', e.target.value)}
                  >
                    {loadingOptions ? (
                      <option>Loading domains...</option>
                    ) : domains.length > 0 ? (
                      domains.map((d) => (
                        <option key={d.id} value={d.type}>
                          {d.type}
                        </option>
                      ))
                    ) : (
                      <option>No domains found</option>
                    )}
                  </select>
                </FormField>

                <FormField icon={Award} label="Status" required>
                  <select
                    className={inputClass}
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Status</option>
                    <option value="Client">Client</option>
                    <option value="Prospect Warm">Prospect Warm</option>
                    <option value="Prospect Cold">Prospect Cold</option>
                  </select>
                </FormField>

                <FormField icon={Calendar} label="Registration Date">
                  <input
                    type="date"
                    className={inputClass}
                    value={formData.registrationDate}
                    onChange={(e) => updateField('registrationDate', e.target.value)}
                  />
                </FormField>

                <FormField icon={User} label="Created By">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Created By"
                    value={formData.createdBy}
                    onChange={(e) => updateField('createdBy', e.target.value)}
                  />
                </FormField>

                <FormField icon={Award} label="Membership" className="md:col-span-2 lg:col-span-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    {loadingOptions ? (
                      <p className="text-xs text-slate-400">Loading memberships...</p>
                    ) : memberships.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {memberships.map((m) => (
                          <label key={m.id || m._id} className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                className="peer h-4 w-4 appearance-none rounded border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                                checked={formData.membership.includes(m.name)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFormData((prev) => ({
                                    ...prev,
                                    membership: checked
                                      ? [...prev.membership, m.name]
                                      : prev.membership.filter((name) => name !== m.name),
                                  }));
                                }}
                              />
                              <CircleCheckBig className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" />
                            </div>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs font-semibold">
                              {m.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No memberships found</p>
                    )}
                  </div>
                </FormField>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField icon={Mail} label="Email Address">
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </FormField>

                <FormField icon={Phone} label="Phone Number">
                  <div className="flex gap-2 w-full">
                    <select
                      className="px-2 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-[100px] shrink-0"
                      value={formData.countryCode}
                      onChange={(e) => updateField('countryCode', e.target.value)}
                      title={countryCodes.find(c => c.code === formData.countryCode)?.label || 'Country Code'}
                    >
                      {countryCodes.map((c) => (
                        <option key={c.label} value={c.code}>{c.code} {c.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      maxLength={10}
                      className="flex-1 min-w-0 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                  </div>
                </FormField>

                <FormField icon={Globe} label="Website">
                  <input
                    type="url"
                    className={inputClass}
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <FormField icon={MapPin} label="Full Address" className="md:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-[88px] resize-y`}
                    placeholder="Full Address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField icon={Map} label="City">
                  <select className={inputClass} value={formData.city} onChange={handleCityChange}>
                    <option value="" disabled>Select City</option>
                    {cities.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="add_new" className="text-indigo-600 font-semibold">+ Add New City</option>
                  </select>
                </FormField>

                <FormField icon={MapPin} label="State">
                  <select className={inputClass} value={formData.state || ''} onChange={handleStateChange}>
                    <option value="" disabled>Select State</option>
                    {states.map((s) => (
                      <option key={s._id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="add_new" className="text-indigo-600 font-semibold">+ Add New State</option>
                  </select>
                </FormField>

                <FormField icon={Flag} label="Country">
                  <select className={inputClass} value={formData.country} onChange={handleCountryChange}>
                    <option value="" disabled>Select Country</option>
                    {countries.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="add_new" className="text-indigo-600 font-semibold">+ Add New Country</option>
                  </select>
                </FormField>

                <FormField icon={MapPin} label="ZIP Code">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="ZIP Code"
                    value={formData.zip || ''}
                    onChange={(e) => updateField('zip', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-amber-500" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField icon={CircleDollarSign} label="Preferred Currency">
                  <select className={inputClass} value={formData.currency} onChange={(e) => updateField('currency', e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR (Rs.)</option>
                  </select>
                </FormField>

                <FormField icon={Award} label="GSTIN">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="GST Number"
                    value={formData.gstIn}
                    onChange={(e) => updateField('gstIn', e.target.value)}
                  />
                </FormField>

                <FormField icon={Award} label="VAT Number">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="VAT Number"
                    value={formData.vat}
                    onChange={(e) => updateField('vat', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField icon={MessageSquare} label="Notes / Comments">
                  <textarea
                    className={`${inputClass} min-h-[120px] resize-y`}
                    placeholder="Enter any notes or comments about this client..."
                    value={formData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-indigo-500" />
                Uploaded Documents
              </h3>

              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer mb-4">
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                  <UploadCloud className="w-8 h-8 mb-3" />
                  <p className="text-sm font-semibold">Click to upload or drag and drop</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">PDF, DOCX, JPG, PNG up to 10MB each</p>
                </div>
              </div>

              {(formData.existingDocuments?.length > 0 || selectedFiles.length > 0) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.existingDocuments?.map((doc, idx) => (
                    <div
                      key={`existing-${idx}`}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-md transition-all group"
                    >
                      <a
                        href={getFileUrl(doc.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 overflow-hidden flex-1 min-w-0"
                      >
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
                          <FileText className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-800 text-sm truncate" title={doc.name}>{doc.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to view</p>
                        </div>
                      </a>
                      <button
                        type="button"
                        onClick={() => removeExistingDocument(idx)}
                        className="p-1.5 ml-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {selectedFiles.map((file, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100 transition-all"
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-800 text-sm truncate" title={file.name}>{file.name}</p>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">New upload</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(idx)}
                        className="p-1.5 ml-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-slate-50/30 rounded-3xl border border-dashed border-slate-200">
                  <Paperclip className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-sm font-medium text-slate-400">No documents uploaded for this client.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60"
              >
                {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
