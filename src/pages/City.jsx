import React, { useState, useMemo } from 'react';
import { Plus, SquarePen, X, Search, Filter, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const cityData = [
  { id: 1, name: 'Port Blair', shortName: 'PBL', district: 'South Andaman', status: 'Active' },
  { id: 2, name: 'Anantapur City', shortName: 'ANT', district: 'Anantapur', status: 'Active' },
  { id: 3, name: 'Chittoor City', shortName: 'CHT', district: 'Chittoor', status: 'Active' },
  { id: 4, name: 'Cuddapah City', shortName: 'CDP', district: 'Cuddapah', status: 'Active' },
  { id: 5, name: 'Kakinada', shortName: 'KKD', district: 'East Godavari', status: 'Active' },
];

export default function City() {
  const [cities, setCities] = useState(cityData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({ name: '', shortName: '', district: 'South Andaman', status: 'Active' });
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = useMemo(() => {
    return cities.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cities, searchQuery]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddClick = () => {
    setEditingCity(null);
    setFormData({ name: '', shortName: '', district: 'South Andaman', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleEditClick = (city) => {
    setEditingCity(city);
    setFormData({ name: city.name, shortName: city.shortName, district: city.district, status: city.status });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingCity) {
      setCities(cities.map(c => c.id === editingCity.id ? { ...c, ...formData } : c));
      showNotification(`Updated ${formData.name} successfully!`);
    } else {
      const newId = cities.length > 0 ? Math.max(...cities.map(c => c.id)) + 1 : 1;
      setCities([...cities, { id: newId, ...formData }]);
      showNotification(`Added ${formData.name} successfully!`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1200px] mx-auto space-y-8">

        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              City List
            </h1>
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
              Urban Area Management & Locality Hubs
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">
                {filteredCities.length} Cities
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search cities..."
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
              <span className="hidden sm:inline">Add City</span>
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
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">City</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Short Name</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">District</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-32">Status</th>
                  <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-24 text-center">
                    <MoreHorizontal className="w-4 h-4 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCities.map((city, index) => (
                  <tr key={city.id} className="group hover:bg-blue-50/40 transition-all duration-300 ease-out cursor-default">
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-800 group-hover:text-blue-700 transition-colors tracking-tight">
                      {city.name}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 font-mono text-[12px] font-bold border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all uppercase">
                        {city.shortName}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-600">
                      {city.district}
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${city.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${city.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'} animate-pulse`} />
                        {city.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleEditClick(city)}
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
            <span>Showing {filteredCities.length} of {cities.length} entries</span>
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
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in-95 duration-400">
            <div className="relative px-8 py-8">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingCity ? 'Edit City' : 'Add New City'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Link cities to their respective districts.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">City Name</label>
                    <input
                      required autoFocus type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold"
                      value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Pune City"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 text-slate-600 uppercase tracking-widest text-[11px] font-black">Short Name</div>
                    <div className="space-y-2 text-slate-600 uppercase tracking-widest text-[11px] font-black">Status</div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <input
                      required type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold"
                      value={formData.shortName} onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      placeholder="PNE"
                    />
                    <select
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold appearance-none cursor-pointer"
                      value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Parent District</label>
                    <div className="relative">
                      <select
                        className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold appearance-none cursor-pointer"
                        value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      >
                        <option value="South Andaman">South Andaman</option>
                        <option value="Anantapur">Anantapur</option>
                        <option value="Chittoor">Chittoor</option>
                        <option value="Cuddapah">Cuddapah</option>
                        <option value="East Godavari">East Godavari</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl text-[15px] font-black transition-all shadow-lg active:scale-[0.98]">
                  {editingCity ? 'Save Changes' : 'Create City'}
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
