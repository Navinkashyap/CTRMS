import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  UploadCloud,
  FileText,
  X,
  CircleAlert,
} from "lucide-react";
import { createClient, getClient, updateClient } from "../lib/salesApi";
import { countryCodes } from "../../lib/countryCodes";

// Predefined Country, State, City master data
const COUNTRY_DATA = [
  {
    name: "India",
    code: "+91",
    currency: "INR",
    states: [
      {
        name: "Andhra Pradesh",
        cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"],
      },
      {
        name: "Assam",
        cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia"],
      },
      {
        name: "Bihar",
        cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga"],
      },
      {
        name: "Delhi",
        cities: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi"],
      },
      {
        name: "Gujarat",
        cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Jamnagar"],
      },
      {
        name: "Haryana",
        cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak"],
      },
      {
        name: "Karnataka",
        cities: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere", "Ballari"],
      },
      {
        name: "Kerala",
        cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur"],
      },
      {
        name: "Madhya Pradesh",
        cities: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar"],
      },
      {
        name: "Maharashtra",
        cities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Navi Mumbai", "Solapur"],
      },
      {
        name: "Odisha",
        cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
      },
      {
        name: "Punjab",
        cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
      },
      {
        name: "Rajasthan",
        cities: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara"],
      },
      {
        name: "Tamil Nadu",
        cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode"],
      },
      {
        name: "Telangana",
        cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam"],
      },
      {
        name: "Uttar Pradesh",
        cities: ["Lucknow", "Kanpur", "Noida", "Greater Noida", "Ghaziabad", "Agra", "Varanasi", "Prayagraj"],
      },
      {
        name: "Uttarakhand",
        cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Rishikesh"],
      },
      {
        name: "West Bengal",
        cities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman"],
      },
    ],
  },
  {
    name: "United States",
    code: "+1",
    currency: "USD",
    states: [
      {
        name: "California",
        cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno", "Oakland"],
      },
      {
        name: "New York",
        cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"],
      },
      {
        name: "Texas",
        cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington"],
      },
      {
        name: "Florida",
        cities: ["Miami", "Orlando", "Tampa", "Jacksonville", "St. Petersburg", "Hialeah"],
      },
      {
        name: "Illinois",
        cities: ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield"],
      },
      {
        name: "Washington",
        cities: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent"],
      },
      {
        name: "Massachusetts",
        cities: ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton"],
      },
    ],
  },
  {
    name: "United Kingdom",
    code: "+44",
    currency: "GBP",
    states: [
      {
        name: "England",
        cities: ["London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol", "Sheffield"],
      },
      {
        name: "Scotland",
        cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Stirling"],
      },
      {
        name: "Wales",
        cities: ["Cardiff", "Swansea", "Newport", "Wrexham", "Bangor", "St Asaph"],
      },
      {
        name: "Northern Ireland",
        cities: ["Belfast", "Derry", "Lisburn", "Newry", "Armagh"],
      },
    ],
  },
  {
    name: "Canada",
    code: "+1",
    currency: "USD",
    states: [
      {
        name: "Ontario",
        cities: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London"],
      },
      {
        name: "Quebec",
        cities: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil"],
      },
      {
        name: "British Columbia",
        cities: ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Kelowna"],
      },
      {
        name: "Alberta",
        cities: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert"],
      },
    ],
  },
  {
    name: "Australia",
    code: "+61",
    currency: "USD",
    states: [
      {
        name: "New South Wales",
        cities: ["Sydney", "Newcastle", "Central Coast", "Wollongong", "Maitland"],
      },
      {
        name: "Victoria",
        cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton"],
      },
      {
        name: "Queensland",
        cities: ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns"],
      },
      {
        name: "Western Australia",
        cities: ["Perth", "Bunbury", "Geraldton", "Kalgoorlie", "Albany"],
      },
    ],
  },
  {
    name: "United Arab Emirates",
    code: "+971",
    currency: "USD",
    states: [
      {
        name: "Dubai",
        cities: ["Dubai City", "Deira", "Jumeirah", "Downtown Dubai", "Bur Dubai"],
      },
      {
        name: "Abu Dhabi",
        cities: ["Abu Dhabi City", "Al Ain", "Al Dhafra", "Madinat Zayed"],
      },
      {
        name: "Sharjah",
        cities: ["Sharjah City", "Khor Fakkan", "Kalba", "Al Dhaid"],
      },
    ],
  },
  {
    name: "Germany",
    code: "+49",
    currency: "EUR",
    states: [
      {
        name: "Bavaria",
        cities: ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt"],
      },
      {
        name: "Berlin",
        cities: ["Berlin", "Spandau", "Pankow", "Mitte", "Charlottenburg"],
      },
      {
        name: "North Rhine-Westphalia",
        cities: ["Cologne", "Dusseldorf", "Dortmund", "Essen", "Bonn"],
      },
    ],
  },
  {
    name: "France",
    code: "+33",
    currency: "EUR",
    states: [
      {
        name: "Ile-de-France",
        cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil"],
      },
      {
        name: "Auvergne-Rhone-Alpes",
        cities: ["Lyon", "Saint-Etienne", "Grenoble", "Villeurbanne", "Clermont-Ferrand"],
      },
      {
        name: "Provence-Alpes-Cote d'Azur",
        cities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon"],
      },
    ],
  },
  {
    name: "Singapore",
    code: "+65",
    currency: "USD",
    states: [
      {
        name: "Central Region",
        cities: ["Downtown Core", "Marina Bay", "Orchard", "Bukit Merah", "Toa Payoh"],
      },
    ],
  },
  {
    name: "Japan",
    code: "+81",
    currency: "USD",
    states: [
      {
        name: "Kanto",
        cities: ["Tokyo", "Yokohama", "Kawasaki", "Saitama", "Chiba"],
      },
      {
        name: "Kansai",
        cities: ["Osaka", "Kyoto", "Kobe", "Sakai", "Nara"],
      },
    ],
  },
  {
    name: "China",
    code: "+86",
    currency: "USD",
    states: [
      {
        name: "Guangdong",
        cities: ["Guangzhou", "Shenzhen", "Dongguan", "Foshan", "Zhongshan"],
      },
      {
        name: "Shanghai",
        cities: ["Shanghai", "Pudong", "Minhang", "Baoshan"],
      },
      {
        name: "Beijing",
        cities: ["Beijing", "Chaoyang", "Haidian", "Fengtai"],
      },
    ],
  },
  {
    name: "Brazil",
    code: "+55",
    currency: "USD",
    states: [
      {
        name: "Sao Paulo",
        cities: ["Sao Paulo", "Guarulhos", "Campinas", "Sao Bernardo do Campo"],
      },
      {
        name: "Rio de Janeiro",
        cities: ["Rio de Janeiro", "Sao Goncalo", "Duque de Caxias", "Nova Iguacu"],
      },
    ],
  },
  {
    name: "South Africa",
    code: "+27",
    currency: "USD",
    states: [
      {
        name: "Gauteng",
        cities: ["Johannesburg", "Pretoria", "Soweto", "Sandton"],
      },
      {
        name: "Western Cape",
        cities: ["Cape Town", "Stellenbosch", "George", "Paarl"],
      },
    ],
  },
  {
    name: "Saudi Arabia",
    code: "+966",
    currency: "USD",
    states: [
      {
        name: "Riyadh",
        cities: ["Riyadh", "Al Kharj", "Diriyah"],
      },
      {
        name: "Makkah",
        cities: ["Jeddah", "Mecca", "Taif"],
      },
    ],
  },
  {
    name: "Netherlands",
    code: "+31",
    currency: "EUR",
    states: [
      {
        name: "North Holland",
        cities: ["Amsterdam", "Haarlem", "Zaanstad", "Haarlemmermeer"],
      },
      {
        name: "South Holland",
        cities: ["Rotterdam", "The Hague", "Leiden", "Delft"],
      },
    ],
  },
];

