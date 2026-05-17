import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  ArrowLeft, 
  FolderGit2, 
  ChevronRight,
  Briefcase,
  User,
  Calendar,
  Layers,
  Shield,
  TrendingUp
} from 'lucide-react';
import { getClients } from '../lib/clientApi';
import { getServices } from '../lib/serviceApi';
import { getContacts } from '../lib/contactApi';
import { createProject, updateProject } from '../lib/projectApi';

export default function AddProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingProject = location.state?.project || null;

  const [formData, setFormData] = useState({
    projectName: '',
    client: '',
    service: '',
    manager: '',
    budget: '',
    priority: 'Medium',
    deadline: '',
    progress: 0,
    status: 'Not Started'
  });

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, servicesRes, contactsRes] = await Promise.all([
          getClients(),
          getServices(),
          getContacts()
        ]);
        setClients(clientsRes);
        setServices(servicesRes);
        setContacts(contactsRes);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (editingProject) {
      setFormData({ 
        ...editingProject,
        client: editingProject.client?._id || editingProject.client || '',
        service: editingProject.service?._id || editingProject.service || '',
        manager: editingProject.manager?._id || editingProject.manager || '',
        deadline: editingProject.deadline ? new Date(editingProject.deadline).toISOString().split('T')[0] : ''
      });
    }
  }, [editingProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
        alert('Project updated successfully!');
      } else {
        await createProject(formData);
        alert('Project created successfully!');
      }
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project.');
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-20 animate-in fade-in duration-700 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => navigate('/projects')}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Briefcase className="w-3 h-3" />
                <span>Project Management</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-indigo-600">{editingProject ? 'Edit' : 'Create'}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
                {editingProject ? 'Modify Project' : 'Initiate Project'}
              </h1>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden relative border-t-4 border-t-indigo-600">
          <div className="p-10">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100">
                <FolderGit2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Project Details</h2>
                <p className="text-slate-500 text-sm font-medium">Fill in the essential information to track your project progress.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <FolderGit2 className="w-3 h-3" />
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter project name..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <Shield className="w-3 h-3" />
                    Client Name
                  </label>
                  <select
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm cursor-pointer"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  >
                    <option value="">Select a Client</option>
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <Layers className="w-3 h-3" />
                    Service Type
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm cursor-pointer"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option value="">Select Service</option>
                    {services.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <Calendar className="w-3 h-3" />
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <TrendingUp className="w-3 h-3" />
                    Priority Level
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm cursor-pointer"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <User className="w-3 h-3" />
                    Project Manager
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm cursor-pointer"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  >
                    <option value="">Select Manager</option>
                    {contacts.map(c => (
                      <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <span className="text-emerald-500">$</span>
                    Budget Allocation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $10,000"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <div className="w-3 h-3 rounded-full border-2 border-slate-400" />
                    Completion Progress (%)
                  </label>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 shadow-inner group-focus-within:bg-white transition-all group-focus-within:border-indigo-600">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      className="flex-1 accent-indigo-600 h-2"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                    />
                    <span className="w-12 text-center font-black text-indigo-600">{formData.progress}%</span>
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-slate-400" />
                    Operating Status
                  </label>
                  <select
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none shadow-sm cursor-pointer"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>On Hold</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-10 flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 hover:translate-y-[-2px] transition-all active:scale-95"
                >
                  {editingProject ? 'Update Project Details' : 'Confirm & Initialize Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-sans { font-family: 'Outfit', sans-serif; }
      `}</style>
    </div>
  );
}
