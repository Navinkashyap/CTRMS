import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Settings, 
  UserPlus, 
  Edit3, 
  ChevronDown,
  LayoutGrid,
  X
} from 'lucide-react';

const initialUsers = [
  { id: 1, name: 'Bhavna Singh', email: 'accounts@perfectrans.com', role: 'Accountant', mobile: '+91 85068 66497', status: 'Active' },
  { id: 2, name: 'Meeta Saxena', email: 'pm9@perfectrans.net', role: 'Project Manager', mobile: '958 208 2036', status: 'Active' },
  { id: 3, name: 'Invoice Centre', email: 'invoice.centre@perfectrans.net', role: 'Accountant', mobile: '850 686 6497', status: 'Active' },
  { id: 4, name: 'Mugdha G', email: 'mugdha@perfectrans.com', role: 'Admin', mobile: '123456789', status: 'Active' },
  { id: 5, name: 'Jason Matthews', email: 'jason@perfectrans.net', role: 'Vendor Manager', mobile: '123 456 7890', status: 'Active' },
  { id: 6, name: 'Kavish Saxena', email: 'pm7@perfectrans.net', role: 'Project Manager', mobile: '123 456 7890', status: 'Active' },
  { id: 7, name: 'Piyush Kumar', email: 'piyush@perfectrans.com', role: 'Super Admin', mobile: '', status: 'Active' },
];

const allColumns = [
  { id: 'id', label: 'User id' },
  { id: 'isActive', label: 'Is active' },
  { id: 'level', label: 'User level' },
  { id: 'parentId', label: 'Parent user id' },
  { id: 'username', label: 'Username' },
  { id: 'email', label: 'Email' },
  { id: 'displayName', label: 'Display name' },
  { id: 'password', label: 'Password' },
  { id: 'isApproved', label: 'Is approved' },
  { id: 'isPreferred', label: 'Is preferred' },
  { id: 'profileImage', label: 'Profile image' },
  { id: 'resetPassword', label: 'Reset password' },
  { id: 'createdAt', label: 'Created at' },
  { id: 'updatedAt', label: 'Updated at' },
  { id: 'createdBy', label: 'Created by' },
];