const DEFAULT_MEMBERSHIPS = [
  "CITLOB",
  "EUATC",
  "Gala",
  "Translators Cafe",
  "ATA",
  "Proz",
];

const DEFAULT_DOMAINS = [
  "Gaming Company",
  "IT & Software",
  "Legal & Financial",
  "Healthcare & Pharma",
  "E-Commerce & Retail",
  "Media & Entertainment",
  "Automotive & Engineering",
];

const emptyClient = {
  name: "",
  membershipCode: "MEM-195",
  domain: "Gaming Company",
  status: "Client",
  registrationDate: new Date().toISOString().split("T")[0],
  createdBy: "Sales",
  membership: [],
  email: "",
  countryCode: "+91",
  phone: "",
  website: "",
  address: "",
  country: "India",
  state: "Delhi",
  city: "New Delhi",
  zip: "",
  currency: "INR",
  gstIn: "",
  vat: "",
  notes: "",
  documents: [],
};

const inputClass =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs";

const FormField = ({ label, required, children, className = "" }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
      {label}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const SelectField = ({ value, onChange, required, disabled, children, className = "" }) => (
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
  const [typed, setTyped] = useState(value || "+91");
  const wrapperRef = useRef(null);

  useEffect(() => {
    setTyped(value || "+91");
  }, [value]);

  // Filter numeric codes and country labels by what user types
  const filtered = useMemo(() => {
    const q = typed.replace(/\+/g, "").trim().toLowerCase();
    if (!q) return countryCodes.slice(0, 40);
    return countryCodes.filter(
      (c) =>
        c.code.replace(/\+/g, "").includes(q) ||
        c.label.toLowerCase().includes(q)
    );
  }, [typed]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        setTyped(value || "+91");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [value]);

  const handleSelect = (code) => {
    onChange(code);
    setTyped(code);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    let inputVal = e.target.value.trim();
    // Keep numeric code format with leading +
    if (!inputVal.startsWith("+") && inputVal.length > 0) {
      inputVal = "+" + inputVal.replace(/\D/g, "");
    } else {
      inputVal = "+" + inputVal.slice(1).replace(/\D/g, "");
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
          className={`w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-auto cursor-pointer transition-transform ${isOpen ? "rotate-180" : ""}`}
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
                className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center justify-between transition-colors ${c.code === value ? "bg-indigo-50 text-indigo-700 font-bold" : "hover:bg-slate-50 text-slate-700"
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

const ALLOWED_DOC_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".ppt", ".pptx", ".txt", ".zip", ".jpg", ".jpeg", ".png"];
const MAX_DOC_SIZE_MB = 10;

const ClientForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyClient);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isEdit) return;
    getClient(id)
      .then((client) => {
        let phone = client.phone || "";
        let countryCode = "+91";
        const matched = countryCodes.find((c) => phone.startsWith(c.code + " ") || phone.startsWith(c.code));
        if (matched) {
          countryCode = matched.code;
          phone = phone.replace(matched.code, "").trim();
        }
        setForm({
          ...emptyClient,
          ...client,
          countryCode,
          phone: phone.replace(/\D/g, ""),
          registrationDate: client.registrationDate
            ? new Date(client.registrationDate).toISOString().split("T")[0]
            : emptyClient.registrationDate,
          membership: Array.isArray(client.membership) ? client.membership : [],
        });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const updateField = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));

  // Country -> State -> City cascading logic
  const availableStates = useMemo(() => {
    const selectedCountryObj = COUNTRY_DATA.find(
      (c) => c.name.toLowerCase() === (form.country || "").toLowerCase()
    );
    return selectedCountryObj ? selectedCountryObj.states : [];
  }, [form.country]);

  const availableCities = useMemo(() => {
    const stateObj = availableStates.find(
      (s) => s.name.toLowerCase() === (form.state || "").toLowerCase()
    );
    return stateObj ? stateObj.cities : [];
  }, [availableStates, form.state]);

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    const countryObj = COUNTRY_DATA.find((c) => c.name === newCountry);
    const newStates = countryObj ? countryObj.states : [];
    const firstState = newStates[0]?.name || "";
    const firstCity = newStates[0]?.cities[0] || "";
    const newCurrency = countryObj?.currency || "USD";

    setForm((prev) => ({
      ...prev,
      country: newCountry,
      state: firstState,
      city: firstCity,
      currency: newCountry === "India" ? "INR" : prev.currency || newCurrency,
    }));
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const stateObj = availableStates.find((s) => s.name === newState);
    const firstCity = stateObj ? stateObj.cities[0] || "" : "";

    setForm((prev) => ({
      ...prev,
      state: newState,
      city: firstCity,
    }));
  };

  const handleCityChange = (e) => {
    updateField("city", e.target.value);
  };

  // Drag and drop documents
  const handleFilesAdded = (files) => {
    const valid = Array.from(files).filter((file) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
        alert(`Unsupported file type "${ext}". Supported: ${ALLOWED_DOC_EXTENSIONS.join(", ")}`);
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
        name: file.name.replace(/\.[^.]+$/, ""),
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      }));
      setUploadedFiles((prev) => [...prev, ...newDocs]);
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

  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name || form.membershipCode || "Client",
        phone: form.phone ? `${form.countryCode} ${form.phone}`.trim() : "",
      };
      if (isEdit) await updateClient(id, payload);
      else await createClient(payload);
      navigate("/sales/clients");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm font-semibold text-slate-500">Loading client profile...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-900 pb-12 w-full space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/sales/clients")}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 shadow-xs transition-all shrink-0"
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isEdit ? "Edit Client" : "Add New Client"}
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-normal mt-0.5">
            Client Profile & Details
          </p>
        </div>
      </div>

      {/* Main Form Card - full width without horizontal margin restrictions */}
      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Primary Information (No section icon) */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Primary Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="Client Code">
                <input
                  name="membershipCode"
                  type="text"
                  readOnly
                  className={`${inputClass} bg-slate-50 text-slate-600 cursor-not-allowed`}
                  value={form.membershipCode || "MEM-195"}
                />
              </FormField>

              <FormField label="Registration Date">
                <input
                  name="registrationDate"
                  type="date"
                  className={inputClass}
                  value={form.registrationDate}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Created By">
                <input
                  name="createdBy"
                  type="text"
                  className={inputClass}
                  placeholder="Sales"
                  value={form.createdBy}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Domain">
                <SelectField
                  value={form.domain}
                  onChange={(e) => updateField("domain", e.target.value)}
                >
                  {DEFAULT_DOMAINS.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </SelectField>
              </FormField>

              <FormField label="Status" required>
                <SelectField
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  required
                >
                  <option value="Client">Client</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Prospect Warm">Prospect Warm</option>
                  <option value="Prospect Cold">Prospect Cold</option>
                </SelectField>
              </FormField>

              {/* Membership Checkboxes */}
              <FormField label="Membership" className="md:col-span-2 lg:col-span-3">
                <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-white border border-slate-200/90 rounded-xl min-h-[46px]">
                  {DEFAULT_MEMBERSHIPS.map((mName) => {
                    const isChecked = form.membership.includes(mName);
                    return (
                      <label key={mName} className="inline-flex items-center gap-2 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                          checked={isChecked}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm((prev) => ({
                              ...prev,
                              membership: checked
                                ? [...prev.membership, mName]
                                : prev.membership.filter((n) => n !== mName),
                            }));
                          }}
                        />
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all ${isChecked
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100/70 border border-indigo-100/60"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Email Address">
                <input
                  name="email"
                  type="email"
                  className={inputClass}
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="Phone Number">
                <div className="flex items-center gap-2.5 w-full">
                  {/* Type-search numeric country code */}
                  <NumericCountryCodeSearch
                    value={form.countryCode}
                    onChange={(val) => updateField("countryCode", val)}
                  />
                  {/* Only numeric digits allowed in phone number */}
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    className="flex-1 min-w-0 px-3.5 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </FormField>

              <FormField label="Website">
                <input
                  name="website"
                  type="text"
                  className={inputClass}
                  placeholder="https://..."
                  value={form.website}
                  onChange={handleChange}
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
                  name="address"
                  rows={2}
                  className={`${inputClass} min-h-[76px] resize-y`}
                  placeholder="Full Address"
                  value={form.address}
                  onChange={handleChange}
                />
              </FormField>

              {/* Arranged in order: Country, State, City, ZIP Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Country Dropdown */}
                <FormField label="Country">
                  <SelectField value={form.country} onChange={handleCountryChange}>
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
                  <SelectField value={form.state} onChange={handleStateChange}>
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
                  <SelectField value={form.city} onChange={handleCityChange}>
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
                    name="zip"
                    type="text"
                    className={inputClass}
                    placeholder="ZIP Code"
                    value={form.zip}
                    onChange={handleChange}
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
                <SelectField
                  value={form.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR (Rs.)</option>
                </SelectField>
              </FormField>

              <FormField label="GSTIN">
                <input
                  name="gstIn"
                  type="text"
                  className={inputClass}
                  placeholder="GST Number"
                  value={form.gstIn}
                  onChange={handleChange}
                />
              </FormField>

              <FormField label="VAT Number">
                <input
                  name="vat"
                  type="text"
                  className={inputClass}
                  placeholder="VAT Number"
                  value={form.vat}
                  onChange={handleChange}
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
                  name="notes"
                  rows={4}
                  className={`${inputClass} min-h-[110px] resize-y`}
                  placeholder="Enter any notes or comments about this client..."
                  value={form.notes}
                  onChange={handleChange}
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

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${isDragging
                ? "border-indigo-500 bg-indigo-50/70 scale-[1.008]"
                : "border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-indigo-300"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_DOC_EXTENSIONS.join(",")}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFilesAdded(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 text-center mb-1">
                {isDragging ? "Drop your files here to attach" : "Drag & drop files here, or click to browse"}
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

            {/* List of uploaded/dragged files */}
            {uploadedFiles.length > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Attached Files ({uploadedFiles.length})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uploadedFiles.map((doc, idx) => (
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
                              setUploadedFiles((prev) =>
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
                        onClick={() => removeUploadedFile(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-xs font-medium text-slate-400 mt-3">
                No documents uploaded for this client yet.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/sales/clients")}
              className="px-6 py-2.5 bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
