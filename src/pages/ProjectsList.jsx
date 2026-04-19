import React, { useState } from 'react';
import { 
  FolderGit2, 
  Search, 
  Settings, 
  Plus, 
  Edit3, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Shield,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  X,
  User,
  Clock,
  Briefcase
} from 'lucide-react';

const initialProjects = [
  { id: 1, projectName: 'Global Reach Website', client: 'Lionsbridge Technologies', service: 'Translation', deadline: '2026-05-15', status: 'In Progress', progress: 65, priority: 'High', manager: 'John Doe', budget: '$10,000' },
  { id: 2, projectName: 'Q2 Marketing Campaign', client: 'ADK Fortune', service: 'Localization', deadline: '2026-04-10', status: 'Completed', progress: 100, priority: 'Medium', manager: 'Jane Smith', budget: '$5,000' },
  { id: 3, projectName: 'Legal Contracts Review', client: 'Mayflower Services', service: 'Interpretation', deadline: '2026-06-20', status: 'On Hold', progress: 15, priority: 'High', manager: 'Mike Ross', budget: '$15,000' },
  { id: 4, projectName: 'App UI Translation', client: 'TechNova', service: 'Translation', deadline: '2026-08-01', status: 'Not Started', progress: 0, priority: 'Low', manager: 'Sarah Connor', budget: '$8,000' },
  { id: 5, projectName: 'User Manual Localization', client: 'Samsung Corp', service: 'DTP', deadline: '2026-05-30', status: 'In Progress', progress: 40, priority: 'Medium', manager: 'David Kim', budget: '$12,000' },
  { id: 6, projectName: 'Subtitling Promo Video', client: 'Netflix Asia', service: 'Subtitling', deadline: '2026-04-25', status: 'In Progress', progress: 80, priority: 'High', manager: 'Emily Chen', budget: '$7,500' },
];

const allColumns = [
  { id: 'projectName', label: 'Project Name' },
  { id: 'client', label: 'Client' },
  { id: 'service', label: 'Service' },
  { id: 'manager', label: 'Manager' },
  { id: 'budget', label: 'Budget' },
  { id: 'priority', label: 'Priority' },
  { id: 'deadline', label: 'Deadline' },
  { id: 'progress', label: 'Progress' },
  { id: 'status', label: 'Status' },
];

