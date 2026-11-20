import React, { useState, useMemo, useEffect } from 'react';
import { Plus, SquarePen, Trash2, X, Search, Briefcase, ArrowUpDown, ArrowUp, ArrowDown, Save, Check } from 'lucide-react';
import { getDesignations, createDesignation, updateDesignation, deleteDesignation } from '../lib/designationApi';

export default function Designation() {
  const [designations, setDesignations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'Active' });
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      setIsLoading(true);
      const data = await getDesignations();
      setDesignations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching designations:", error);
      showNotification("Failed to fetch designations.");
    } finally {
      setIsLoading(false);
    }
  };

  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return { key: null, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredDesignations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = designations.filter((d) =>
      (d.name || '').toLowerCase().includes(query) ||
      (d.description || '').toLowerCase().includes(query)
    );

    if (!sortConfig.key) return result;

    return [...result].sort((a, b) => {
      const aVal = (a[sortConfig.key] ?? '').toString().trim();
      const bVal = (b[sortConfig.key] ?? '').toString().trim();
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [designations, searchQuery, sortConfig]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddClick = () => {
    setEditingDesignation(null);
    setFormData({ name: '', description: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleEditClick = (desig) => {
    setEditingDesignation(desig);
    setFormData({
      name: desig.name || '',
      description: desig.description || '',
      status: desig.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (desig) => {
    if (!window.confirm(`Are you sure you want to delete "${desig.name}"?`)) return;
    try {
      await deleteDesignation(desig._id);
      showNotification(`Deleted "${desig.name}" successfully!`);
      fetchDesignations();
    } catch (error) {
      console.error("Error deleting designation:", error);
      showNotification("Failed to delete designation.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification("Please enter a designation name.");
      return;
    }

    try {
      setIsSaving(true);
      if (editingDesignation) {
        await updateDesignation(editingDesignation._id, formData);
        showNotification(`Updated "${formData.name}" successfully!`);
      } else {
        await createDesignation(formData);
        showNotification(`Created "${formData.name}" successfully!`);
      }
      await fetchDesignations();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving designation:", error);
      showNotification(error.response?.data?.message || "Failed to save designation.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8 animate-in fade-in duration-700">
      
      {/* Toast Notification (styled like PayDuration.jsx) */}
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-2 animate-in fade-in duration-200 z-[9999]">
          <Check className="w-4 h-4 text-white" />
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* Modern Header Section (Sticky / Non-scrollable) */}
        <div className="sticky top-0 z-30 bg-[#fafbfc]/95 backdrop-blur-md py-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="space-y-1.5">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                Designation Master
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Manage corporate designations and job titles in Admin Master
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold text-[10px] uppercase tracking-wider">
                  {filteredDesignations.length} DESIGNATIONS
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search designations..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleAddClick}
                className="group relative flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus className="relative w-4 h-4" />
                <span className="relative">Add Designation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Premium Table Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
          <div className="overflow-auto max-h-[calc(100vh-260px)] custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-100 shadow-xs">
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 font-black text-slate-700 uppercase tracking-wider text-[11px] w-16 text-center">
                    #
                  </th>
                  <th className="px-6 py-4 border-l border-slate-100">
                    <button
                      type="button"
                      onClick={() => requestSort('name')}
                      className="inline-flex items-center gap-2 text-left font-black text-slate-700 hover:text-indigo-600 uppercase tracking-wider text-[11px] border-none bg-transparent cursor-pointer p-0"
                    >
                      <span>Designation Name</span>
                      {sortConfig.key === 'name' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 border-l border-slate-100 font-black text-slate-700 uppercase tracking-wider text-[11px]">
                    Description
                  </th>
                  <th className="px-6 py-4 border-l border-slate-100 font-black text-slate-700 uppercase tracking-wider text-[11px] w-28 text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 border-l border-slate-100 font-black text-slate-700 uppercase tracking-wider text-[11px] w-28 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center text-slate-400 font-medium italic">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading designations...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredDesignations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center text-slate-400 font-medium italic">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="m-0">No designations found.</p>
                      <button
                        type="button"
                        onClick={handleAddClick}
                        className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline border-none bg-transparent cursor-pointer"
                      >
                        + Create your first designation
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredDesignations.map((desig, index) => (
                    <tr key={desig._id} className="hover:bg-indigo-50/20 transition-all duration-150 group">
                      <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 border-l border-slate-50 font-bold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black shrink-0">
                            {desig.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {desig.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-l border-slate-50 text-slate-500 text-xs font-medium">
                        {desig.description || <span className="text-slate-300 italic">No description provided</span>}
                      </td>
                      <td className="px-6 py-4 border-l border-slate-50 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          desig.status === 'Inactive'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {desig.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-l border-slate-50 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditClick(desig)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border-none bg-transparent cursor-pointer"
                            title="Edit Designation"
                          >
                            <SquarePen className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(desig)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border-none bg-transparent cursor-pointer"
                            title="Delete Designation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing {filteredDesignations.length} of {designations.length} entries</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-indigo-600 hover:text-indigo-800 font-bold border-none bg-transparent cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── Add / Edit Designation Modal (Exact structure from Reference Image with Portal Theme) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-[500px] bg-white/95 backdrop-blur-xl rounded-[32px] p-8 sm:p-10 border border-slate-200/90 shadow-2xl shadow-slate-200/80 animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors border-none cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: Title & Subtitle from Reference Image */}
            <div className="space-y-1 mb-8 pr-6">
              <h2 className="text-2xl sm:text-[26px] font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent m-0">
                {editingDesignation ? 'Edit Designation' : 'Add Designation'}
              </h2>
              <p className="text-slate-500 text-sm font-medium m-0 mt-1">
                Create a new designation in Admin Master.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Field 1: Designation Name * */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">
                  Designation Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Developer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {/* Field 2: Description (Optional) */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">
                  Description <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Enter designation description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all shadow-xs resize-none"
                />
              </div>

              {/* Save Designation Button (Icon + Text as in Reference Image) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-sm font-bold shadow-lg shadow-slate-900/15 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-none"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Designation'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

