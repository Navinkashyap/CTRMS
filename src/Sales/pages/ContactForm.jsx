import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  CircleAlert,
  CircleCheckBig,
} from "lucide-react";
import { createContact, getClients, getContact, getDepartments, updateContact } from "../lib/salesApi";
import { countryCodes } from "../../lib/countryCodes";

const byNameAsc = (a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });

const emptyContact = {
  clientId: "",
  clientCode: "",
  company: "",
  salutation: "Mr.",
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+91",
  phone: "",
  isWhatsapp: false,
  designation: "",
  department: "",
  status: "Active",
  dob: "",
  remark: "",
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

const ContactForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ ...emptyContact, clientId: searchParams.get("clientId") || "" });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      getClients().catch(() => []),
      getDepartments().catch(() => []),
    ]).then(([clientsData, deptData]) => {
      setClients(clientsData || []);
      setDepartments((deptData || []).filter((d) => d.status !== "Inactive"));

      const paramClientId = searchParams.get("clientId");
      if (paramClientId && clientsData?.length) {
        const found = clientsData.find((c) => c._id === paramClientId);
        if (found) {
          setForm((prev) => ({
            ...prev,
            clientId: found._id,
            company: found.name,
            clientCode: found.membershipCode || "",
          }));
        }
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (!isEdit) return;
    getContact(id)
      .then((contact) => {
        let phone = contact.phone || "";
        let countryCode = contact.countryCode || "+91";
        const matched = countryCodes.find((c) => phone.startsWith(c.code + " ") || phone.startsWith(c.code));
        if (matched) {
          countryCode = matched.code;
          phone = phone.replace(matched.code, "").trim();
        }
        setForm({
          ...emptyContact,
          ...contact,
          countryCode,
          phone: phone.replace(/\D/g, ""),
        });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const updateField = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));

  const sortedClients = useMemo(() => [...clients].sort(byNameAsc), [clients]);

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find((c) => c._id === clientId);
    setForm((prev) => ({
      ...prev,
      clientId,
      company: client?.name || "",
      clientCode: client?.membershipCode || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        phone: form.phone ? `${form.countryCode} ${form.phone}`.trim() : "",
      };
      if (isEdit) {
        await updateContact(id, payload);
        setSuccess("Contact updated successfully!");
      } else {
        await createContact(payload);
        setSuccess("Contact created successfully!");
      }
      setTimeout(() => navigate("/sales/contacts"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm font-semibold text-slate-500">Loading contact details...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-slate-900 pb-12 w-full space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/sales/contacts")}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200/80 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 shadow-xs transition-all shrink-0"
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isEdit ? "Edit Contact" : "Add Client Contact"}
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-normal mt-0.5">
            Client Contact Profile & Details
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
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
                  value={form.clientId}
                  onChange={handleClientChange}
                  required
                >
                  <option value="" disabled>Select client</option>
                  {sortedClients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.membershipCode ? `(${c.membershipCode})` : ""}
                    </option>
                  ))}
                </SelectField>
              </FormField>

              {/* Status */}
              <FormField label="Status" required>
                <SelectField
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
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
                    value={form.salutation}
                    onChange={(e) => updateField("salutation", e.target.value)}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                  </SelectField>
                </FormField>

                <FormField label="First Name" required className="flex-1 min-w-0">
                  <input
                    name="firstName"
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Enter first name"
                    value={form.firstName}
                    onChange={handleChange}
                  />
                </FormField>
              </div>

              {/* Last Name */}
              <FormField label="Last Name" required>
                <input
                  name="lastName"
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Enter last name"
                  value={form.lastName}
                  onChange={handleChange}
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
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                  placeholder="contact@company.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </FormField>

              {/* Phone Number with WhatsApp toggle */}
              <FormField label="Phone Number">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 w-full">
                    <NumericCountryCodeSearch
                      value={form.countryCode}
                      onChange={(val) => updateField("countryCode", val)}
                    />
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
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                      checked={form.isWhatsapp}
                      onChange={(e) => updateField("isWhatsapp", e.target.checked)}
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
                  name="designation"
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Procurement Lead"
                  value={form.designation}
                  onChange={handleChange}
                />
              </FormField>

              {/* Department */}
              <FormField label="Department">
                {departments.length > 0 ? (
                  <SelectField
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
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
                    name="department"
                    type="text"
                    className={inputClass}
                    placeholder="e.g. Localization"
                    value={form.department}
                    onChange={handleChange}
                  />
                )}
              </FormField>

              {/* Date of Birth */}
              <FormField label="Date of Birth">
                <input
                  name="dob"
                  type="date"
                  className={inputClass}
                  value={form.dob || ""}
                  onChange={handleChange}
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
                  name="remark"
                  rows={4}
                  className={`${inputClass} min-h-[110px] resize-y`}
                  placeholder="Enter any remarks or notes about this contact..."
                  value={form.remark}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/sales/contacts")}
              className="px-6 py-2.5 bg-white border border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Client Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
