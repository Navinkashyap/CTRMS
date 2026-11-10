import React, { useState, useEffect } from 'react'
import { User, Phone, Mail, Lock, Plus, ShieldCheck, SquarePen, Trash2, MoreHorizontal, Globe } from 'lucide-react'
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../lib/adminApi'
import { getCurrentUser } from '../lib/authApi'

const emptyForm = { name: '', phone: '', email: '', password: '' };

export default function AddAdmin() {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    const [notification, setNotification] = useState(null);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const currentUserId = getCurrentUser()?.id;

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                setAdmins(await getAdmins());
            } catch (error) {
                console.error('Error fetching admins:', error);
                showNotification(error.response?.data?.message || 'Failed to fetch admins.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { name: formData.name, email: formData.email, phone: formData.phone };
        // Password is required for a new admin; on edit it is only changed when filled in.
        if (formData.password) payload.password = formData.password;
        try {
            setIsSaving(true);
            if (editingAdmin) {
                const updated = await updateAdmin(editingAdmin._id, payload);
                setAdmins(prev => prev.map(a => a._id === updated._id ? updated : a));
                showNotification(`Admin ${updated.name} updated successfully!`);
                setEditingAdmin(null);
            } else {
                const created = await createAdmin(payload);
                setAdmins(prev => [created, ...prev]);
                showNotification(`Admin ${created.name} added successfully!`);
            }
            setFormData(emptyForm);
        } catch (error) {
            console.error('Error saving admin:', error);
            showNotification(error.response?.data?.message || 'Failed to save admin.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setFormData({ name: admin.name || '', phone: admin.phone || '', email: admin.email || '', password: '' });
    };

    const handleDelete = async (admin) => {
        if (!window.confirm(`Delete admin ${admin.name}? They will no longer be able to log in.`)) return;
        try {
            await deleteAdmin(admin._id);
            setAdmins(prev => prev.filter(a => a._id !== admin._id));
            if (editingAdmin?._id === admin._id) {
                setEditingAdmin(null);
                setFormData(emptyForm);
            }
            showNotification('Admin removed successfully!');
        } catch (error) {
            console.error('Error deleting admin:', error);
            showNotification(error.response?.data?.message || 'Failed to delete admin.');
        }
    };

    return (
        <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
            <div className="max-w-[1200px] mx-auto space-y-8">

                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                            Administrator Management
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
                            Add and manage system administrators with full access.
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-tighter">
                                {admins.length} Admins
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Add Admin Form Card (Left Column) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck size={80} className="text-slate-900" />
                            </div>

                            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                                <h2 className="text-xl font-black text-slate-800 tracking-tight mb-4">
                                    {editingAdmin ? 'Edit Administrator' : 'Add New Admin'}
                                </h2>

                                <div className="space-y-4">
                                    <div className="space-y-2 group">
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                required type="text" name="name"
                                                value={formData.name} onChange={handleChange}
                                                placeholder="Enter admin name"
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                required type="email" name="email"
                                                value={formData.email} onChange={handleChange}
                                                placeholder="admin@example.com"
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                required type="tel" name="phone"
                                                value={formData.phone} onChange={handleChange}
                                                placeholder="+91 00000 00000"
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1">
                                            {editingAdmin ? 'New Password (optional)' : 'Password'}
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                required={!editingAdmin} minLength={6} type="password" name="password"
                                                value={formData.password} onChange={handleChange}
                                                autoComplete="new-password"
                                                placeholder={editingAdmin ? 'Leave blank to keep current' : 'Min 6 characters'}
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-[15px] font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={isSaving} className="disabled:opacity-60 w-full bg-gradient-to-r from-slate-900 to-indigo-900 hover:from-slate-800 hover:to-indigo-800 text-white py-4 rounded-2xl text-[15px] font-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group">
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                    {isSaving ? 'Saving...' : editingAdmin ? 'Update Settings' : 'Create Account'}
                                </button>
                                {editingAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingAdmin(null); setFormData(emptyForm); }}
                                        className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-600 transition-colors"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Admin List Table (Right Column) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-2 overflow-hidden">
                            <div className="overflow-x-auto rounded-[2rem]">
                                <table className="w-full text-left text-[14px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100/60">
                                            <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-12 text-center">#</th>
                                            <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Administrator</th>
                                            <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Contact</th>
                                            <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px]">Status</th>
                                            <th className="px-6 py-5 font-bold text-slate-500 uppercase tracking-widest text-[11px] w-24 text-center">
                                                <MoreHorizontal className="w-4 h-4 mx-auto" />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {isLoading && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium italic">Loading admins...</td>
                                            </tr>
                                        )}
                                        {!isLoading && admins.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium italic">No admins found.</td>
                                            </tr>
                                        )}
                                        {!isLoading && admins.map((admin, index) => (
                                            <tr key={admin._id} className="group hover:bg-indigo-50/40 transition-all duration-300 ease-out cursor-default">
                                                <td className="px-6 py-5 text-center">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                        {index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-white group-hover:text-indigo-600 transition-all border border-transparent group-hover:border-indigo-100 shadow-sm">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors tracking-tight text-base">{admin.name}</span>
                                                            <span className="text-xs text-slate-600 font-medium tracking-wide flex items-center gap-1">
                                                                <Mail size={10} className="inline" /> {admin.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 font-mono text-[11px] font-bold border border-slate-100 group-hover:border-indigo-200 group-hover:bg-white transition-all">
                                                        {admin.phone}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${admin.status === 'Active'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                                                            : 'bg-slate-50 text-slate-500 border-slate-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'} animate-pulse`} />
                                                        {admin.status}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(admin)}
                                                            className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm active:scale-90 transition-all outline-none border border-transparent hover:border-indigo-100"
                                                        >
                                                            <SquarePen className="w-4 h-4" />
                                                        </button>
                                                        {String(admin._id) !== String(currentUserId) && (
                                                        <button
                                                            onClick={() => handleDelete(admin)}
                                                            className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-slate-600 hover:text-red-500 hover:bg-white hover:shadow-sm active:scale-90 transition-all outline-none border border-transparent hover:border-red-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
                    <span className="text-sm font-black tracking-wide uppercase">{notification}</span>
                </div>
            )}
        </div>
    )
}