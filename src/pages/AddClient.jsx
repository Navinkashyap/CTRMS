import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Building2,
  ChevronLeft,
  CircleAlert,
  CircleCheckBig,
  CircleDollarSign,
  Flag,
  Globe,
  LoaderCircle,
  Mail,
  Map,
  MapPin,
  Phone,
  Save,
  UploadCloud,
  FileText,
  X,
  Briefcase,
  Paperclip,
} from 'lucide-react';

import { createClient, getNextMembershipCode, updateClient } from '../lib/clientApi';
import { getTypes } from '../lib/typeApi';
import { getMemberships } from '../lib/membershipApi';
import { getCountries, createCountry } from '../lib/countryApi';
import { getStates, createState } from '../lib/stateApi';
import { getCities, createCity } from '../lib/cityApi';

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
  };
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
            membership: membershipsData[0]?.name ? [membershipsData[0].name] : [],
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

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1000px] mx-auto space-y-8">
        <div className="flex items-center justify-between bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/clients')}
              className="p-3 bg-white text-slate-600 hover:text-indigo-600 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
                {isEditMode ? 'Edit Client' : 'Add New Client'}
              </h1>
              <p className="text-slate-500 font-medium tracking-wide">Client Identity Management</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 lg:p-12 space-y-6">
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

                        <div className="space-y-10">
              {/* Section 1: Primary Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  Primary Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Company Name <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <input
                        type="text"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                        placeholder="Company Name"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Domain */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Domain</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <select
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none"
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
                    </div>
                  </div>
                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Status <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                      value={formData.status}
                      onChange={(e) => updateField('status', e.target.value)}
                      required
                    >
                      <option value="" disabled>Select Status</option>
                      <option value="Client">Client</option>
                      <option value="Prospect Warm">Prospect Warm</option>
                      <option value="Prospect Cold">Prospect Cold</option>
                    </select>
                  </div>
                  {/* Membership */}
                  <div className="space-y-2 lg:col-span-3">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Membership</label>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      {loadingOptions ? (
                        <p className="text-xs text-slate-400 animate-pulse">Loading memberships...</p>
                      ) : memberships.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                          {memberships.map((m) => (
                            <label key={m.id || m._id} className="flex items-center gap-3 cursor-pointer group">
                              <div className="relative flex items-center">
                                <input
                                  type="checkbox"
                                  className="peer h-5 w-5 appearance-none rounded border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                                  checked={formData.membership.includes(m.name)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setFormData(prev => ({
                                      ...prev,
                                      membership: checked 
                                        ? [...prev.membership, m.name]
                                        : prev.membership.filter(name => name !== m.name)
                                    }));
                                  }}
                                />
                                <CircleCheckBig className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" />
                              </div>
                              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{m.name}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No memberships found</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Section 2: Contact Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-500" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Email <span className="text-red-500">*</span></label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <input
                        type="email"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Phone</label>
                    <div className="relative group flex gap-2">
                      <div className="relative w-1/3">
                        <select
                          className="w-full px-2 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                          value={formData.countryCode}
                          onChange={(e) => updateField('countryCode', e.target.value)}
                        >
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US/CA)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+61">+61 (AU)</option>
                          <option value="+971">+971 (AE)</option>
                          <option value="+65">+65 (SG)</option>
                          <option value="+86">+86 (CN)</option>
                          <option value="+81">+81 (JP)</option>
                          <option value="+49">+49 (DE)</option>
                          <option value="+33">+33 (FR)</option>
                        </select>
                      </div>
                      <div className="relative w-2/3">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                        <input
                          type="tel"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                          placeholder="Phone"
                          value={formData.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Website */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Website</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <input
                        type="url"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                        placeholder="https://..."
                        value={formData.website}
                        onChange={(e) => updateField('website', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Section 3: Location Details */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  Location Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Address */}
                  <div className="space-y-2 w-full md:col-span-4">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <textarea
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none min-h-[100px]"
                        placeholder="Full Address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">City</label>
                    <div className="relative group">
                      <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <select
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                        value={formData.city}
                        onChange={handleCityChange}
                      >
                        <option value="" disabled>Select City</option>
                        {cities.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        <option value="add_new" className="text-indigo-600 font-bold">+ Add New City</option>
                      </select>
                    </div>
                  </div>
                  {/* State */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">State</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <select
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                        value={formData.state || ''}
                        onChange={handleStateChange}
                      >
                        <option value="" disabled>Select State</option>
                        {states.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        <option value="add_new" className="text-indigo-600 font-bold">+ Add New State</option>
                      </select>
                    </div>
                  </div>
                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Country</label>
                    <div className="relative group">
                      <Flag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <select
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                        value={formData.country}
                        onChange={handleCountryChange}
                      >
                        <option value="" disabled>Select Country</option>
                        {countries.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        <option value="add_new" className="text-indigo-600 font-bold">+ Add New Country</option>
                      </select>
                    </div>
                  </div>
                  {/* ZIP */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">ZIP</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <input
                        type="text"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                        placeholder="ZIP"
                        value={formData.zip || ''}
                        onChange={(e) => updateField('zip', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Section 4: Financial Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-amber-500" />
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Currency */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Currency</label>
                    <div className="relative group">
                      <CircleDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                      <select
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                        value={formData.currency}
                        onChange={(e) => updateField('currency', e.target.value)}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR (Rs.)</option>
                      </select>
                    </div>
                  </div>
                  {/* GSTIN */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">GSTIN</label>
                    <div className="relative group">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                        placeholder="GST Number"
                        value={formData.gstIn}
                        onChange={(e) => updateField('gstIn', e.target.value)}
                      />
                    </div>
                  </div>
                  {/* VAT */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">VAT Number</label>
                    <div className="relative group">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                        placeholder="VAT Number"
                        value={formData.vat}
                        onChange={(e) => updateField('vat', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Section 5: Documents */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-indigo-500" />
                  Uploaded Documents
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors group cursor-pointer">
                    <input
                      type="file"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                      <UploadCloud className="w-8 h-8 mb-3" />
                      <p className="text-sm font-bold">Click to upload or drag and drop</p>
                      <p className="text-xs font-medium text-slate-400 mt-1">PDF, DOCX, JPG, PNG up to 10MB each</p>
                    </div>
                  </div>

                  {((formData.existingDocuments && formData.existingDocuments.length > 0) || selectedFiles.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                      {formData.existingDocuments && formData.existingDocuments.map((doc, idx) => (
                        <div key={`existing-${idx}`} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 truncate">{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingDocument(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {selectedFiles.map((file, idx) => (
                        <div key={`new-${idx}`} className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 truncate">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
