import React, { useState, useMemo, useEffect } from 'react';
import { Plus, SquarePen, X, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getStates, createState, updateState, deleteState } from '../lib/stateApi';
import { getCountries } from '../lib/countryApi';

export default function State() {
  const [states, setStates] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [formData, setFormData] = useState({ name: '', shortName: '', country: 'India', status: 'Active' });
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statesData, countriesData] = await Promise.all([
        getStates(),
        getCountries()
      ]);
      setStates(statesData);
      setCountriesList(countriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  };

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return { key: null, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Filtering and sorting states
  const filteredStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = states.filter(s =>
      (s.name || '').toLowerCase().includes(query) ||
      (s.shortName || '').toLowerCase().includes(query) ||
      (s.country || '').toLowerCase().includes(query)
    );

    if (!sortConfig.key) return result;

    return [...result].sort((a, b) => {
      const aVal = (a[sortConfig.key] ?? '').toString().trim();
      const bVal = (b[sortConfig.key] ?? '').toString().trim();
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [states, searchQuery, sortConfig]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddClick = () => {
    setEditingState(null);
    setFormData({ name: '', shortName: '', country: countriesList[0]?.name || 'India', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleEditClick = (state) => {
    setEditingState(state);
    setFormData({ name: state.name, shortName: state.shortName, country: state.country, status: state.status });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingState) {
        await updateState(editingState._id, formData);
        showNotification(`Updated ${formData.name} successfully!`);
      } else {
        await createState(formData);
        showNotification(`Added ${formData.name} successfully!`);
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving state:", error);
      showNotification("Failed to save state.");
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* Modern Header Section (Sticky / Non-scrollable) */}
        <div className="sticky top-0 z-30 bg-[#fafbfc]/95 backdrop-blur-md py-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="space-y-1.5">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                State Directory
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide flex items-center gap-3">
                Management & Regional Configurations
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-semibold text-[10px] uppercase tracking-wider">
                  {filteredStates.length} REGIONS
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search states..."
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
                <span className="relative">Add State</span>
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
                  {(() => {
                    const renderSortableHeader = (key, label, className = '') => {
                      const isSorted = sortConfig.key === key;
                      return (
                        <th
                          key={key}
                          onClick={() => requestSort(key)}
                          className={`px-6 py-5 font-bold uppercase tracking-widest text-[11px] cursor-pointer select-none group/th transition-all ${
                            isSorted ? 'text-blue-600 bg-blue-50/40' : 'text-slate-500 hover:text-blue-600'
                          } ${className}`}
                          title={`Sort by ${label} (${
                            isSorted
                              ? sortConfig.direction === 'asc'
                                ? 'Ascending - click for Descending'
                                : 'Descending - click to clear'
                              : 'Click to sort'
                          })`}
                        >
                          <div className="inline-flex items-center gap-1.5">
                            <span>{label}</span>
                            {isSorted ? (
                              sortConfig.direction === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 opacity-60 group-hover/th:opacity-100 group-hover/th:text-slate-400 transition-all shrink-0" />
                            )}
                          </div>
                        </th>
                      );
                    };

                    return [
                      renderSortableHeader('name', 'State Name'),
                      renderSortableHeader('shortName', 'Short Name'),
                      renderSortableHeader('country', 'Country'),
                      renderSortableHeader('status', 'Status', 'w-32'),
                    ];
                  })()}
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-24 text-center text-slate-500/60">
                    <MoreHorizontal className="w-4 h-4 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStates.map((state, index) => (
                  <tr key={state._id} className="group hover:bg-blue-50/40 transition-all duration-300 ease-out cursor-default">
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors tracking-tight">{state.name}</span>
                        <span className="text-[11px] text-slate-600 font-semibold group-hover:text-blue-400 uppercase tracking-tighter">Region ID: {state.id * 8243}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 font-mono text-[12px] font-bold border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all uppercase">
                        {state.shortName}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-600">
                      {state.country}
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${state.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${state.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'} animate-pulse`} />
                        {state.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleEditClick(state)}
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
            <span>Showing {filteredStates.length} of {states.length} entries</span>
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
                    {editingState ? 'Modify State' : 'New Region'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Configure regional parameters accurately.</p>
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
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Full State Name</label>
                    <input
                      required autoFocus
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold placeholder:text-slate-300"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Maharashtra"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Short Code</label>
                      <input
                        required type="text"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold font-mono placeholder:text-slate-300 uppercase"
                        value={formData.shortName}
                        onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                        placeholder="MH"
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Select Status</label>
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

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Primary Country</label>
                    <div className="relative">
                      <select
                        className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold appearance-none cursor-pointer"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      >
                        {countriesList.map(country => (
                          <option key={country._id} value={country.name}>{country.name}</option>
                        ))}
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
                    {editingState ? 'Save Changes' : 'Create Record'}
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