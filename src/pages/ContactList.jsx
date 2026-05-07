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
  Pencil
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
  { id: 'clientId', label: 'Client id' },
  { id: 'clientCode', label: 'Client code' },
  { id: 'fullName', label: 'Full Name' },
  { id: 'countryCode', label: 'Country code' },
  { id: 'isoCode', label: 'Iso code' },
  { id: 'phone', label: 'Phone no' },
  { id: 'email', label: 'Email' },
  { id: 'dob', label: 'Dob' },
  { id: 'gender', label: 'Gender' },
  { id: 'companyId', label: 'Company id' },
  { id: 'designation', label: 'Designation' },
  { id: 'country', label: 'Country' },
  { id: 'region', label: 'Region' },
  { id: 'city', label: 'City' },
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

  const filteredContacts = contacts.filter(contact =>
    (contact.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (contact.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (contact.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (contact.company?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

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
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* Premium Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
              Contact List
            </h1>
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Manage and organize your professional communication directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 ml-auto md:ml-0">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 ml-auto md:ml-0">
              <button
                onClick={() => {
                  setTempVisibleColumns(visibleColumns);
                  setIsSettingsModalOpen(true);
                }}
                className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* Contact Table Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden relative border-t-4 border-t-indigo-600">
          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-[13px] border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  
                  {visibleColumns.includes('clientId') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Client Id</th>}
                  {visibleColumns.includes('clientCode') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Client Code</th>}
                  {visibleColumns.includes('fullName') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Full Name</th>}
                  {visibleColumns.includes('countryCode') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Code</th>}
                  {visibleColumns.includes('isoCode') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">ISO</th>}
                  {visibleColumns.includes('phone') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Phone No</th>}
                  {visibleColumns.includes('email') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Email</th>}
                  {visibleColumns.includes('dob') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">DOB</th>}
                  {visibleColumns.includes('gender') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Gender</th>}
                  {visibleColumns.includes('companyId') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Comp ID</th>}
                  {visibleColumns.includes('designation') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Designation</th>}
                  {visibleColumns.includes('country') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Country</th>}
                  {visibleColumns.includes('region') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">Region</th>}
                  {visibleColumns.includes('city') && <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px]">City</th>}
                  
                  <th className="px-6 py-6 font-black text-slate-600 uppercase tracking-[0.2em] text-[10px] text-center sticky right-0 bg-slate-50/50">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="20" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        <p className="text-slate-400 font-bold italic">Loading contacts...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan="20" className="px-6 py-20 text-center">
                      <p className="text-slate-400 font-bold italic">No contacts found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact, idx) => (
                    <tr key={contact._id} className="group hover:bg-indigo-50/20 transition-all duration-200">
                      {visibleColumns.includes('clientId') && <td className="px-6 py-5 font-bold">{contact.clientId}</td>}
                      {visibleColumns.includes('clientCode') && <td className="px-6 py-5 font-mono text-[11px] bg-slate-50 rounded px-1">{contact.clientCode?.replace('MEM-', '')}</td>}
                      {visibleColumns.includes('fullName') && (
                        <td className="px-6 py-5 font-extrabold text-slate-900 capitalize">
                          {contact.firstName} {contact.lastName}
                        </td>
                      )}
                      {visibleColumns.includes('countryCode') && <td className="px-6 py-5 text-slate-500">{contact.countryCode}</td>}
                      {visibleColumns.includes('isoCode') && <td className="px-6 py-5 font-mono text-indigo-600">{contact.isoCode}</td>}
                      {visibleColumns.includes('phone') && (
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-500 font-bold tabular-nums">
                            <Phone className="w-3 h-3 text-slate-300" />
                            {contact.phone || <span className="text-slate-300 italic font-medium">--</span>}
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('email') && (
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-500 font-bold">
                            <Mail className="w-3 h-3 text-slate-300" />
                            {contact.email}
                          </div>
                        </td>
                      )}
                      {visibleColumns.includes('dob') && <td className="px-6 py-5 font-medium">{contact.dob}</td>}
                      {visibleColumns.includes('gender') && <td className="px-6 py-5"><span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold uppercase">{contact.gender}</span></td>}
                      {visibleColumns.includes('companyId') && <td className="px-6 py-5 text-slate-600 font-bold">{contact.companyId}</td>}
                      {visibleColumns.includes('designation') && <td className="px-6 py-5 font-bold text-indigo-600 italic">{contact.designation}</td>}
                      {visibleColumns.includes('country') && <td className="px-6 py-5 text-slate-600 font-medium">{contact.country}</td>}
                      {visibleColumns.includes('region') && <td className="px-6 py-5 text-slate-600 uppercase tracking-tighter font-black">{contact.region}</td>}
                      {visibleColumns.includes('city') && <td className="px-6 py-5 font-bold">{contact.city}</td>}

                      <td className="px-6 py-5 text-center sticky right-0 bg-white/95 backdrop-blur-sm group-hover:bg-indigo-50/40 transition-all border-l border-slate-50">
                        <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === contact._id ? null : contact._id)}
                            className={`p-2 rounded-xl transition-all duration-300 ${activeMenuId === contact._id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-indigo-50 text-slate-400 hover:text-indigo-600'}`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {activeMenuId === contact._id && (
                            <div className="absolute right-full mr-2 top-0 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-right-2 fade-in duration-200">
                              <div className="p-1.5">
                                <button
                                  onClick={() => {
                                    handleEdit(contact);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors group/item"
                                >
                                  <Pencil className="w-4 h-4 text-slate-400 group-hover/item:text-indigo-600 transition-colors" />
                                  Edit
                                </button>
                                <div className="h-px bg-slate-50 my-1" />
                                <button
                                  onClick={() => {
                                    handleDelete(contact._id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors group/item"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-300 group-hover/item:text-rose-600 transition-colors" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )))
                }
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
              Showing <span className="text-slate-900 font-black">{filteredContacts.length}</span> of <span className="text-slate-900 font-black">{contacts.length}</span> Contacts
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2.5 text-slate-600 hover:text-indigo-600 transition-all disabled:opacity-30 cursor-not-allowed bg-white border border-slate-100 rounded-xl">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-100">1</button>
              <button className="p-2.5 bg-white text-slate-600 hover:text-indigo-600 transition-all border border-slate-100 rounded-xl">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Choose Columns Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSettingsModalOpen(false)} />

          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="bg-[#1a1c31] px-6 py-5 flex items-center justify-between">
              <h2 className="text-white text-lg font-bold tracking-tight italic uppercase">Choose Columns</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-0.5">
                {allColumns.map(col => (
                  <label key={col.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-6 w-6 appearance-none rounded-lg border-2 border-slate-200 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer shadow-sm"
                        checked={tempVisibleColumns.includes(col.id)}
                        onChange={() => toggleColumnSelection(col.id)}
                      />
                      <CheckCircle2 className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-1" />
                    </div>
                    <span className="text-[14px] font-black text-slate-700 tracking-tight group-hover:text-slate-900">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-slate-100">
              <button
                onClick={applyColumnSettings}
                className="w-full py-4 bg-[#3382c4] hover:bg-[#286ba3] hover:shadow-xl hover:translate-y-[-2px] text-white rounded-2xl font-black text-base transition-all active:scale-95 shadow-lg shadow-blue-500/20 uppercase tracking-widest"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-premium { font-family: 'Outfit', sans-serif; }
        .custom-scrollbarThin::-webkit-scrollbar { height: 2px; }
        .custom-scrollbarThin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
