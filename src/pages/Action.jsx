import React, { useState, useMemo } from 'react';
import { Plus, SquarePen, X, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Zap, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const initialActionData = [
  { id: 1, action: 'Download Document', description: 'Allow to download documents only to mapped Role.', status: 'Active' },
  { id: 2, action: 'Preferred', description: 'Allow to update Preferred / Non Preffered', status: 'Active' },
  { id: 3, action: 'View Profile From Search', description: 'Allow to view profile from search', status: 'Active' },
  { id: 4, action: 'View Service From Search', description: 'Allow to view service from search', status: 'Active' },
  { id: 5, action: 'Translation Language Approve', description: 'Allow to approve translation language pair and rate detail in translation service', status: 'Active' },
  { id: 6, action: 'Translation Language Delete', description: 'Allow to delete translation language pair and rate detail in translation service', status: 'Active' },
  { id: 7, action: 'Translation Language Add More', description: 'Allow to Add More translation language pair and rate detail in translation service', status: 'Active' },
  { id: 8, action: 'Translation References Check', description: 'Allow to Check/Approve references detail in translation service', status: 'Active' },
];

export default function Action() {
  const [actions, setActions] = useState(initialActionData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [formData, setFormData] = useState({ action: '', description: '', status: 'Active' });
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction: direction || 'asc' });
  };

  // Filtering and sorting actions
  const filteredActions = useMemo(() => {
    let result = actions.filter(a =>
      a.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        const comp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: 'base' });
        return sortConfig.direction === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [actions, searchQuery, sortConfig]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddClick = () => {
    setEditingAction(null);
    setFormData({ action: '', description: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingAction(item);
    setFormData({
      action: item.action,
      description: item.description,
      status: item.status
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingAction) {
      setActions(actions.map(a => a.id === editingAction.id ? { ...a, ...formData } : a));
      showNotification(`Updated ${formData.action} successfully!`);
    } else {
      const newId = actions.length > 0 ? Math.max(...actions.map(a => a.id)) + 1 : 1;
      setActions([...actions, { id: newId, ...formData }]);
      showNotification(`Added ${formData.action} successfully!`);
    }
    setIsModalOpen(false);
  };

  const renderSortableHeader = (label, sortKey, extraClasses = '') => {
    const isSorted = sortConfig.key === sortKey;
    return (
      <th
        onClick={() => requestSort(sortKey)}
        className={`px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] cursor-pointer select-none group/th hover:text-blue-600 transition-colors ${extraClasses}`}
        title={`Sort by ${label}`}
      >
        <div className="inline-flex items-center gap-1.5">
          <span>{label}</span>
          <span className={`transition-all duration-200 ${isSorted ? 'text-blue-600' : 'text-slate-300 group-hover/th:text-slate-500'}`}>
            {isSorted ? (
              sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 opacity-60 group-hover/th:opacity-100" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* Modern Header Section (Sticky / Non-scrollable) */}
        <div className="sticky top-0 z-30 bg-[#fafbfc]/95 backdrop-blur-md py-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="space-y-1.5">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                Action List
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide flex items-center gap-3">
                System Operations & Permissions
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-semibold text-[10px] uppercase tracking-wider">
                  {filteredActions.length} TOTAL ACTIONS
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-xs"
                title="Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
              <button
                onClick={handleAddClick}
                className="group relative flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus className="relative w-4 h-4" />
                <span className="hidden sm:inline">Add Action</span>
              </button>
            </div>
          </div>
        </div>

        {/* Premium Table Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
          <div className="overflow-auto max-h-[calc(100vh-260px)] custom-scrollbar">
            <table className="w-full text-left text-[14px] border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-100 shadow-xs">
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-16 text-center">#</th>
                  {renderSortableHeader('Action', 'action', 'w-1/4')}
                  {renderSortableHeader('Description', 'description')}
                  {renderSortableHeader('Status', 'status', 'w-32')}
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-24 text-center text-slate-500/60">
                    <MoreHorizontal className="w-4 h-4 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredActions.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-blue-50/40 transition-all duration-300 ease-out cursor-default">
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Zap className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors tracking-tight">{item.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors line-clamp-2 max-w-md">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'} animate-pulse`} />
                        {item.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all outline-none"
                      >
                        <SquarePen className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtle Pagination Info */}
          <div className="px-8 py-5 flex items-center justify-between border-t border-slate-50 text-xs font-bold text-slate-600 tracking-wider uppercase">
            <span>Showing {filteredActions.length} of {actions.length} entries</span>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:text-slate-600 transition-colors disabled:opacity-30" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 hover:text-slate-600 transition-colors disabled:opacity-30" disabled>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Glassmorphism Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in-95 duration-400">
            <div className="relative px-8 py-8">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingAction ? 'Modify Action' : 'New System Action'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Define action scope and operational permissions.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Action Name</label>
                    <input
                      required autoFocus
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold placeholder:text-slate-300"
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                      placeholder="e.g. Download Invoice"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Description</label>
                    <textarea
                      required
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold placeholder:text-slate-300 min-h-[100px] resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the action's purpose..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Status</label>
                    <div className="relative">
                      <select
                        className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold appearance-none cursor-pointer"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl text-[15px] font-black transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                  >
                    {editingAction ? 'Save Changes' : 'Create Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modern Floating Notification */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="text-sm font-black tracking-wide uppercase">{notification}</span>
        </div>
      )}
    </div>
  );
}
