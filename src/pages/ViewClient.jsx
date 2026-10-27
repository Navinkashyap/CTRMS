import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronDown,
  Mail,
  Phone,
  Paperclip,
  FileText,
  LoaderCircle,
  AlertCircle
} from 'lucide-react';
import { getClient as fetchClientById } from '../lib/clientApi';
import { getContacts } from '../lib/contactApi';

export default function ViewClient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [client, setClient] = useState(location.state?.client || null);
  const [loading, setLoading] = useState(!client);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isNoteOpen, setIsNoteOpen] = useState(true);

  useEffect(() => {
    if (id) {
      const loadClient = async () => {
        try {
          setLoading(true);
          const data = await fetchClientById(id);
          console.log('Fetched client data:', data);
          setClient(data);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load client details.');
        } finally {
          setLoading(false);
        }
      };
      loadClient();
    }
  }, [id]);

  useEffect(() => {
    if (!client?._id) return;
    getContacts()
      .then((all) =>
        setContacts(
          all.filter((c) => c.clientId === client._id || (c.company && c.company === client.name))
        )
      )
      .catch(() => setContacts([]));
  }, [client?._id, client?.name]);

  // Documents live in a private S3 bucket, so an absolute URL has to be fetched
  // through /api/files/view, which redirects to a short-lived signed link.
  const getFileUrl = (url) => {
    if (!url) return '';
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `${apiBase}/files/view?url=${encodeURIComponent(url)}`;
    }
    return `${apiBase.replace('/api', '')}${url}`;
  };

  // Some documents were uploaded before the S3 migration and stored on local
  // disk (/uploads/...); those files no longer exist on the server, so clicking
  // "Click to view" would otherwise open a silent blank/broken tab. Check first
  // and tell the client-record owner the file needs to be re-uploaded.
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoaderCircle className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading client profile...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm mx-auto max-w-md mt-10">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Client Not Found</h2>
        <p className="text-slate-500 mb-8">{error || "We couldn't find the details for this client."}</p>
        <button
          onClick={() => navigate('/clients')}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95"
        >
          Back to Client List
        </button>
      </div>
    );
  }

  const DetailItem = ({ label, value }) => (
    <div className="py-2.5 px-3.5 rounded-xl bg-slate-50/70 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="font-semibold text-slate-800 text-sm break-words">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="font-sans text-slate-900 pb-6 min-h-screen bg-[#fafbfc] p-4 sm:p-6 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-md py-3.5 px-5 sm:px-6 rounded-2xl border border-white/80 shadow-xs">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate('/clients')}
              className="p-2 bg-white text-slate-600 hover:text-indigo-600 rounded-xl shadow-xs hover:shadow-sm transition-all group shrink-0"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                {client.name}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${['Active', 'Client'].includes(client.status)
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
              <p className="text-slate-500 text-xs font-medium tracking-wide">
                Client Profile & Details
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/clients/add-client', { state: { client } })}
            className="px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 rounded-lg text-sm font-semibold transition-all shadow-xs flex items-center gap-2 justify-center"
          >
            Edit Profile
          </button>
        </div>

        {/* Details Grid */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-4 sm:space-y-5">
                {/* Section 1: Primary Info */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2">
                    Primary Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <DetailItem label="Company Name" value={client.name} />
                    <DetailItem label="Client Code" value={client.membershipCode?.replace('CLI-', '')} />
                    <DetailItem label="Domain" value={client.domain} />
                    <DetailItem
                      label="Membership"
                      value={
                        Array.isArray(client.membership) && client.membership.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {client.membership.map((m, i) => (
                              <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-bold">
                                {m}
                              </span>
                            ))}
                          </div>
                        ) : client.membership || '-'
                      }
                    />
                    <DetailItem label="Registration Date" value={client.registrationDate} />
                    <DetailItem label="Created By" value={client.createdBy} />
                  </div>
                </div>

                {/* Section 2: Contact Info */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5">
                    <DetailItem label="Email Address" value={client.email} />
                    <DetailItem label="Phone Number" value={client.phone} />
                    <DetailItem label="Website" value={
                      client.website ? (
                        <a href={client.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          {client.website}
                        </a>
                      ) : '-'
                    } />
                  </div>
                </div>

                {/* Section 3: Location Details */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2">
                    Location Details
                  </h3>
                  <div className="mb-2.5">
                    <DetailItem label="Full Address" value={client.address} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <DetailItem label="City" value={client.city} />
                    <DetailItem label="State" value={client.state} />
                    <DetailItem label="Country" value={client.country} />
                    <DetailItem label="ZIP Code" value={client.zip} />
                  </div>
                </div>

                {/* Section 4: Financial */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2">
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <DetailItem label="Preferred Currency" value={client.currency} />
                    <DetailItem label="GSTIN" value={client.gstIn} />
                    <DetailItem label="VAT Number" value={client.vat} />
                  </div>
                </div>

              </div>
              <div className="space-y-4 sm:space-y-5">
                {/* Section: Note */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsNoteOpen(prev => !prev)}
                    className="w-full flex items-center justify-between mb-2 group cursor-pointer text-left focus:outline-none"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-slate-800">
                      Note
                    </h3>
                    <div className="p-1 rounded-lg bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isNoteOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {isNoteOpen && (
                    <div className="py-2.5 px-3.5 rounded-xl bg-slate-50/70 transition-colors">
                      <p className="font-medium text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {client.notes || <span className="italic text-slate-400">No notes provided for this client.</span>}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contacts */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
                    Contacts
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">{contacts.length}</span>
                  </h3>
                  {contacts.length > 0 ? (
                    <div className="space-y-2">
                      {contacts.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => navigate(`/contacts/view-contact/${c._id}`, { state: { contact: c } })}
                          className="p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-xs transition-all cursor-pointer"
                        >
                          <p className="font-semibold text-slate-800 text-sm capitalize">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-slate-500">
                            {[c.designation, c.department].filter(Boolean).join(' · ') || '—'}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-600">
                            {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                            {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.countryCode} {c.phone}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs font-medium text-slate-400 italic">No contacts for this client.</p>
                    </div>
                  )}
                </div>

                {/* Section 6: Documents */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2">
                    Uploaded Documents
                  </h3>
                  {client.documents && client.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5">
                      {client.documents.map((doc, i) => (
                        <a
                          key={i}
                          href={getFileUrl(doc.url)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => handleViewDocument(e, doc.url, doc.name)}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/70 hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-xs transition-all group"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
                              <FileText className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate" title={doc.name}>
                                {doc.name}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Click to view
                              </p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 bg-slate-50/30 rounded-xl border border-dashed border-slate-200">
                      <Paperclip className="w-6 h-6 text-slate-200 mb-1" />
                      <p className="text-xs font-medium text-slate-400 italic">No documents uploaded for this client.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
