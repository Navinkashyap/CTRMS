import React, { useState } from 'react';
import { Save, ShieldCheck, CheckSquare, Square, Search, Filter, Info, FileDown, Star, UserSearch, Layers, CheckCircle, Trash2, PlusCircle, ClipboardCheck, Send, UserCog, Store, Eye } from 'lucide-react';

const roles = [
    'Super Admin', 'Admin', 'Project Head', 'Accountant', 'Project Manager',
    'Project Executive', 'Sales Head', 'Sales Manager', 'Sales Executive',
    'Vendor Manager', 'Vendor'
];

const actions = [
    { name: 'Download Document', icon: <FileDown className="w-4 h-4" /> },
    { name: 'Preferred', icon: <Star className="w-4 h-4" /> },
    { name: 'View Profile From Search', icon: <UserSearch className="w-4 h-4" /> },
    { name: 'View Service From Search', icon: <Layers className="w-4 h-4" /> },
    { name: 'Translation Language Approve', icon: <CheckCircle className="w-4 h-4" /> },
    { name: 'Translation Language Delete', icon: <Trash2 className="w-4 h-4" /> },
    { name: 'Translation Language Add More', icon: <PlusCircle className="w-4 h-4" /> },
    { name: 'Translation References Check', icon: <ClipboardCheck className="w-4 h-4" /> },
    { name: 'Translation references Delete', icon: <Trash2 className="w-4 h-4" /> },
    { name: 'Translation References Add More', icon: <PlusCircle className="w-4 h-4" /> },
    { name: 'Translation Submit', icon: <Send className="w-4 h-4" /> },
    { name: 'Profile Edit', icon: <UserCog className="w-4 h-4" /> },
    { name: 'Vendor Profile Edit', icon: <Store className="w-4 h-4" /> },
    { name: 'View Vendor Profile From User List', icon: <Eye className="w-4 h-4" /> }
];

export default function RoleAction() {
    const [permissions, setPermissions] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const togglePermission = (role, action) => {
        const key = `${role}-${action}`;
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

    const filteredActions = actions.filter(action =>
        action.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
            <div className="max-w-[1200px] mx-auto space-y-8">

                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
                            Role Action Permission
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            Manage access control matrix for all system roles.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search actions..."
                                className="pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Permission Matrix Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden relative border-t-4 border-t-blue-600">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-[13px] border-collapse min-w-[1200px]">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
                                    <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] bg-slate-50/50 sticky left-0 z-20 w-[280px]">Action</th>
                                    {roles.map(role => (
                                        <th key={role} className="px-4 py-6 font-black text-slate-900 text-center whitespace-nowrap min-w-[120px]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[11px] uppercase tracking-tighter text-blue-600 mb-1">{role.split(' ')[0]}</span>
                                                <span className="text-[13px] font-extrabold">{role}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredActions.map((action, idx) => (
                                    <tr key={action.name} className="group hover:bg-blue-50/30 transition-all duration-200">
                                        <td className="px-8 py-5 sticky left-0 z-10 bg-white/90 backdrop-blur-sm group-hover:bg-blue-50/50 transition-colors border-r border-slate-50 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                    {action.icon}
                                                </div>
                                                <span className="font-bold text-slate-700 tracking-tight text-[14px]">{action.name}</span>
                                            </div>
                                        </td>
                                        {roles.map(role => {
                                            const isChecked = permissions[`${role}-${action.name}`];
                                            return (
                                                <td key={role} className="px-4 py-5 text-center">
                                                    <button
                                                        onClick={() => togglePermission(role, action.name)}
                                                        className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${isChecked
                                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
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

                    {/* Footer Info */}
                    <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-none">
                            <Info className="w-4 h-4 text-blue-400 fill-blue-50" />
                            Click squares to toggle individual permissions for each role.
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-blue-600" />
                                <span>Permitted</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-slate-200" />
                                <span>Restricted</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Button */}
                <div className="fixed bottom-10 right-10 z-[50] group">
                    <button
                        onClick={handleUpdate}
                        disabled={isSaving}
                        className={`flex items-center gap-3 px-8 py-5 rounded-[2.5rem] font-black text-[15px] shadow-2xl transition-all active:scale-95 ${isSaving
                                ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:translate-y-[-4px] hover:shadow-blue-200/50'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-4 border-slate-400 border-t-white rounded-full animate-spin" />
                                Updating...
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
