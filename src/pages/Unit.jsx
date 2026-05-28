import React, { useState, useMemo, useEffect } from 'react';
import { Plus, SquarePen, X, Search, Layers } from 'lucide-react';
import { getUnits, createUnit, updateUnit } from '../lib/unitApi';

export default function Unit() {
  const [units, setUnits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      const data = await getUnits();
      setUnits(data);
    } catch (error) {
      console.error("Error fetching units:", error);
      showNotification("Failed to fetch units.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUnits = useMemo(() => {
    return units.filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [units, searchQuery]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddClick = () => {
    setEditingUnit(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (unit) => {
    setEditingUnit(unit);
    setFormData({ name: unit.name });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUnit) {
        await updateUnit(editingUnit._id, formData);
        showNotification(`Updated ${formData.name} successfully!`);
      } else {
        await createUnit(formData);
        showNotification(`Added ${formData.name} successfully!`);
      }
      fetchUnits();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving unit:", error);
      showNotification(error.response?.data?.message || "Failed to save unit.");
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1200px] mx-auto space-y-8">

        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
              Unit Master
            </h1>
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Manage operational units and measurement systems.
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-tighter">
                {filteredUnits.length} Units
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search units..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm placeholder:text-slate-600 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-[#1e293b] hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl transition-all shadow-md font-bold active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline uppercase tracking-widest text-xs">Add Unit</span>
            </button>
          </div>
        </div>

        {/* Premium Table Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-200/50 p-2 overflow-hidden">
          <div className="overflow-x-auto rounded-[1.5rem]">
            <table className="w-full text-left text-[14px] border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-16 text-center">#</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Unit Name</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-medium italic">Loading units...</td>
                  </tr>
                ) : filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-medium italic">No units found.</td>
                  </tr>
                ) : (
                  filteredUnits.map((unit, index) => (
                    <tr key={unit._id} className="group hover:bg-indigo-50/40 transition-all duration-300 ease-out cursor-default">
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-all border border-transparent group-hover:border-indigo-100 shadow-sm">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors tracking-tight">{unit.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleEditClick(unit)}
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
            <span>Showing {filteredUnits.length} of {units.length} entries</span>
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
                    {editingUnit ? 'Edit Unit' : 'New Unit'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium tracking-tight">Configure operational units.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-0 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Unit Name</label>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required autoFocus type="text"
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-[15px] font-bold shadow-inner"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Kilogram"
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-4 rounded-2xl text-[14px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] mt-4">
                  {editingUnit ? 'Save Changes' : 'Create Unit'}
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