export default function ProjectsList() {
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // Default visible columns as per normal view
  const [visibleColumns, setVisibleColumns] = useState(['projectName', 'client', 'service', 'deadline', 'progress', 'status']);
  const [tempVisibleColumns, setTempVisibleColumns] = useState(visibleColumns);

  const [formData, setFormData] = useState({
    projectName: '',
    client: '',
    service: 'Translation',
    manager: '',
    budget: '',
    priority: 'Medium',
    deadline: '',
    progress: 0,
    status: 'Not Started'
  });

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({ ...project });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      projectName: '',
      client: '',
      service: 'Translation',
      manager: '',
      budget: '',
      priority: 'Medium',
      deadline: '',
      progress: 0,
      status: 'Not Started'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...formData, id: p.id } : p));
    } else {
      setProjects([...projects, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const toggleColumnSelection = (colId) => {
    setTempVisibleColumns(prev => 
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const applyColumnSettings = () => {
    setVisibleColumns(tempVisibleColumns);
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="font-sans text-slate-900 pb-10 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/60 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic">
              Projects List
            </h1>
            <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              Manage ongoing projects, monitor progress, and meet your deadlines.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 ml-auto md:ml-0">
            <div className="relative group w-full md:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects by name, client..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 ml-auto md:ml-0">
              <button 
                onClick={() => {
                  setTempVisibleColumns(visibleColumns);
                  setIsSettingsModalOpen(true);
                }}
                className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleAdd}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-2px] transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>
          </div>
        </div>

        {/* Project Table Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-2xl shadow-slate-200/60 overflow-hidden relative border-t-4 border-t-indigo-600">
          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-[13px] border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] w-16">S.No.</th>
                  {visibleColumns.includes('projectName') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Project Name</th>}
                  {visibleColumns.includes('client') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Client</th>}
                  {visibleColumns.includes('service') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Service</th>}
                  {visibleColumns.includes('manager') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Manager</th>}
                  {visibleColumns.includes('budget') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Budget</th>}
                  {visibleColumns.includes('priority') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Priority</th>}
                  {visibleColumns.includes('deadline') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Deadline</th>}
                  {visibleColumns.includes('progress') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] w-48">Progress</th>}
                  {visibleColumns.includes('status') && <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Status</th>}
                  <th className="px-6 py-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] text-center sticky right-0 bg-slate-50/50">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProjects.map((project, idx) => (
                  <tr key={project.id} className="group hover:bg-indigo-50/20 transition-all duration-200">
                    <td className="px-8 py-5">
                      <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                        {idx + 1}
                      </span>
                    </td>
                    
                    {visibleColumns.includes('projectName') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-[14px] bg-slate-100 flex items-center justify-center text-indigo-600 font-black shadow-inner border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <FolderGit2 className="w-5 h-5" />
                          </div>
                          <span className="font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">{project.projectName}</span>
                        </div>
                      </td>
                    )}
                    
                    {visibleColumns.includes('client') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-bold text-slate-700">{project.client}</span>
                        </div>
                      </td>
                    )}
                    
                    {visibleColumns.includes('service') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-500 font-bold">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          {project.service}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('manager') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-600 font-bold">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {project.manager || <span className="text-slate-300 italic font-medium">--</span>}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('budget') && (
                      <td className="px-6 py-5 font-mono font-bold text-emerald-600">
                        {project.budget || '--'}
                      </td>
                    )}

                    {visibleColumns.includes('priority') && (
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          project.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                          project.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-sky-50 text-sky-600 border-sky-100'
                        }`}>
                          {project.priority}
                        </span>
                      </td>
                    )}
                    
                    {visibleColumns.includes('deadline') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-500 font-bold tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {project.deadline}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('progress') && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 shadow-inner overflow-hidden border border-slate-200/50">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                project.progress === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                              }`} 
                              style={{ width: `${project.progress}%` }} 
                            />
                          </div>
                          <span className="text-[11px] font-black text-slate-500 w-8">{project.progress}%</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('status') && (
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-sm ${
                          project.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                          project.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          project.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            project.status === 'Completed' ? 'bg-emerald-500' : 
                            project.status === 'In Progress' ? 'bg-indigo-500 animate-pulse' :
                            project.status === 'On Hold' ? 'bg-amber-500' :
                            'bg-slate-400'
                          }`} />
                          {project.status}
                        </span>
                      </td>
                    )}

                    <td className="px-6 py-5 text-center sticky right-0 bg-white/95 backdrop-blur-sm group-hover:bg-indigo-50/40 transition-all border-l border-slate-50">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(project)}
                          className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all shadow-sm border border-slate-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm border border-slate-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Showing <span className="text-slate-900 font-black">{filteredProjects.length}</span> of <span className="text-slate-900 font-black">{projects.length}</span> Projects
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all disabled:opacity-30 cursor-not-allowed bg-white border border-slate-100 rounded-xl">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-lg shadow-indigo-100">1</button>
              <button className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 rounded-xl">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Choose Columns Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSettingsModalOpen(false)} />
          
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="bg-[#1a1c31] px-6 py-5 flex items-center justify-between">
              <h2 className="text-white text-lg font-bold tracking-tight italic uppercase">Choose Columns</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-0.5">
                {allColumns.map(col => (
                  <label key={col.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox"
                        className="peer h-6 w-6 appearance-none rounded-lg border-2 border-slate-200 checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer shadow-sm"
                        checked={tempVisibleColumns.includes(col.id)}
                        onChange={() => toggleColumnSelection(col.id)}
                      />
                      <CheckCircle2 className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-1" />
                    </div>
                    <span className="text-[14px] font-black text-slate-700 tracking-tight group-hover:text-slate-900">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-slate-100">
              <button 
                onClick={applyColumnSettings}
                className="w-full py-4 bg-[#3382c4] hover:bg-[#286ba3] hover:shadow-xl hover:translate-y-[-2px] text-white rounded-2xl font-black text-base transition-all active:scale-95 shadow-lg shadow-blue-500/20 uppercase tracking-widest"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
                  {editingProject ? 'Edit Project' : 'New Project'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Project Workflow Management</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Type</label>
                  <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option>Translation</option>
                    <option>Localization</option>
                    <option>Interpretation</option>
                    <option>Subtitling</option>
                    <option>DTP</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                  <input 
                    type="date"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                  <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Manager</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    placeholder="e.g. $10,000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Progress (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
                  <select 
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none"
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

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 hover:translate-y-[-2px] transition-all active:scale-95"
                >
                  Confirm Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .font-premium { font-family: 'Outfit', sans-serif; }
        .custom-scrollbarThin::-webkit-scrollbar { height: 2px; }
        .custom-scrollbarThin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
