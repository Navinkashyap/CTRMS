import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  User,
  ChevronLeft,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Building2,
  Briefcase,
  UserCircle,
  Layers,
  LoaderCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { getContact } from '../lib/contactApi';

export default function ViewContact() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [contact, setContact] = useState(location.state?.contact || null);
  const [loading, setLoading] = useState(!contact);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id && !contact) {
      const loadContact = async () => {
        try {
          setLoading(true);
          const data = await getContact(id);
          setContact(data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load contact details.');
        } finally {
          setLoading(false);
        }
      };
      loadContact();
    }
  }, [id, contact]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading contact profile...</p>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm mx-auto max-w-md mt-10">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Contact Not Found</h2>
        <p className="text-slate-500 mb-8">{error || "We couldn't find the details for this contact."}</p>
        <button
          onClick={() => navigate('/contacts')}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
        >
          Back to Contact List
        </button>
      </div>
    );
  }

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-indigo-500" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="font-semibold text-slate-800 text-sm">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8 animate-in fade-in duration-700">
      <div className="max-w-[1000px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 sm:px-8 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/contacts')}
              className="p-2.5 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                {contact.firstName} {contact.lastName}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200">
                  {contact.designation || 'Contact'}
                </span>
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">
                Professional Contact Profile
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/contacts/add-contact', { state: { contact } })}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 justify-center"
          >
            Edit Contact
          </button>
        </div>

        {/* Details Grid */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">

            {/* Section 1: Primary Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-indigo-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem icon={User} label="First Name" value={contact.firstName} />
                <DetailItem icon={User} label="Last Name" value={contact.lastName} />
                <DetailItem icon={Calendar} label="Date of Birth" value={contact.dob} />
                <DetailItem icon={UserCircle} label="Gender" value={contact.gender} />
                <DetailItem icon={Globe} label="Country Code" value={contact.countryCode} />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Professional Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem icon={Building2} label="Company" value={contact.company} />
                <DetailItem icon={Briefcase} label="Designation" value={contact.designation} />
                <DetailItem icon={Layers} label="Client Code" value={contact.clientCode} />
                <DetailItem icon={Building2} label="Company ID" value={contact.companyId} />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <DetailItem icon={Mail} label="Email Address" value={contact.email} />
                <DetailItem icon={Phone} label="Phone Number" value={contact.phone} />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 4: Location Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                Location Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem icon={MapPin} label="City" value={contact.city} />
                <DetailItem icon={MapPin} label="Region" value={contact.region} />
                <DetailItem icon={Globe} label="Country" value={contact.country} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
