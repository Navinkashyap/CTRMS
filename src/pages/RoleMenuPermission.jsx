import React, { useState } from 'react';
import { 
  Save, 
  Lock, 
  CheckSquare, 
  Square, 
  Search, 
  Filter, 
  LayoutDashboard, 
  Database, 
  Globe, 
  Map, 
  MapPin, 
  Mic2, 
  Settings2, 
  Wrench, 
  Coins, 
  Languages, 
  Lightbulb, 
  Star,
  Layers,
  Clock,
  Tag,
  IdCard,
  ShieldCheck,
  UserCog,
  Zap,
  Menu,
  SlidersHorizontal,
  Link,
  Users,
  Store,
  FileCheck,
  ListTodo,
  CheckCircle2,
  Building2,
  Contact,
  Briefcase,
  Receipt,
  TrendingUp,
  LineChart
} from 'lucide-react';

const roles = [
  'Super Admin', 'Admin', 'Project Head', 'Accountant', 'Project Manager', 
  'Project Executive', 'Sales Head', 'Sales Manager', 'Sales Executive', 
  'Vendor Manager', 'Vendor'
];

const menus = [
  { name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { name: 'Master', icon: <Database className="w-4 h-4" /> },
  { name: 'Country', icon: <Globe className="w-4 h-4" />, indent: true },
  { name: 'State', icon: <Map className="w-4 h-4" />, indent: true },
  { name: 'District', icon: <Layers className="w-4 h-4" />, indent: true },
  { name: 'City', icon: <MapPin className="w-4 h-4" />, indent: true },
  { name: 'Mother Tongue', icon: <Mic2 className="w-4 h-4" />, indent: true },
  { name: 'Services', icon: <Settings2 className="w-4 h-4" />, indent: true },
  { name: 'Tool', icon: <Wrench className="w-4 h-4" />, indent: true },
  { name: 'Currency', icon: <Coins className="w-4 h-4" />, indent: true },
  { name: 'Language', icon: <Languages className="w-4 h-4" />, indent: true },
  { name: 'Specialization', icon: <Lightbulb className="w-4 h-4" />, indent: true },
  { name: 'Quality', icon: <Star className="w-4 h-4" />, indent: true },
  { name: 'Deadline', icon: <Clock className="w-4 h-4" />, indent: true },
  { name: 'Type', icon: <Tag className="w-4 h-4" />, indent: true },
  { name: 'Membership', icon: <IdCard className="w-4 h-4" />, indent: true },
  { name: 'Role', icon: <ShieldCheck className="w-4 h-4" /> },
  { name: 'Manage Role', icon: <UserCog className="w-4 h-4" />, indent: true },
  { name: 'Action', icon: <Zap className="w-4 h-4" />, indent: true },
  { name: 'Role Action Mapping', icon: <Link className="w-4 h-4" />, indent: true },
  { name: 'Menu', icon: <Menu className="w-4 h-4" /> },
  { name: 'Manage Menu', icon: <SlidersHorizontal className="w-4 h-4" />, indent: true },
  { name: 'Role Menu Permission', icon: <Lock className="w-4 h-4" />, indent: true },
  { name: 'Setting', icon: <Settings2 className="w-4 h-4" /> },
  { name: 'Assign Services', icon: <Link className="w-4 h-4" />, indent: true },
  { name: 'Manage Users', icon: <Users className="w-4 h-4" />, indent: true },
  { name: 'Vendor', icon: <Store className="w-4 h-4" /> },
  { name: 'Manage Vendors', icon: <Store className="w-4 h-4" />, indent: true },
  { name: 'Vendor Profile', icon: <UserCog className="w-4 h-4" />, indent: true },
  { name: 'Evaluation', icon: <FileCheck className="w-4 h-4" />, indent: true },
  { name: 'Available Tasks', icon: <ListTodo className="w-4 h-4" /> },
  { name: 'Assigned Tasks', icon: <CheckCircle2 className="w-4 h-4" /> },
  { name: 'Clients', icon: <Building2 className="w-4 h-4" /> },
  { name: 'Contacts', icon: <Contact className="w-4 h-4" /> },
  { name: 'Projects', icon: <Briefcase className="w-4 h-4" /> },
  { name: 'Invoice', icon: <Receipt className="w-4 h-4" /> },
  { name: 'Report', icon: <TrendingUp className="w-4 h-4" /> },
];

export default function RoleMenuPermission() {
  const [permissions, setPermissions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const togglePermission = (role, menuName, roleIndex) => {
    const key = `${role}-${menuName}-${roleIndex}`;
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleUpdate = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Logic for saving would go here
    }, 1500);
  };

  const filteredMenus = menus.filter(menu => 
    menu.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
              Role Menu Permission
            </h1>
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              Configure sidebar visibility and operational reach for each role.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search menus..."
                className="pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="button" className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Permission Matrix Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden relative border-t-4 border-t-indigo-600">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-[13px] border-collapse min-w-[1280px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] bg-slate-50/50 sticky left-0 z-20 w-[240px]">Menu Hierarchy</th>
                  {roles.map((role, idx) => (
                    <th key={`${role}-${idx}`} className="px-4 py-6 font-black text-slate-900 text-center whitespace-nowrap min-w-[110px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-tighter text-indigo-600 mb-1 leading-none">{role.split(' ')[0]}</span>
                        <span className="text-[12px] font-extrabold tracking-tight">{role}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMenus.map((menu, mIdx) => (
                  <tr key={menu.name} className="group hover:bg-indigo-50/20 transition-all duration-200">
                    <td className={`px-8 py-5 sticky left-0 z-10 bg-white/95 backdrop-blur-sm group-hover:bg-indigo-50/40 transition-colors border-r border-slate-50 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)] ${menu.indent ? 'pl-14' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-all shadow-sm ${menu.indent ? 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-indigo-600' : 'bg-indigo-600 text-white shadow-indigo-100'}`}>
                          {menu.icon}
                        </div>
                        <span className={`font-bold tracking-tight text-[14px] ${menu.indent ? 'text-slate-600 group-hover:text-indigo-700' : 'text-slate-900'}`}>{menu.name}</span>
                      </div>
                    </td>
                    {roles.map((role, rIdx) => {
                      const isChecked = permissions[`${role}-${menu.name}-${rIdx}`];
                      return (
                        <td key={`${role}-${rIdx}`} className={`px-4 py-5 text-center ${!menu.indent ? 'bg-amber-50/30 group-hover:bg-amber-100/40 transition-colors' : ''}`}>
                          <button 
                            type="button"
                            onClick={() => togglePermission(role, menu.name, rIdx)}
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ${
                              isChecked 
                              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                              : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-400'
                            }`}
                          >
                            {isChecked ? <CheckSquare className="w-5 h-5 fill-current" /> : <Square className="w-5 h-5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend Footer */}
          <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-indigo-600 shadow-sm" />
                  <span>Visible</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-200" />
                  <span>Hidden</span>
               </div>
               <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[9px] border border-amber-200">
                  <Database className="w-3 h-3" />
                  <span>Parent Module</span>
               </div>
            </div>
            <div className="text-[11px] font-bold text-slate-400 italic">
               Total: {menus.length} Menu Items • {roles.length} Roles Defined
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pr-4">
          <button 
            type="button"
            onClick={handleUpdate}
            disabled={isSaving}
            className={`flex items-center gap-3 px-10 py-4 rounded-3xl font-black text-[15px] shadow-2xl transition-all active:scale-95 ${
              isSaving 
              ? 'bg-slate-700 text-slate-300 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:translate-y-[-2px] hover:shadow-indigo-200/50'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-4 border-slate-400 border-t-white rounded-full animate-spin" />
                Updating Permissions...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Update Permissions
              </>
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
          border: 2px solid #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}