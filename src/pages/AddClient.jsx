import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  CircleAlert,
  CircleCheckBig,
  UploadCloud,
  FileText,
  X,
} from 'lucide-react';

import { createClient, getClients, getNextMembershipCode, updateClient } from '../lib/clientApi';
import { getTypes } from '../lib/typeApi';
import { getMemberships } from '../lib/membershipApi';
import { getCountries } from '../lib/countryApi';
import { getStates } from '../lib/stateApi';
import { getCities } from '../lib/cityApi';
import { countryCodes } from '../lib/countryCodes';

// Comprehensive Country, State, City master data
const COUNTRY_DATA = [
  {
    name: 'India',
    code: '+91',
    currency: 'INR',
    states: [
      {
        name: 'Andhra Pradesh',
        cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati'],
      },
      {
        name: 'Assam',
        cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia'],
      },
      {
        name: 'Bihar',
        cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga'],
      },
      {
        name: 'Delhi',
        cities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
      },
      {
        name: 'Gujarat',
        cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar', 'Jamnagar'],
      },
      {
        name: 'Haryana',
        cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak'],
      },
      {
        name: 'Karnataka',
        cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davanagere', 'Ballari'],
      },
      {
        name: 'Kerala',
        cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur'],
      },
      {
        name: 'Madhya Pradesh',
        cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar'],
      },
      {
        name: 'Maharashtra',
        cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Navi Mumbai', 'Solapur'],
      },
      {
        name: 'Odisha',
        cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'],
      },
      {
        name: 'Punjab',
        cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'],
      },
      {
        name: 'Rajasthan',
        cities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara'],
      },
      {
        name: 'Tamil Nadu',
        cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode'],
      },
      {
        name: 'Telangana',
        cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam'],
      },
      {
        name: 'Uttar Pradesh',
        cities: ['Lucknow', 'Kanpur', 'Noida', 'Greater Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj'],
      },
      {
        name: 'Uttarakhand',
        cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Rishikesh'],
      },
      {
        name: 'West Bengal',
        cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman'],
      },
    ],
  },
  {
    name: 'United States',
    code: '+1',
    currency: 'USD',
    states: [
      {
        name: 'California',
        cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Oakland'],
      },
      {
        name: 'New York',
        cities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany'],
      },
      {
        name: 'Texas',
        cities: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington'],
      },
      {
        name: 'Florida',
        cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'St. Petersburg', 'Hialeah'],
      },
      {
        name: 'Illinois',
        cities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield'],
      },
      {
        name: 'Washington',
        cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent'],
      },
      {
        name: 'Massachusetts',
        cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton'],
      },
    ],
  },
  {
    name: 'United Kingdom',
    code: '+44',
    currency: 'GBP',
    states: [
      {
        name: 'England',
        cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol', 'Sheffield'],
      },
      {
        name: 'Scotland',
        cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling'],
      },
      {
        name: 'Wales',
        cities: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Bangor', 'St Asaph'],
      },
      {
        name: 'Northern Ireland',
        cities: ['Belfast', 'Derry', 'Lisburn', 'Newry', 'Armagh'],
      },
    ],
  },
  {
    name: 'Canada',
    code: '+1',
    currency: 'USD',
    states: [
      {
        name: 'Ontario',
        cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London'],
      },
      {
        name: 'Quebec',
        cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil'],
      },
      {
        name: 'British Columbia',
        cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond', 'Kelowna'],
      },
      {
        name: 'Alberta',
        cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert'],
      },
    ],
  },
  {
    name: 'Australia',
    code: '+61',
    currency: 'USD',
    states: [
      {
        name: 'New South Wales',
        cities: ['Sydney', 'Newcastle', 'Central Coast', 'Wollongong', 'Maitland'],
      },
      {
        name: 'Victoria',
        cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton'],
      },
      {
        name: 'Queensland',
        cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'],
      },
      {
        name: 'Western Australia',
        cities: ['Perth', 'Bunbury', 'Geraldton', 'Kalgoorlie', 'Albany'],
      },
    ],
  },
  {
    name: 'United Arab Emirates',
    code: '+971',
    currency: 'USD',
    states: [
      {
        name: 'Dubai',
        cities: ['Dubai City', 'Deira', 'Jumeirah', 'Downtown Dubai', 'Bur Dubai'],
      },
      {
        name: 'Abu Dhabi',
        cities: ['Abu Dhabi City', 'Al Ain', 'Al Dhafra', 'Madinat Zayed'],
      },
      {
        name: 'Sharjah',
        cities: ['Sharjah City', 'Khor Fakkan', 'Kalba', 'Al Dhaid'],
      },
    ],
  },
  {
    name: 'Germany',
    code: '+49',
    currency: 'EUR',
    states: [
      {
        name: 'Bavaria',
        cities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg', 'Ingolstadt'],
      },
      {
        name: 'Berlin',
        cities: ['Berlin', 'Spandau', 'Pankow', 'Mitte', 'Charlottenburg'],
      },
      {
        name: 'North Rhine-Westphalia',
        cities: ['Cologne', 'Dusseldorf', 'Dortmund', 'Essen', 'Bonn'],
      },
    ],
  },
  {
    name: 'France',
    code: '+33',
    currency: 'EUR',
    states: [
      {
        name: 'Ile-de-France',
        cities: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Argenteuil', 'Montreuil'],
      },
      {
        name: 'Auvergne-Rhone-Alpes',
        cities: ['Lyon', 'Saint-Etienne', 'Grenoble', 'Villeurbanne', 'Clermont-Ferrand'],
      },
      {
        name: 'Provence-Alpes-Cote d\'Azur',
        cities: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon'],
      },
    ],
  },
  {
    name: 'Singapore',
    code: '+65',
    currency: 'USD',
    states: [
      {
        name: 'Central Region',
        cities: ['Downtown Core', 'Marina Bay', 'Orchard', 'Bukit Merah', 'Toa Payoh'],
      },
    ],
  },
  {
    name: 'Japan',
    code: '+81',
    currency: 'USD',
    states: [
      {
        name: 'Kanto',
        cities: ['Tokyo', 'Yokohama', 'Kawasaki', 'Saitama', 'Chiba'],
      },
      {
        name: 'Kansai',
        cities: ['Osaka', 'Kyoto', 'Kobe', 'Sakai', 'Nara'],
      },
    ],
  },
  {
    name: 'China',
    code: '+86',
    currency: 'USD',
    states: [
      {
        name: 'Guangdong',
        cities: ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan', 'Zhongshan'],
      },
      {
        name: 'Shanghai',
        cities: ['Shanghai', 'Pudong', 'Minhang', 'Baoshan'],
      },
      {
        name: 'Beijing',
        cities: ['Beijing', 'Chaoyang', 'Haidian', 'Fengtai'],
      },
    ],
  },
  {
    name: 'Brazil',
    code: '+55',
    currency: 'USD',
    states: [
      {
        name: 'Sao Paulo',
        cities: ['Sao Paulo', 'Guarulhos', 'Campinas', 'Sao Bernardo do Campo'],
      },
      {
        name: 'Rio de Janeiro',
        cities: ['Rio de Janeiro', 'Sao Goncalo', 'Duque de Caxias', 'Nova Iguacu'],
      },
    ],
  },
  {
    name: 'South Africa',
    code: '+27',
    currency: 'USD',
    states: [
      {
        name: 'Gauteng',
        cities: ['Johannesburg', 'Pretoria', 'Soweto', 'Sandton'],
      },
      {
        name: 'Western Cape',
        cities: ['Cape Town', 'Stellenbosch', 'George', 'Paarl'],
      },
    ],
  },
  {
    name: 'Saudi Arabia',
    code: '+966',
    currency: 'USD',
    states: [
      {
        name: 'Riyadh',
        cities: ['Riyadh', 'Al Kharj', 'Diriyah'],
      },
      {
        name: 'Makkah',
        cities: ['Jeddah', 'Mecca', 'Taif'],
      },
    ],
  },
  {
    name: 'Netherlands',
    code: '+31',
    currency: 'EUR',
    states: [
      {
        name: 'North Holland',
        cities: ['Amsterdam', 'Haarlem', 'Zaanstad', 'Haarlemmermeer'],
      },
      {
        name: 'South Holland',
        cities: ['Rotterdam', 'The Hague', 'Leiden', 'Delft'],
      },
    ],
  },
];

