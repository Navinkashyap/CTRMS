import React, { useState, useMemo, useEffect } from 'react';
import { Plus, SquarePen, X, Search, Building2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getDepartments, createDepartment, updateDepartment } from '../lib/departmentApi';

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: '', shortName: '', status: 'Active' });
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      showNotification("Failed to fetch departments.");
    } finally {
      setIsLoading(false);
    }
  };

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return { key: null, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = departments.filter(d =>
      (d.name || '').toLowerCase().includes(query)
    );

    if (!sortConfig.key) return result;

    return [...result].sort((a, b) => {
      const aVal = (a[sortConfig.key] ?? '').toString().trim();
      const bVal = (b[sortConfig.key] ?? '').toString().trim();
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [departments, searchQuery, sortConfig]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddClick = () => {
    setEditingDepartment(null);
    setFormData({ name: '', shortName: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleEditClick = (dept) => {
    setEditingDepartment(dept);
    setFormData({ name: dept.name });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await updateDepartment(editingDepartment._id, formData);
        showNotification(`Updated ${formData.name} successfully!`);
      } else {
        await createDepartment(formData);
        showNotification(`Added ${formData.name} successfully!`);
      }
      fetchDepartments();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving department:", error);
      showNotification(error.response?.data?.message || "Failed to save department.");
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
                Department Master
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide flex items-center gap-3">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Manage corporate departments and organizational structure
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold text-[10px] uppercase tracking-wider">
                  {filteredDepartments.length} DEPARTMENTS
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={handleAddClick}
                className="group relative flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus className="relative w-4 h-4" />
                <span className="relative">Add Department</span>
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
                    const isSorted = sortConfig.key === 'name';
                    return (
                      <th
                        onClick={() => requestSort('name')}
                        className={`px-6 py-5 font-bold uppercase tracking-widest text-[11px] cursor-pointer select-none group/th transition-all ${
                          isSorted ? 'text-indigo-600 bg-indigo-50/40' : 'text-slate-500 hover:text-indigo-600'
                        }`}
                        title={`Sort by Department Name (${
                          isSorted
                            ? sortConfig.direction === 'asc'
                              ? 'Ascending - click for Descending'
                              : 'Descending - click to clear'
                            : 'Click to sort'
                        })`}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <span>Department Name</span>
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 opacity-60 group-hover/th:opacity-100 group-hover/th:text-slate-400 transition-all shrink-0" />
                          )}
                        </div>
                      </th>
                    );
                  })()}
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-medium italic">Loading departments...</td>
                  </tr>
                ) : filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-medium italic">No departments found.</td>
                  </tr>
                ) : (
                  filteredDepartments.map((dept, index) => (
                    <tr key={dept._id} className="group hover:bg-indigo-50/40 transition-all duration-300 ease-out cursor-default">
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-all border border-transparent group-hover:border-indigo-100 shadow-sm">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors tracking-tight">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleEditClick(dept)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white hover:scale-105 transition-all shadow-sm font-bold text-xs mx-auto"
                        >
                          <SquarePen className="w-4 h-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-5 flex items-center justify-between border-t border-slate-50 text-xs font-bold text-slate-600 tracking-wider uppercase">
            <span>Showing {filteredDepartments.length} of {departments.length} entries</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in-95 duration-400">
            <div className="relative px-8 py-8">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
                    {editingDepartment ? 'Edit Department' : 'New Department'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium tracking-tight">Configure organizational departments.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-0 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Department Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required autoFocus type="text"
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-[15px] font-bold shadow-inner"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Information Technology"
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-2xl text-[14px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] mt-4">
                  {editingDepartment ? 'Save Changes' : 'Create Department'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="text-sm font-black tracking-wide uppercase">{notification}</span>
        </div>
      )}
    </div>
  );
}
