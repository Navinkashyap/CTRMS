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
  address: '',
  country: '',
  state: '',
  city: '',
  zip: '',
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

// Searchable / type-selection dropdown component for Country, State, City, ZIP Code
const TypeSelectionDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = '',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typed, setTyped] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setTyped(value || '');
  }, [value]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = (typed || '').trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) =>
      String(opt).toLowerCase().includes(q)
    );
  }, [options, typed]);

  const handleSelect = (val) => {
    onChange(val);
    setTyped(val);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setTyped(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={typed}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`${inputClass} pr-9`}
        />
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-0.5"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-56 overflow-y-auto p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
          {filtered.map((opt, idx) => (
            <button
              key={`${opt}-${idx}`}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition-colors ${
                String(opt).toLowerCase() === (value || '').toLowerCase()
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const COUNTRY_DATA = [
  {
    name: 'India',
    states: [
      { name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati'] },
      { name: 'Assam', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon'] },
      { name: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga'] },
      { name: 'Chandigarh', cities: ['Chandigarh'] },
      { name: 'Delhi', cities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'] },
      { name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Gandhinagar'] },
      { name: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak'] },
      { name: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Mandi', 'Solan'] },
      { name: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'] },
      { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'] },
      { name: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur'] },
      { name: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'] },
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai', 'Aurangabad'] },
      { name: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Puri'] },
      { name: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali'] },
      { name: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur'] },
      { name: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
      { name: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'] },
      { name: 'Uttar Pradesh', cities: ['Noida', 'Greater Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut'] },
      { name: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Rishikesh', 'Haldwani'] },
      { name: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'] },
    ],
  },
  {
    name: 'United States',
    states: [
      { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Oakland'] },
      { name: 'New York', cities: ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany'] },
      { name: 'Texas', cities: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso'] },
      { name: 'Florida', cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'St. Petersburg'] },
      { name: 'Illinois', cities: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Springfield'] },
      { name: 'Washington', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'] },
      { name: 'Massachusetts', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge'] },
      { name: 'Georgia', cities: ['Atlanta', 'Augusta', 'Columbus', 'Savannah'] },
      { name: 'Pennsylvania', cities: ['Philadelphia', 'Pittsburgh', 'Allentown'] },
      { name: 'Ohio', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo'] },
      { name: 'North Carolina', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham'] },
      { name: 'Michigan', cities: ['Detroit', 'Grand Rapids', 'Warren'] },
      { name: 'New Jersey', cities: ['Newark', 'Jersey City', 'Paterson'] },
      { name: 'Virginia', cities: ['Virginia Beach', 'Norfolk', 'Richmond'] },
    ],
  },
  {
    name: 'United Kingdom',
    states: [
      { name: 'England', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol', 'Sheffield'] },
      { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'] },
      { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport'] },
      { name: 'Northern Ireland', cities: ['Belfast', 'Derry', 'Lisburn'] },
    ],
  },
  {
    name: 'Canada',
    states: [
      { name: 'Ontario', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton'] },
      { name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau'] },
      { name: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby'] },
      { name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer'] },
    ],
  },
  {
    name: 'Australia',
    states: [
      { name: 'New South Wales', cities: ['Sydney', 'Newcastle', 'Central Coast', 'Wollongong'] },
      { name: 'Victoria', cities: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'] },
      { name: 'Queensland', cities: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Cairns'] },
      { name: 'Western Australia', cities: ['Perth', 'Bunbury', 'Geraldton'] },
    ],
  },
  {
    name: 'United Arab Emirates',
    states: [
      { name: 'Dubai', cities: ['Dubai City', 'Deira', 'Jumeirah', 'Downtown Dubai', 'Bur Dubai'] },
      { name: 'Abu Dhabi', cities: ['Abu Dhabi City', 'Al Ain', 'Al Dhafra'] },
      { name: 'Sharjah', cities: ['Sharjah City', 'Khor Fakkan', 'Kalba'] },
      { name: 'Ajman', cities: ['Ajman City'] },
    ],
  },
  {
    name: 'Germany',
    states: [
      { name: 'Bavaria', cities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'] },
      { name: 'Berlin', cities: ['Berlin', 'Spandau', 'Pankow', 'Mitte'] },
      { name: 'North Rhine-Westphalia', cities: ['Cologne', 'Dusseldorf', 'Dortmund', 'Bonn'] },
      { name: 'Hesse', cities: ['Frankfurt', 'Wiesbaden', 'Kassel'] },
      { name: 'Hamburg', cities: ['Hamburg'] },
    ],
  },
  {
    name: 'France',
    states: [
      { name: 'Ile-de-France', cities: ['Paris', 'Boulogne-Billancourt', 'Saint-Denis'] },
      { name: 'Auvergne-Rhone-Alpes', cities: ['Lyon', 'Saint-Etienne', 'Grenoble'] },
      { name: 'Provence-Alpes-Cote d\'Azur', cities: ['Marseille', 'Nice', 'Toulon'] },
    ],
  },
  {
    name: 'Singapore',
    states: [
      { name: 'Central Region', cities: ['Downtown Core', 'Marina Bay', 'Orchard', 'Bukit Merah'] },
      { name: 'East Region', cities: ['Tampines', 'Bedok', 'Pasir Ris'] },
      { name: 'West Region', cities: ['Jurong East', 'Clementi', 'Bukit Batok'] },
    ],
  },
  {
    name: 'Japan',
    states: [
      { name: 'Kanto', cities: ['Tokyo', 'Yokohama', 'Kawasaki', 'Chiba', 'Saitama'] },
      { name: 'Kansai', cities: ['Osaka', 'Kyoto', 'Kobe', 'Nara'] },
      { name: 'Chubu', cities: ['Nagoya', 'Shizuoka', 'Niigata'] },
    ],
  },
  {
    name: 'China',
    states: [
      { name: 'Beijing', cities: ['Beijing'] },
      { name: 'Shanghai', cities: ['Shanghai'] },
      { name: 'Guangdong', cities: ['Guangzhou', 'Shenzhen', 'Dongguan'] },
      { name: 'Zhejiang', cities: ['Hangzhou', 'Ningbo'] },
    ],
  },
];

const CITY_ZIP_MAP = {
  // India
  Noida: ['201301', '201303', '201304', '201305', '201307', '201309'],
  'Greater Noida': ['201306', '201308', '201310', '201318'],
  Ghaziabad: ['201001', '201002', '201005', '201009', '201010', '201012'],
  Delhi: ['110001', '110002', '110003', '110005', '110006', '110020', '110092'],
  'New Delhi': ['110001', '110002', '110003', '110011', '110021'],
  Gurugram: ['122001', '122002', '122003', '122018', '122051'],
  Faridabad: ['121001', '121002', '121003', '121004'],
  Lucknow: ['226001', '226010', '226016', '226024'],
  Kanpur: ['208001', '208002', '208005'],
  Mumbai: ['400001', '400002', '400004', '400050', '400076', '400099'],
  'Navi Mumbai': ['400703', '400705', '400706'],
  Pune: ['411001', '411002', '411004', '411014', '411038', '411057'],
  Bengaluru: ['560001', '560002', '560025', '560034', '560066', '560100'],
  Hyderabad: ['500001', '500003', '500034', '500081', '500084'],
  Chennai: ['600001', '600002', '600028', '600034', '600096'],
  Kolkata: ['700001', '700019', '700029', '700091'],
  Ahmedabad: ['380001', '380006', '380015', '380054'],
  Jaipur: ['302001', '302004', '302015', '302020'],
  Chandigarh: ['160001', '160002', '160017', '160022'],
  Dehradun: ['248001', '248002', '248007'],
  // USA
  'New York City': ['10001', '10002', '10003', '10011', '10016', '10021'],
  'Los Angeles': ['90001', '90012', '90024', '90028', '90210'],
  Chicago: ['60601', '60602', '60606', '60611', '60614'],
  Houston: ['77001', '77002', '77008', '77019', '77056'],
  'San Francisco': ['94102', '94103', '94107', '94110', '94114'],
  Seattle: ['98101', '98104', '98109', '98115', '98121'],
  Miami: ['33101', '33125', '33130', '33139'],
  Dallas: ['75201', '75202', '75204', '75219'],
  Austin: ['78701', '78702', '78704', '78745'],
  Boston: ['02108', '02110', '02115', '02116', '02215'],
  // UK
  London: ['EC1A 1BB', 'W1A 1AA', 'SW1A 1AA', 'E1 6AN', 'WC2N 5DU'],
  Manchester: ['M1 1AE', 'M2 1HN', 'M3 1ER', 'M4 1LE'],
  Birmingham: ['B1 1AA', 'B2 4ND', 'B3 3AG', 'B5 4BU'],
  // Canada
  Toronto: ['M5H 2N2', 'M5V 2T6', 'M4W 1A1', 'M5R 1X9'],
  Vancouver: ['V6B 1A1', 'V6Z 2W1', 'V6E 1E5'],
  // UAE
  'Dubai City': ['00000', '337-1500', 'P.O. Box 1111'],
  'Abu Dhabi City': ['00000', 'P.O. Box 2222'],
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
        address: editingContact.address || editingContact.fullAddress || '',
        country: editingContact.country || '',
        state: editingContact.state || editingContact.region || '',
        city: editingContact.city || '',
        zip: editingContact.zip || editingContact.zipCode || '',
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
      address: prev.address || client?.address || '',
      country: prev.country || client?.country || '',
      state: prev.state || client?.state || '',
      city: prev.city || client?.city || '',
      zip: prev.zip || client?.zip || client?.zipCode || '',
    }));
  };

  // Cascading Location options
  const countryOptions = useMemo(() => COUNTRY_DATA.map((c) => c.name), []);

  const availableStates = useMemo(() => {
    if (!formData.country) return [];
    const countryObj = COUNTRY_DATA.find(
      (c) => c.name.toLowerCase() === (formData.country || '').trim().toLowerCase()
    );
    return countryObj ? countryObj.states : [];
  }, [formData.country]);

  const stateOptions = useMemo(
    () => availableStates.map((s) => s.name),
    [availableStates]
  );

  const availableCities = useMemo(() => {
    if (!formData.state) {
      if (availableStates.length > 0) {
        return availableStates.flatMap((s) => s.cities);
      }
      return [];
    }
    const stateObj = availableStates.find(
      (s) => s.name.toLowerCase() === (formData.state || '').trim().toLowerCase()
    );
    return stateObj ? stateObj.cities : [];
  }, [availableStates, formData.state]);

  const cityOptions = useMemo(() => availableCities, [availableCities]);

  const zipOptions = useMemo(() => {
    if (!formData.city) return [];
    const matchedCityKey = Object.keys(CITY_ZIP_MAP).find(
      (k) => k.toLowerCase() === (formData.city || '').trim().toLowerCase()
    );
    if (matchedCityKey) {
      return CITY_ZIP_MAP[matchedCityKey];
    }
    return [];
  }, [formData.city]);

  const handleCountryChange = (val) => {
    updateField('country', val);
  };

  const handleStateChange = (val) => {
    updateField('state', val);
  };

  const handleCityChange = (val) => {
    updateField('city', val);
    const matchedCityKey = Object.keys(CITY_ZIP_MAP).find(
      (k) => k.toLowerCase() === (val || '').trim().toLowerCase()
    );
    if (matchedCityKey && (!formData.zip || formData.zip.trim() === '')) {
      updateField('zip', CITY_ZIP_MAP[matchedCityKey][0] || '');
    }
  };

  const handleZipChange = (val) => {
    updateField('zip', val);
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
        fullAddress: formData.address,
        zipCode: formData.zip,
        region: formData.state,
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

          {/* Section 4: Location Details */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Location Details
            </h3>
            <div className="space-y-4">
              {/* Full Address */}
              <FormField label="Full Address">
                <textarea
                  rows={2}
                  className={`${inputClass} min-h-[70px] resize-y`}
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Country */}
                <FormField label="Country">
                  <TypeSelectionDropdown
                    value={formData.country}
                    onChange={handleCountryChange}
                    options={countryOptions}
                    placeholder="Type or select country"
                  />
                </FormField>

                {/* State */}
                <FormField label="State">
                  <TypeSelectionDropdown
                    value={formData.state}
                    onChange={handleStateChange}
                    options={stateOptions}
                    placeholder="Type or select state"
                  />
                </FormField>

                {/* City */}
                <FormField label="City">
                  <TypeSelectionDropdown
                    value={formData.city}
                    onChange={handleCityChange}
                    options={cityOptions}
                    placeholder="Type or select city"
                  />
                </FormField>

                {/* ZIP Code */}
                <FormField label="ZIP Code">
                  <TypeSelectionDropdown
                    value={formData.zip}
                    onChange={handleZipChange}
                    options={zipOptions}
                    placeholder="Type or select ZIP code"
                  />
                </FormField>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 5: Additional Information */}
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
