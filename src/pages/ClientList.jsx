import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Settings, 
  UserPlus, 
  Edit3, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Shield,
  Building2,
  CheckCircle2,
  MapPin,
  X,
  Save,
  Globe,
  Hash,
  Phone,
  Flag,
  Award,
  Map
} from 'lucide-react';

const initialClients = [
  { id: 1, domain: 'cpsl.com', status: 'Active', membershipCode: 'GOLD-001', name: 'CPSL', website: 'https://cpsl.com', email: 'info@cpsl.com', phone: '902363085', address: 'Calle Marina 16-18', city: 'Barcelona', country: 'Spain', registrationDate: '2024-01-15', createdBy: 'Abhijit Kumar Medhi' },
  { id: 2, domain: 'lionbridge.com', status: 'Active', membershipCode: 'PLAT-002', name: 'Lionbridge', website: 'https://lionbridge.com', email: 'contact@lionbridge.com', phone: '6756700077', address: '1050 Winter Street', city: 'Waltham', country: 'USA', registrationDate: '2024-02-20', createdBy: 'Sutapa Bhattacharya' },
];

const allColumns = [
  { id: 'domain', label: 'Domain' },
  { id: 'status', label: 'Status' },
  { id: 'membershipCode', label: 'Membership Code' },
  { id: 'name', label: 'Name' },
  { id: 'website', label: 'Website' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'address', label: 'Address' },
  { id: 'city', label: 'City' },
  { id: 'country', label: 'Country' },
  { id: 'registrationDate', label: 'Registration Date' },
  { id: 'createdBy', label: 'Added By' },
];

export default function ClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [visibleColumns, setVisibleColumns] = useState(['domain', 'status', 'name', 'phone', 'city', 'country']);
  const [tempVisibleColumns, setTempVisibleColumns] = useState(visibleColumns);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (client) => {
    navigate('/clients/add-client', { state: { client } });
  };

  const handleAdd = () => {
    navigate('/clients/add-client');
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
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-2">
        
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
              Client List
            </h1>
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Manage and monitor your corporate partnerships and client directory.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
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
                Add Client
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Projects', value: '24', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Security Level', value: 'High', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-white shadow-sm flex items-center justify-between group hover:bg-white transition-all">
              <div className="text-left">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Client Table Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden relative border-t-4 border-t-indigo-600">
          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-[13px] border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">S.No.</th>
                  {visibleColumns.includes('domain') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Domain</th>}
                  {visibleColumns.includes('status') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Status</th>}
                  {visibleColumns.includes('membershipCode') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Membership Code</th>}
                  {visibleColumns.includes('name') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Name</th>}
                  {visibleColumns.includes('website') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Website</th>}
                  {visibleColumns.includes('email') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Email</th>}
                  {visibleColumns.includes('phone') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Phone</th>}
                  {visibleColumns.includes('address') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Address</th>}
                  {visibleColumns.includes('city') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">City</th>}
                  {visibleColumns.includes('country') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Country</th>}
                  {visibleColumns.includes('registrationDate') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Registration</th>}
                  {visibleColumns.includes('createdBy') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Added By</th>}
                  <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] text-center sticky right-0 bg-slate-50/50">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClients.map((client, idx) => (
                  <tr key={client.id} className="group hover:bg-indigo-50/20 transition-all duration-200">
                    <td className="px-8 py-5">
                      <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                        {idx + 1}
                      </span>
                    </td>
                    {visibleColumns.includes('id') && <td className="px-6 py-5 font-bold">{client.id}</td>}
                    {visibleColumns.includes('domain') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100">
                            {client.domain}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('status') && (
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase ${
                          client.status === 'Active' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.includes('membershipCode') && <td className="px-6 py-5 font-bold text-indigo-600">{client.membershipCode}</td>}
                    {visibleColumns.includes('name') && (
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 leading-none mb-1 group-hover:text-indigo-700 transition-colors">{client.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-1" />
                            Verified Client
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('website') && <td className="px-6 py-5 text-blue-500 truncate max-w-[150px]"><a href={client.website} target="_blank" rel="noreferrer">{client.website}</a></td>}
                    {visibleColumns.includes('email') && <td className="px-6 py-5 text-slate-500">{client.email}</td>}
                    {visibleColumns.includes('phone') && <td className="px-6 py-5 font-semibold text-slate-500 tabular-nums">{client.phone}</td>}
                    {visibleColumns.includes('address') && <td className="px-6 py-5 text-slate-500 max-w-[200px] truncate">{client.address}</td>}
                    {visibleColumns.includes('city') && <td className="px-6 py-5 text-slate-500">{client.city}</td>}
                    {visibleColumns.includes('country') && <td className="px-6 py-5 text-slate-500">{client.country}</td>}
                    {visibleColumns.includes('registrationDate') && <td className="px-6 py-5 text-slate-400 font-bold">{client.registrationDate}</td>}
                    {visibleColumns.includes('createdBy') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {client.createdBy?.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-600 text-[12px]">{client.createdBy}</span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-5 text-center sticky right-0 bg-white/95 backdrop-blur-sm group-hover:bg-indigo-50/40 transition-all border-l border-slate-50">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(client)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all shadow-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900 font-black">{filteredClients.length}</span> of <span className="text-slate-900 font-black">{clients.length}</span> Clients
            </p>
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30 cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-100">1</button>
              <button className="w-8 h-8 rounded-lg text-slate-400 font-black text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-all">2</button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
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
          
          <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            {/* Dark Header as per image */}
            <div className="bg-[#1a1c31] px-6 py-4 flex items-center justify-between">
              <h2 className="text-white text-lg font-bold tracking-tight">Choose Columns</h2>
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
                        className="peer h-5 w-5 appearance-none rounded border-2 border-slate-200 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                        checked={tempVisibleColumns.includes(col.id)}
                        onChange={() => toggleColumnSelection(col.id)}
                      />
                      <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[14px] font-bold text-slate-700 group-hover:text-slate-900">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-slate-100 flex justify-end">
              <button 
                onClick={applyColumnSettings}
                className="w-full py-3 bg-[#3382c4] hover:bg-[#286ba3] text-white rounded-xl font-bold text-base transition-all active:scale-95 shadow-lg shadow-blue-500/10"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}


      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbarThin::-webkit-scrollbar { height: 2px; }
        .custom-scrollbarThin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}