const DEFAULT_MEMBERSHIPS = [
  'CITLOB',
  'EUATC',
  'Gala',
  'Translators Cafe',
  'ATA',
  'Proz',
];

const DEFAULT_DOMAINS = [
  'Gaming Company',
  'IT & Software',
  'Legal & Financial',
  'Healthcare & Pharma',
  'E-Commerce & Retail',
  'Media & Entertainment',
  'Automotive & Engineering',
];

const getInitialFormData = () => ({
  domain: 'Gaming Company',
  status: 'Client',
  membership: [],
  membershipCode: 'MEM-195',
  name: '',
  website: '',
  email: '',
  phone: '',
  countryCode: '+91',
  address: '',
  country: 'India',
  state: 'Delhi',
  city: 'New Delhi',
  zip: '',
  currency: 'INR',
  gstIn: '',
  vat: '',
  registrationDate: new Date().toISOString().split('T')[0],
  createdBy: 'System Admin',
  notes: '',
});

const normalizeClientForForm = (client) => {
  let countryCode = '+91';
  let phone = client?.phone || '';

  const matched = countryCodes.find((c) => phone.startsWith(c.code + ' ') || phone.startsWith(c.code));
  if (matched) {
    countryCode = matched.code;
    phone = phone.replace(matched.code, '').trim();
  }

  return {
    ...getInitialFormData(),
    ...client,
    countryCode,
    phone: phone.replace(/\D/g, ''),
    membership: Array.isArray(client?.membership) ? client.membership : client?.membership ? [client.membership] : [],
    country: client?.country || 'India',
    state: client?.state || 'Delhi',
    city: client?.city || 'New Delhi',
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
  'w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs';

const FormField = ({ label, required, children, className = '' }) => (
  <div className={`p-4 rounded-2xl bg-[#f8faff] hover:bg-white border border-slate-100/90 hover:border-slate-200/80 focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all ${className}`}>
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
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

const ALLOWED_DOC_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx', '.txt', '.zip', '.jpg', '.jpeg', '.png'];
const MAX_DOC_SIZE_MB = 10;

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

  // Drag and drop documents state
  const [docRows, setDocRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [domains, setDomains] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [existingClients, setExistingClients] = useState([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [typesData, membershipsData, clientsData] = await Promise.all([
          getTypes().catch(() => []),
          getMemberships().catch(() => []),
          getClients().catch(() => []),
        ]);

        const activeTypes = Array.isArray(typesData) ? typesData.filter((t) => t.status === 'Active') : [];
        const activeMemberships = Array.isArray(membershipsData) ? membershipsData.filter((m) => m.status === 'Active') : [];

        setDomains(activeTypes);
        setMemberships(activeMemberships);
        setExistingClients(Array.isArray(clientsData) ? clientsData : []);

        if (!isEditMode) {
          setFormData((prev) => ({
            ...prev,
            domain: activeTypes.find((t) => t.type === 'Gaming Company')?.type || activeTypes[0]?.type || 'Gaming Company',
          }));
        }
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };

    const loadMembershipCode = async () => {
      setLoadingCode(true);
      setErrorMessage('');

      try {
        const membershipCode = await getNextMembershipCode();
        if (membershipCode) {
          setFormData((prev) => ({
            ...prev,
            membershipCode,
          }));
        }
      } catch (error) {
        console.warn('Could not load next membership code, using default.', error);
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

  // Country -> State -> City cascading logic
  const availableStates = useMemo(() => {
    const selectedCountryObj = COUNTRY_DATA.find(
      (c) => c.name.toLowerCase() === (formData.country || '').toLowerCase()
    );
    return selectedCountryObj ? selectedCountryObj.states : [];
  }, [formData.country]);

  const availableCities = useMemo(() => {
    const stateObj = availableStates.find(
      (s) => s.name.toLowerCase() === (formData.state || '').toLowerCase()
    );
    return stateObj ? stateObj.cities : [];
  }, [availableStates, formData.state]);

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    const countryObj = COUNTRY_DATA.find((c) => c.name === newCountry);
    const newStates = countryObj ? countryObj.states : [];
    const firstState = newStates[0]?.name || '';
    const firstCity = newStates[0]?.cities[0] || '';
    const newCurrency = countryObj?.currency || 'USD';

    setFormData((prev) => ({
      ...prev,
      country: newCountry,
      state: firstState,
      city: firstCity,
      currency: newCountry === 'India' ? 'INR' : prev.currency || newCurrency,
    }));
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const stateObj = availableStates.find((s) => s.name === newState);
    const firstCity = stateObj ? stateObj.cities[0] || '' : '';

    setFormData((prev) => ({
      ...prev,
      state: newState,
      city: firstCity,
    }));
  };

  const handleCityChange = (e) => {
    updateField('city', e.target.value);
  };

  // Drag and drop file handling
  const handleFilesAdded = (files) => {
    const valid = Array.from(files).filter((file) => {
      const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
      if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
        alert(`Unsupported file type "${ext}". Supported: ${ALLOWED_DOC_EXTENSIONS.join(', ')}`);
        return false;
      }
      if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
        alert(`"${file.name}" is larger than ${MAX_DOC_SIZE_MB} MB.`);
        return false;
      }
      return true;
    });

    if (valid.length > 0) {
      const newDocs = valid.map((file) => ({
        file,
        name: file.name.replace(/\.[^.]+$/, ''),
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      }));
      setDocRows((prev) => [...prev, ...newDocs]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeDocRow = (index) => {
    setDocRows((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      existingDocuments: prev.existingDocuments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentName = formData.name.trim().toLowerCase();
    const isDuplicate = existingClients.some(
      (client) => client.name?.toLowerCase() === currentName && client._id !== editingClient?._id
    );

    if (isDuplicate) {
      setErrorMessage('A client with this name already exists.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('domain', formData.domain?.trim() || 'Gaming Company');
      formDataToSend.append('status', formData.status || 'Client');
      if (Array.isArray(formData.membership)) {
        formData.membership.forEach((m) => formDataToSend.append('membership', m));
      } else {
        formDataToSend.append('membership', formData.membership || '');
      }
      formDataToSend.append('membershipCode', formData.membershipCode?.trim() || 'MEM-195');
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('website', formData.website.trim());
      if (formData.email) formDataToSend.append('email', formData.email.trim());

      const formattedPhone = formData.phone.trim() ? `${formData.countryCode} ${formData.phone.trim()}` : '';
      formDataToSend.append('phone', formattedPhone);

      formDataToSend.append('address', formData.address.trim());
      formDataToSend.append('country', formData.country.trim());
      if (formData.state) formDataToSend.append('state', formData.state.trim());
      formDataToSend.append('city', formData.city.trim());
      if (formData.zip) formDataToSend.append('zip', formData.zip.trim());
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('gstIn', formData.gstIn.trim());
      formDataToSend.append('vat', formData.vat.trim());
      formDataToSend.append('registrationDate', formData.registrationDate);
      formDataToSend.append('createdBy', formData.createdBy || 'System Admin');
      formDataToSend.append('notes', formData.notes || '');

      if (isEditMode) {
        formDataToSend.append('existingDocuments', JSON.stringify(formData.existingDocuments || []));
      }

      formDataToSend.append('documentNames', JSON.stringify(docRows.map((r) => r.name.trim())));
      docRows.forEach((r) => {
        if (r.file) {
          formDataToSend.append('documents', r.file);
        }
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
    if (!url) return '';
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `${apiBase}/files/view?url=${encodeURIComponent(url)}`;
    }
    return `${apiBase.replace('/api', '')}${url}`;
  };

  const handleViewDocument = async (e, url, name) => {
    e.preventDefault();
    const href = getFileUrl(url);
    const win = window.open('', '_blank');
    try {
      const res = await fetch(href, { method: 'HEAD' });
      if (!res.ok) throw new Error('missing');
      if (win) win.location.href = href;
      else window.open(href, '_blank', 'noreferrer');
    } catch {
      if (win) win.close();
      alert(`"${name}" could not be opened — this file is missing on the server and needs to be re-uploaded.`);
    }
  };

  // Compile combined membership options
  const combinedMemberships = Array.from(
    new Set([
      ...DEFAULT_MEMBERSHIPS,
      ...memberships.map((m) => m.name || m),
    ])
  );

  // Compile combined domain options
  const combinedDomains = Array.from(
    new Set([
      'Gaming Company',
      ...domains.map((d) => d.type || d.name || d),
      ...DEFAULT_DOMAINS,
    ])
  );

  return (
    <div className="font-sans text-slate-900 pb-12 min-h-screen bg-[#fafbfc] px-4 sm:px-6 py-6 animate-in fade-in duration-500">
      <div className="w-full space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 shadow-xs transition-all shrink-0"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {isEditMode ? formData.name || 'Edit Client' : 'Add New Client'}
              {isEditMode && formData.status && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(formData.status)}`}>
                  {formData.status}
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-normal mt-0.5">
              {isEditMode ? 'Edit Client Profile & Details' : 'Client Profile & Details'}
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

            {/* Section 1: Primary Information (No section icon) */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Primary Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Company Name" required>
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Company Name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                </FormField>

                <FormField label="Client Code">
                  <input
                    type="text"
                    readOnly
                    className={`${inputClass} bg-slate-50 text-slate-600 cursor-not-allowed`}
                    value={loadingCode ? 'Loading...' : formData.membershipCode || 'MEM-195'}
                  />
                </FormField>

                <FormField label="Domain">
                  <SelectField
                    value={formData.domain}
                    onChange={(e) => updateField('domain', e.target.value)}
                  >
                    {combinedDomains.map((dom) => (
                      <option key={dom} value={dom}>
                        {dom}
                      </option>
                    ))}
                  </SelectField>
                </FormField>

                <FormField label="Status" required>
                  <SelectField
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    required
                  >
                    <option value="Client">Client</option>
                    <option value="Prospect Warm">Prospect Warm</option>
                    <option value="Prospect Cold">Prospect Cold</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Onboarding">Onboarding</option>
                  </SelectField>
                </FormField>

                <FormField label="Registration Date">
                  <input
                    type="date"
                    className={inputClass}
                    value={formData.registrationDate}
                    onChange={(e) => updateField('registrationDate', e.target.value)}
                  />
                </FormField>

                <FormField label="Created By">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="System Admin"
                    value={formData.createdBy}
                    onChange={(e) => updateField('createdBy', e.target.value)}
                  />
                </FormField>

                {/* Membership Row across full width */}
                <FormField label="Membership" className="md:col-span-2 lg:col-span-3">
                  <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-white border border-slate-200/90 rounded-xl min-h-[46px]">
                    {combinedMemberships.map((mName) => {
                      const isChecked = formData.membership.includes(mName);
                      return (
                        <label key={mName} className="inline-flex items-center gap-2 cursor-pointer select-none group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev) => ({
                                ...prev,
                                membership: checked
                                  ? [...prev.membership, mName]
                                  : prev.membership.filter((name) => name !== mName),
                              }));
                            }}
                          />
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                              isChecked
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100/70 border border-indigo-100/60'
                            }`}
                          >
                            {mName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </FormField>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Contact Information (No section icon) */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Email Address">
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </FormField>

                <FormField label="Phone Number">
                  <div className="flex items-center gap-2.5 w-full">
                    {/* Type-search numeric country code */}
                    <NumericCountryCodeSearch
                      value={formData.countryCode}
                      onChange={(code) => updateField('countryCode', code)}
                    />
                    {/* Only numeric digits allowed in phone number */}
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
                </FormField>

                <FormField label="Website">
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

            {/* Section 3: Location Details (No section icon; Arranged: Country, State, City, ZIP Code) */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Location Details
              </h3>
              <div className="space-y-4">
                <FormField label="Full Address">
                  <textarea
                    rows={2}
                    className={`${inputClass} min-h-[76px] resize-y`}
                    placeholder="Full Address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                  />
                </FormField>

                {/* Arranged in order: Country, State, City, ZIP Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Country Dropdown */}
                  <FormField label="Country">
                    <SelectField value={formData.country} onChange={handleCountryChange}>
                      <option value="" disabled>Select Country</option>
                      {COUNTRY_DATA.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </SelectField>
                  </FormField>

                  {/* 2. State Dropdown (populated based on Country) */}
                  <FormField label="State">
                    <SelectField value={formData.state} onChange={handleStateChange}>
                      <option value="" disabled>Select State</option>
                      {availableStates.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </SelectField>
                  </FormField>

                  {/* 3. City Dropdown (populated based on State) */}
                  <FormField label="City">
                    <SelectField value={formData.city} onChange={handleCityChange}>
                      <option value="" disabled>Select City</option>
                      {availableCities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </SelectField>
                  </FormField>

                  {/* 4. ZIP Code */}
                  <FormField label="ZIP Code">
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
            </div>

            <hr className="border-slate-100" />

            {/* Section 4: Financial Information (No section icon) */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Financial Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Preferred Currency">
                  <SelectField value={formData.currency} onChange={(e) => updateField('currency', e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR (Rs.)</option>
                  </SelectField>
                </FormField>

                <FormField label="GSTIN">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="GST Number"
                    value={formData.gstIn}
                    onChange={(e) => updateField('gstIn', e.target.value)}
                  />
                </FormField>

                <FormField label="VAT Number">
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

            {/* Section 5: Additional Information (No section icon) */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Additional Information
              </h3>
              <div>
                <FormField label="Notes / Comments">
                  <textarea
                    rows={4}
                    className={`${inputClass} min-h-[110px] resize-y`}
                    placeholder="Enter any notes or comments about this client..."
                    value={formData.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 6: Uploaded Documents (No section icon; Drag and Drop Zone) */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Uploaded Documents
              </h3>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/70 scale-[1.008]'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-indigo-300'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_DOC_EXTENSIONS.join(',')}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFilesAdded(e.target.files);
                    e.target.value = '';
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 text-center mb-1">
                  {isDragging ? 'Drop your files here to attach' : 'Drag & drop client documents here, or click to browse'}
                </p>
                <p className="text-xs text-slate-400 text-center max-w-sm mb-3">
                  PDF, DOCX, XLSX, CSV, JPG, PNG up to 10 MB per file
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 text-xs font-bold text-indigo-600 bg-white border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-xs"
                >
                  Browse Files
                </button>
              </div>

              {/* Files list (uploaded in current session) */}
              {docRows.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Attached Files ({docRows.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {docRows.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 group hover:bg-white hover:border-indigo-200 transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 mr-2">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden flex-1 min-w-0">
                            <input
                              type="text"
                              value={doc.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setDocRows((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                                );
                              }}
                              className="w-full text-xs font-bold text-slate-800 bg-transparent border-none p-0 focus:outline-none focus:ring-0 truncate"
                              placeholder="Document name"
                            />
                            <p className="text-[10px] text-slate-400 font-medium">{doc.size}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing documents (edit mode) */}
              {formData.existingDocuments?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Existing Documents ({formData.existingDocuments.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.existingDocuments.map((doc, idx) => (
                      <div
                        key={`existing-${idx}`}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/60 hover:bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group"
                      >
                        <a
                          href={getFileUrl(doc.url)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => handleViewDocument(e, doc.url, doc.name)}
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
                  </div>
                </div>
              )}

              {docRows.length === 0 && (!formData.existingDocuments || formData.existingDocuments.length === 0) && (
                <p className="text-center text-xs font-medium text-slate-400 mt-3">
                  No documents uploaded for this client yet.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="px-6 py-2.5 bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60"
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
