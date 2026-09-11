import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserCircle,
  Search,
  Settings,
  UserPlus,
  Edit3,
  ChevronRight,
  ChevronLeft,
  Trash2,
  TrendingUp,
  Shield,
  Building2,
  CheckCircle2,
  Phone,
  Mail,
  X,
  User,
  MapPin,
  Calendar,
  Layers,
  Heart,
  Loader2,
  MoreVertical,
  Pencil,
  Eye,
  Briefcase,
  Users
} from 'lucide-react';
import { getContacts, deleteContact } from '../lib/contactApi';

const initialContacts = [
  { id: 1, clientId: 'CL001', clientCode: 'CC001', firstName: 'Aham', lastName: 'Brahmasmi', phone: '+91 12346 57890', email: 'admin@example.com', company: 'ADK Fortune - Delhi', status: 'Inactive', dob: '1990-05-15', gender: 'Male', companyId: 'CP001', designation: 'Admin', country: 'India', region: 'North', city: 'Delhi', countryCode: 'IN', isoCode: 'IND' },
  { id: 2, clientId: 'CL002', clientCode: 'CC002', firstName: 'Poonam', lastName: 'Thakkar', phone: '+1 67567000', email: 'Poonam.Thakkar@lionbridge.com', company: 'Lionbridge Technologies Inc.', status: 'Active', dob: '1985-08-22', gender: 'Female', companyId: 'CP002', designation: 'Manager', country: 'USA', region: 'West', city: 'San Jose', countryCode: 'US', isoCode: 'USA' },
  { id: 3, clientId: 'CL003', clientCode: 'CC003', firstName: 'Gwalior', lastName: 'Directory', phone: '999 999 9998', email: 'gwaliodirectory@gmail.com', company: 'NA', status: 'Active', dob: '1992-11-10', gender: 'Other', companyId: 'CP003', designation: 'Lead', country: 'India', region: 'Central', city: 'Gwalior', countryCode: 'IN', isoCode: 'IND' },
  { id: 4, clientId: 'CL004', clientCode: 'CC004', firstName: 'Amit', lastName: 'Dey', phone: '999 034 5016', email: 'amit.dey@adk-fortune.com', company: 'ADK Fortune - Delhi', status: 'Active', dob: '1988-03-30', gender: 'Male', companyId: 'CP001', designation: 'Developer', country: 'India', region: 'North', city: 'Delhi', countryCode: 'IN', isoCode: 'IND' },
  { id: 5, clientId: 'CL005', clientCode: 'CC005', firstName: 'Arpita', lastName: 'Chakraborty', phone: '', email: 'arpita.chakraborty@adk-fortune.com', company: 'ADK Fortune - Delhi', status: 'Active', dob: '1995-01-20', gender: 'Female', companyId: 'CP001', designation: 'QA', country: 'India', region: 'North', city: 'Delhi', countryCode: 'IN', isoCode: 'IND' },
  { id: 6, clientId: 'CL006', clientCode: 'CC006', firstName: 'Raghuraj', lastName: 'Chakravarthi', phone: '9180 2210 1888', email: 'raghuraj@mayflowerlanguages.com', company: 'Mayflower Language Services (P) Ltd.', status: 'Active', dob: '1982-12-05', gender: 'Male', companyId: 'CP005', designation: 'CEO', country: 'India', region: 'South', city: 'Bangalore', countryCode: 'IN', isoCode: 'IND' },
  { id: 7, clientId: 'CL007', clientCode: 'CC007', firstName: 'Vedavathi', lastName: 'HJ', phone: '9180 2210 1888', email: 'vedavathi@mayflowerlanguages.com', company: 'Mayflower Language Services (P) Ltd.', status: 'Active', dob: '1991-07-14', gender: 'Female', companyId: 'CP005', designation: 'COO', country: 'India', region: 'South', city: 'Bangalore', countryCode: 'IN', isoCode: 'IND' },
  { id: 8, clientId: 'CL008', clientCode: 'CC008', firstName: 'Selvakumar', lastName: 'R', phone: '4564564564564', email: 'selvakumar@mayflowerlanguages.com', company: 'Mayflower Language Services (P) Ltd.', status: 'Active', dob: '1987-09-25', gender: 'Male', companyId: 'CP005', designation: 'Director', country: 'India', region: 'South', city: 'Bangalore', countryCode: 'IN', isoCode: 'IND' },
];

const allColumns = [
  { id: 'fullName', label: 'Full Name' },
  { id: 'countryCode', label: 'Country code' },
  { id: 'phone', label: 'Phone no' },
  { id: 'email', label: 'Email' },
  { id: 'designation', label: 'Designation' },
];