export default function UsersList() {
  const [users, setUsers] = useState(initialUsers);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(['name', 'email', 'role', 'mobile', 'status']);
  const [tempVisibleColumns, setTempVisibleColumns] = useState(visibleColumns);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Admin',
    mobile: '',
    status: 'Active'
  });
  
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    role: 'All',
    mobile: '',
    status: 'All'
  });

  const filteredUsers = users.filter(user => {
    const matchesName = user.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesEmail = user.email.toLowerCase().includes(filters.email.toLowerCase());
    const matchesRole = filters.role === 'All' || user.role === filters.role;
    const matchesMobile = user.mobile.toLowerCase().includes(filters.mobile.toLowerCase());
    const matchesStatus = filters.status === 'All' || user.status === filters.status;
    return matchesName && matchesEmail && matchesRole && matchesMobile && matchesStatus;
  });

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'Admin', mobile: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...formData, id: u.id } : u));
    } else {
      setUsers([...users, { ...formData, id: Date.now() }]);
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
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
              Users List
            </h1>
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Manage and monitor your team member access and permissions.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 ml-auto md:ml-0">
            <button 
              onClick={() => {
                setTempVisibleColumns(visibleColumns);
                setIsSettingsModalOpen(true);
              }}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 transition-all shadow-sm"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAdd}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden relative border-t-4 border-t-indigo-600 text-left">
          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-[13px] border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 font-black text-slate-700 uppercase tracking-wider text-[11px] border-r border-slate-100 w-16 text-center">#</th>
                  
                  {visibleColumns.includes('id') && <th className="px-6 py-5 border-r border-slate-100 font-black text-slate-700 uppercase tracking-wider text-[11px]">User id</th>}
                  
                  <th className="px-6 py-5 border-r border-slate-100 min-w-[200px]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Full Name</span>
                        <LayoutGrid className="w-3.5 h-3.5 text-slate-400 rotate-45" />
                      </div>
                      <div className="relative group">
                        <input 
                          type="text" 
                          placeholder=""
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                          value={filters.name}
                          onChange={(e) => setFilters({...filters, name: e.target.value})}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-5 border-r border-slate-100 min-w-[250px]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Email</span>
                        <LayoutGrid className="w-3.5 h-3.5 text-slate-400 rotate-45" />
                      </div>
                      <div className="relative group">
                        <input 
                          type="text" 
                          placeholder=""
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                          value={filters.email}
                          onChange={(e) => setFilters({...filters, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-5 border-r border-slate-100 min-w-[160px]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Role</span>
                        <LayoutGrid className="w-3.5 h-3.5 text-slate-400 rotate-45" />
                      </div>
                      <div className="relative">
                        <select 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm cursor-pointer appearance-none"
                          value={filters.role}
                          onChange={(e) => setFilters({...filters, role: e.target.value})}
                        >
                          <option>All</option>
                          <option>Admin</option>
                          <option>Project Manager</option>
                          <option>Accountant</option>
                          <option>Vendor Manager</option>
                          <option>Super Admin</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-5 border-r border-slate-100 min-w-[180px]">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Mobile No</span>
                        <LayoutGrid className="w-3.5 h-3.5 text-slate-400 rotate-45" />
                      </div>
                      <div className="relative group">
                        <input 
                          type="text" 
                          placeholder=""
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                          value={filters.mobile}
                          onChange={(e) => setFilters({...filters, mobile: e.target.value})}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-5 border-r border-slate-100 min-w-[130px]">
                    <div className="space-y-3">
                      <span className="font-black text-slate-700 uppercase tracking-wider text-[11px] block text-left">Status</span>
                      <div className="relative">
                        <select 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm cursor-pointer appearance-none"
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                          <option>All</option>
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-5 font-black text-slate-700 uppercase tracking-wider text-[11px] text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="group hover:bg-indigo-50/20 transition-all duration-200">
                    <td className="px-6 py-5 text-center border-r border-slate-50">
                      <span className="font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                        {idx + 1}
                      </span>
                    </td>
                    
                    {visibleColumns.includes('id') && <td className="px-6 py-5 border-r border-slate-50 font-bold">{user.id}</td>}
                    
                    <td className="px-6 py-5 border-r border-slate-50">
                      <span className="font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {user.name}
                      </span>
                    </td>
                    <td className="px-6 py-5 border-r border-slate-50 text-slate-500 font-medium">
                      {user.email}
                    </td>
                    <td className="px-6 py-5 border-r border-slate-50 font-bold text-slate-600">
                      {user.role}
                    </td>
                    <td className="px-6 py-5 border-r border-slate-50 tabular-nums text-slate-500 font-semibold">
                      {user.mobile}
                    </td>
                    <td className="px-6 py-5 border-r border-slate-50 text-left">
                      <button className={`px-5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                        user.status === 'Active' ? 'bg-[#3b5998] text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {user.status}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2.5 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all shadow-sm border border-slate-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-10 py-6 bg-slate-100/30 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 mt-2 text-left">
               Showing <span className="text-slate-900 font-black">{filteredUsers.length}</span> Users in Directory
            </p>
          </div>
        </div>
      </div>

      {/* Choose Columns Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSettingsModalOpen(false)} />
          
          <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
                  {editingUser ? 'Edit User' : 'New User'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">User Profile Management</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option>Admin</option>
                    <option>Project Manager</option>
                    <option>Accountant</option>
                    <option>Vendor Manager</option>
                    <option>Super Admin</option>
                  </select>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile No</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 hover:translate-y-[-2px] transition-all active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbarThin::-webkit-scrollbar { height: 2px; }
        .custom-scrollbarThin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
