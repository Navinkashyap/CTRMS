import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  Globe,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Award,
  CircleDollarSign,
  User,
  Map,
  Flag,
  Briefcase
} from 'lucide-react';

export default function ViewClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const client = location.state?.client;

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Client Not Found</h2>
        <p className="text-slate-500 mb-6">We couldn't find the details for this client.</p>
        <button
          onClick={() => navigate('/clients')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition"
        >
          Back to Client List
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
              onClick={() => navigate('/clients')}
              className="p-2.5 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                {client.name}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${['Active', 'Client'].includes(client.status)
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                      : ['Onboarding', 'Prospect Warm'].includes(client.status)
                        ? 'text-amber-700 bg-amber-50 border border-amber-200'
                        : client.status === 'Prospect Cold'
                          ? 'text-blue-700 bg-blue-50 border border-blue-200'
                          : 'text-slate-600 bg-slate-100 border border-slate-200'
                    }`}
                >
                  {client.status}
                </span>
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">
                Client Profile & Details
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/clients/add-client', { state: { client } })}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 justify-center"
          >
            Edit Profile
          </button>
        </div>

        {/* Details Grid */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Section 1: Primary Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                Primary Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem icon={Building2} label="Company Name" value={client.name} />
                <DetailItem icon={Award} label="Membership Code" value={client.membershipCode} />
                <DetailItem icon={Globe} label="Domain" value={client.domain} />
                <DetailItem icon={Award} label="Membership Type" value={client.membership} />
                <DetailItem icon={Calendar} label="Registration Date" value={client.registrationDate} />
                <DetailItem icon={User} label="Created By" value={client.createdBy} />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem icon={Mail} label="Email Address" value={client.email} />
                <DetailItem icon={Phone} label="Phone Number" value={client.phone} />
                <DetailItem icon={Globe} label="Website" value={
                  client.website ? (
                    <a href={client.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                      {client.website}
                    </a>
                  ) : '-'
                } />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Location Details */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                Location Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DetailItem icon={MapPin} label="Full Address" value={client.address} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DetailItem icon={Map} label="City" value={client.city} />
                <DetailItem icon={MapPin} label="State" value={client.state} />
                <DetailItem icon={Flag} label="Country" value={client.country} />
                <DetailItem icon={MapPin} label="ZIP Code" value={client.zip} />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Section 4: Financial */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-amber-500" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem icon={CircleDollarSign} label="Preferred Currency" value={client.currency} />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