export default function ContactList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(location.state?.clientName || '');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await deleteContact(id);
      fetchContacts();
    } catch (err) {
      console.error("Failed to delete contact", err);
    }
  };

  // Default visible columns as per normal view
  const [visibleColumns, setVisibleColumns] = useState(['fullName', 'phone', 'email', 'designation']);
  const [tempVisibleColumns, setTempVisibleColumns] = useState(visibleColumns);

  const filteredContacts = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact =>
      (contact.firstName?.toLowerCase() || '').includes(query) ||
      (contact.lastName?.toLowerCase() || '').includes(query) ||
      (contact.email?.toLowerCase() || '').includes(query) ||
      (contact.company?.toLowerCase() || '').includes(query)
    );
  }, [contacts, searchQuery]);

  const handleEdit = (contact) => {
    navigate('/contacts/add-contact', { state: { contact } });
  };

  const handleAdd = () => {
    navigate('/contacts/add-contact');
  };

  const toggleColumnSelection = (colId) => {
    setTempVisibleColumns(prev =>
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const applyColumnSettings = () => {
    setVisibleColumns(tempVisibleColumns);
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:px-8 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Contact List
            </h1>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Manage and organize your professional communication directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setTempVisibleColumns(visibleColumns);
                  setIsSettingsModalOpen(true);
                }}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                <Settings className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-slate-200 hidden md:block" />

              <button
                onClick={handleAdd}
                className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                Add Contact
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {visibleColumns.includes('fullName') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Full Name</th>}
                  {visibleColumns.includes('countryCode') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Country Code</th>}
                  {visibleColumns.includes('phone') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Phone</th>}
                  {visibleColumns.includes('email') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Email</th>}
                  {visibleColumns.includes('designation') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Designation</th>}
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-center sticky right-0 bg-slate-50 z-30 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] border-l border-slate-100">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {isLoading ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-600 space-y-3">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                        <p className="font-medium text-slate-500">Loading contacts...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={visibleColumns.length + 1} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-600 space-y-3">
                        <Search className="w-12 h-12 text-slate-200" />
                        <p className="font-medium text-slate-500">No contacts found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact._id} className="group hover:bg-slate-50/50 transition-colors">
                      {visibleColumns.includes('fullName') && (
                        <td className="px-6 py-4">
                          <div 
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => navigate(`view-contact/${contact._id}`, { state: { contact } })}
                          >
                            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600 shrink-0">
                              {(contact.firstName?.charAt(0) || '').toUpperCase()}
                              {(contact.lastName?.charAt(0) || '').toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900 capitalize group-hover:text-indigo-600 transition-colors hover:underline">
                              {contact.firstName} {contact.lastName}
                            </span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('countryCode') && <td className="px-6 py-4 text-slate-600">{contact.countryCode || '—'}</td>}
                      {visibleColumns.includes('phone') && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600 tabular-nums">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {contact.phone || <span className="text-slate-400">—</span>}
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('email') && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {contact.email || '—'}
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('designation') && (
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-700">{contact.designation || '—'}</span>
                        </td>
                      )}

                      <td className={`px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-100 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] ${activeMenuId === contact._id ? 'z-40' : 'z-20'}`}>
                        <div className="relative flex justify-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === contact._id ? null : contact._id)}
                            className={`p-2 rounded-xl transition-all ${activeMenuId === contact._id
                              ? 'bg-indigo-50 text-indigo-600 shadow-inner'
                              : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                              }`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {activeMenuId === contact._id && (
                            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-2 z-30">
                              <div className="px-4 py-1.5 mb-1 border-b border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</p>
                              </div>
                              <button
                                onClick={() => {
                                  handleEdit(contact);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group/item"
                              >
                                <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover/item:bg-white flex items-center justify-center transition-colors">
                                  <Pencil className="w-4 h-4" />
                                </div>
                                Edit Contact
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  navigate(`view-contact/${contact._id}`, { state: { contact } });
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group/item"
                              >
                                <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover/item:bg-white flex items-center justify-center transition-colors">
                                  <Eye className="w-4 h-4" />
                                </div>
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(contact._id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all group/item"
                              >
                                <div className="w-8 h-8 rounded-lg bg-rose-50 group-hover/item:bg-white flex items-center justify-center transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </div>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing <span className="text-slate-900 font-semibold">{filteredContacts.length}</span> of <span className="text-slate-900 font-semibold">{contacts.length}</span> contacts
            </p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30 cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold text-sm shadow-sm shadow-indigo-200">1</button>
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingsModalOpen(false)} />

          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white text-lg font-semibold tracking-tight">Choose Columns</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-0.5">
                {allColumns.map(col => (
                  <label key={col.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 appearance-none rounded border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                        checked={tempVisibleColumns.includes(col.id)}
                        onChange={() => toggleColumnSelection(col.id)}
                      />
                      <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={applyColumnSettings}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbarThin::-webkit-scrollbar { height: 4px; }
        .custom-scrollbarThin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
