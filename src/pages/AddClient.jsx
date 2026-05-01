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
  membership: '',
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
    membership: client?.membership || '',
    state: client?.state || '',
    zip: client?.zip || '',
    registrationDate: client?.registrationDate
      ? new Date(client.registrationDate).toISOString().split('T')[0]
      : getInitialFormData().registrationDate,
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
            membership: membershipsData[0]?.name || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        domain: formData.domain.trim(),
        status: formData.status,
        membership: formData.membership,
        membershipCode: formData.membershipCode.trim(),
        name: formData.name.trim(),
        website: formData.website.trim(),
        email: formData.email ? formData.email.trim() : formData.email,
        phone: formData.phone.trim() ? `${formData.countryCode} ${formData.phone.trim()}` : '',
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state ? formData.state.trim() : '',
        zip: formData.zip ? formData.zip.trim() : '',
        country: formData.country.trim(),
        currency: formData.currency,
        registrationDate: formData.registrationDate,
        createdBy: formData.createdBy || 'System Admin',
      };

      if (isEditMode) {
        await updateClient(editingClient._id, payload);
      } else {
        await createClient(payload);
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

            <div className="space-y-6">
              {/* Row 1: Company Name */}
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

              {/* Row 2: Website | Phone | Email */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </div>

              {/* Row 3: Address */}
              <div className="space-y-2 md:max-w-2xl">
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

              {/* Row 4: City | State | Country | ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

              {/* Row 5: Status | Domain | Membership | Currency */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Membership</label>
                  <div className="relative group">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500" />
                    <select
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none appearance-none"
                      value={formData.membership}
                      onChange={(e) => updateField('membership', e.target.value)}
                    >
                      {loadingOptions ? (
                        <option>Loading...</option>
                      ) : memberships.length > 0 ? (
                        memberships.map((m) => (
                          <option key={m.id} value={m.name}>
                            {m.name}
                          </option>
                        ))
                      ) : (
                        <option>No memberships found</option>
                      )}
                    </select>
                  </div>
                </div>
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
