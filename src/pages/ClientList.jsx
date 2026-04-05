import React, { useState } from 'react';
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
  Save
} from 'lucide-react';

const initialClients = [
  { id: 1, code: 'CMP00008', name: 'CPSL (Celer Pawlowsky, SL)', type: 'Private', contact: '902363085', createdBy: 'Abhijit Kumar Medhi', status: 'Active', email: 'info@cpsl.com', marketStatus: 'High', companyStatus: 'Verified', currency: 'EUR', countryCode: 'ES', isoCode: 'ESP', membership: 'Gold' },
  { id: 2, code: 'CMP00007', name: 'Lionbridge Technologies Inc.', type: 'Private', contact: '6756700077', createdBy: 'Sutapa Bhattacharya', status: 'Active', email: 'contact@lionbridge.com', marketStatus: 'High', companyStatus: 'Verified', currency: 'USD', countryCode: 'US', isoCode: 'USA', membership: 'Platinum' },
  { id: 3, code: 'CMP00004', name: 'Emerze', type: 'Private', contact: '7897897897', createdBy: 'Sutapa Bhattacharya', status: 'Onboarding', email: 'emerze@test.com', marketStatus: 'Medium', companyStatus: 'Pending', currency: 'INR', countryCode: 'IN', isoCode: 'IND', membership: 'Standard' },
  { id: 4, code: 'CMP00003', name: 'ADK Fortune - Delhi', type: 'Private', contact: '+91-124-4539724', createdBy: 'Sutapa Bhattacharya', status: 'Active', email: 'adk@delhi.com', marketStatus: 'Medium', companyStatus: 'Verified', currency: 'INR', countryCode: 'IN', isoCode: 'IND', membership: 'Silver' },
  { id: 5, code: 'CMP00002', name: 'Mayflower Language Services (P) Ltd.', type: 'Public', contact: '+919538930111', createdBy: 'Sutapa Bhattacharya', status: 'Review', email: 'info@mayflower.in', marketStatus: 'High', companyStatus: 'Under Review', currency: 'INR', countryCode: 'IN', isoCode: 'IND', membership: 'Gold' },
];

const allColumns = [
  { id: 'id', label: 'Id' },
  { id: 'code', label: 'Company code' },
  { id: 'name', label: 'Company name' },
  { id: 'type', label: 'Company type' },
  { id: 'ownershipType', label: 'Ownership type' },
  { id: 'membership', label: 'Membership' },
  { id: 'currency', label: 'Currency' },
  { id: 'countryCode', label: 'Country code' },
  { id: 'isoCode', label: 'Iso code' },
  { id: 'contact', label: 'Company contact no' },
  { id: 'email', label: 'Company email' },
  { id: 'marketStatus', label: 'Market status' },
  { id: 'companyStatus', label: 'Company status' },
  { id: 'createdBy', label: 'Created by' },
];

export default function ClientList() {
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  const [visibleColumns, setVisibleColumns] = useState(['code', 'name', 'ownershipType', 'contact', 'createdBy']);
  const [tempVisibleColumns, setTempVisibleColumns] = useState(visibleColumns);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Private',
    contact: '',
    status: 'Active'
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({ ...client });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({
      code: `CMP${String(clients.length + 1).padStart(5, '0')}`,
      name: '',
      type: 'Private',
      contact: '',
      status: 'Onboarding'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClient) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...formData, id: c.id, createdBy: c.createdBy } : c));
    } else {
      setClients([...clients, { ...formData, id: Date.now(), createdBy: 'Current User' }]);
    }
    setIsModalOpen(false);
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
                  {visibleColumns.includes('id') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Id</th>}
                  {visibleColumns.includes('code') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Company Code</th>}
                  {visibleColumns.includes('name') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Company Name</th>}
                  {visibleColumns.includes('type') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Company Type</th>}
                  {visibleColumns.includes('ownershipType') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Ownership type</th>}
                  {visibleColumns.includes('membership') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Membership</th>}
                  {visibleColumns.includes('currency') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Currency</th>}
                  {visibleColumns.includes('countryCode') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Country code</th>}
                  {visibleColumns.includes('isoCode') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Iso code</th>}
                  {visibleColumns.includes('contact') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Company contact no</th>}
                  {visibleColumns.includes('email') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Company email</th>}
                  {visibleColumns.includes('marketStatus') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Market status</th>}
                  {visibleColumns.includes('companyStatus') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Company status</th>}
                  {visibleColumns.includes('createdBy') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Created By</th>}
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
                    {visibleColumns.includes('code') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100">
                            {client.code}
                          </span>
                        </div>
                      </td>
                    )}
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
                    {visibleColumns.includes('type') && <td className="px-6 py-5 font-medium">{client.type}</td>}
                    {visibleColumns.includes('ownershipType') && (
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          client.type === 'Private' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
                        }`}>
                          {client.type}
                        </span>
                      </td>
                    )}
                    {visibleColumns.includes('membership') && <td className="px-6 py-5 font-bold text-indigo-600">{client.membership}</td>}
                    {visibleColumns.includes('currency') && <td className="px-6 py-5">{client.currency}</td>}
                    {visibleColumns.includes('countryCode') && <td className="px-6 py-5">{client.countryCode}</td>}
                    {visibleColumns.includes('isoCode') && <td className="px-6 py-5 font-mono">{client.isoCode}</td>}
                    {visibleColumns.includes('contact') && <td className="px-6 py-5 font-semibold text-slate-500 tabular-nums">{client.contact}</td>}
                    {visibleColumns.includes('email') && <td className="px-6 py-5 text-slate-500">{client.email}</td>}
                    {visibleColumns.includes('marketStatus') && <td className="px-6 py-5 font-bold text-emerald-600">{client.marketStatus}</td>}
                    {visibleColumns.includes('companyStatus') && <td className="px-6 py-5"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase">{client.companyStatus}</span></td>}
                    {visibleColumns.includes('createdBy') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {client.createdBy.charAt(0)}
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

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Client Identity Management</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Code</label>
                  <input 
                    type="text"
                    disabled
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-indigo-600"
                    value={formData.code}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ownership Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option>Private</option>
                    <option>Public</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                  <input 
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    placeholder="e.g. Acme Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
                  <input 
                    type="text"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    placeholder="+91 00000 00000"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-[1.5rem] font-black text-sm uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all"
                >
                  {editingClient ? 'Update Info' : 'Confirm Registration'}
                </button>
              </div>
            </form>
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