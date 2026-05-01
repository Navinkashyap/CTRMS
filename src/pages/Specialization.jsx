import React, { useState, useMemo, useEffect } from 'react';
import { Plus, SquarePen, X, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { getSpecializations, createSpecialization, updateSpecialization, deleteSpecialization } from '../lib/specializationApi';

export default function Specialization() {
  const [specializations, setSpecializations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialization, setEditingSpecialization] = useState(null);
  const [formData, setFormData] = useState({ name: '', parent: 'Root', status: 'Active' });
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      setIsLoading(true);
      const data = await getSpecializations();
      setSpecializations(data);
    } catch (error) {
      console.error("Error fetching specializations:", error);
      showNotification("Failed to fetch specializations.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSpecializations = useMemo(() => {
    return specializations.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parent.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [specializations, searchQuery]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddClick = () => {
    setEditingSpecialization(null);
    setFormData({ name: '', parent: 'Root', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleEditClick = (spec) => {
    setEditingSpecialization(spec);
    setFormData({ name: spec.name, parent: spec.parent, status: spec.status });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingSpecialization) {
        await updateSpecialization(editingSpecialization._id, formData);
        showNotification(`Updated ${formData.name} successfully!`);
      } else {
        await createSpecialization(formData);
        showNotification(`Added ${formData.name} successfully!`);
      }
      fetchSpecializations();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving specialization:", error);
      showNotification("Failed to save specialization.");
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1200px] mx-auto space-y-8">

        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Specialization List
            </h1>
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
              Expertise Categories & Hierarchy
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">
                {filteredSpecializations.length} Specializations
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search specialization..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm placeholder:text-slate-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="inline-flex items-center justify-center w-11 h-11 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl transition-all shadow-md font-bold active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Specialization</span>
            </button>
          </div>
        </div>

        {/* Premium Table Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-200/50 p-2 overflow-hidden">
          <div className="overflow-x-auto rounded-[1.5rem]">
            <table className="w-full text-left text-[14px] border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-16 text-center">#</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Specialization</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Parent Specialization</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-32">Status</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-24 text-center">
                    <MoreHorizontal className="w-4 h-4 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSpecializations.map((spec, index) => (
                  <tr key={spec._id} className="group hover:bg-blue-50/40 transition-all duration-300 ease-out cursor-default">
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100 shadow-sm">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors tracking-tight">{spec.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 font-medium text-[12px] border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all uppercase tracking-tight">
                        {spec.parent}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${spec.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${spec.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                        {spec.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleEditClick(spec)}
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
          <div className="px-8 py-5 flex items-center justify-between border-t border-slate-50 text-xs font-bold text-slate-600 tracking-wider uppercase">
            <span>Showing {filteredSpecializations.length} of {specializations.length} entries</span>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:text-slate-600 transition-colors disabled:opacity-30" disabled><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-2 hover:text-slate-600 transition-colors disabled:opacity-30" disabled><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 animate-in zoom-in-95 duration-400">
            <div className="relative px-8 py-8">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingSpecialization ? 'Edit Category' : 'Add Category'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Define expertise hierarchy.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Specialization Name</label>
                    <input
                      required autoFocus type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold"
                      value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Legal"
                    />
                  </div>

                  <div className="space-y-2 font-black text-slate-600 uppercase tracking-widest text-[11px]">
                    <label className="pl-1">Parent Specialization</label>
                    <select
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold appearance-none cursor-pointer"
                      value={formData.parent} onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    >
                      <option value="NA">NA</option>
                      <option value="Root">Root</option>
                      {specializations.map(spec => (
                        <option key={spec._id} value={spec.name}>{spec.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 font-black text-slate-600 uppercase tracking-widest text-[11px]">
                    <label className="pl-1">Select Status</label>
                    <select
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold appearance-none cursor-pointer"
                      value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl text-[15px] font-black transition-all shadow-lg active:scale-[0.98]">
                  {editingSpecialization ? 'Save Changes' : 'Create Specialization'}
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
