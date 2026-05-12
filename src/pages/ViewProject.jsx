import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Settings,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
  X,
  User,
  Trash2,
  Pencil,
  Building2,
  FolderGit2,
  MinusCircle,
  Menu
} from 'lucide-react';

export default function ViewProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const project = location.state?.project;

  const [activeTab, setActiveTab] = useState('Remark');

  const tabs = ['Project', 'Company', 'Translations', 'Remark'];

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <FolderGit2 className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Project Not Found</h2>
        <p className="text-slate-500 mb-6">Could not find project details for ID: {id}</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Project':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Project</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto py-4">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue="PT25260050"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all font-medium">
                    <option>TR</option>
                    <option>Translation</option>
                    <option>Localization</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Project Manager */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Project Manager <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all font-medium">
                    <option>Kavish Saxena</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Project Source */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">
                  Project Source
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="source" className="w-5 h-5 accent-indigo-600" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Inhouse</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="source" defaultChecked className="w-5 h-5 accent-indigo-600" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Outsource</span>
                  </label>
                </div>
              </div>

              {/* Project Type */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700">
                  Project Type
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="type" className="w-5 h-5 accent-indigo-600" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Extended</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="type" defaultChecked className="w-5 h-5 accent-indigo-600" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Non Extended</span>
                  </label>
                </div>
              </div>

              {/* Project Status */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Project Status
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all font-medium">
                    <option>On Hold</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Receiving Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Receiving Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    defaultValue="15/07/2025, 02:50 PM"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    defaultValue="16/07/2025, 12:00 AM"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Date of Delivery */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Date of Delivery <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    defaultValue="17/07/2025, 12:00 AM"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-50 max-w-4xl mx-auto w-full">
              <button className="px-8 py-3 bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold transition-all shadow-md active:scale-95">
                Update
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      case 'Translations':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Translations</h2>
            </div>

            <div className="space-y-6 max-w-full overflow-hidden">
              {/* Source Language */}
              <div className="flex items-center gap-6 max-w-md">
                <label className="block text-sm font-bold text-slate-700 w-32 shrink-0">
                  Source <span className="text-red-500">*</span>
                </label>
                <div className="relative flex-1">
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all font-medium text-sm">
                    <option>English</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Target Sections */}
              <div className="space-y-4">

                {/* Row 1 - Simple Target */}
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center gap-6">
                  <div className="flex-1 flex items-center gap-6">
                    <div className="flex items-center gap-4 w-1/3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0">Target <span className="text-red-500">*</span></label>
                      <div className="relative flex-1">
                        <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
                          <option>Hindi</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-1/2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0">Service</label>
                      <div className="relative flex-1">
                        <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-400">
                          <option>Select Service</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                    <MinusCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* Row 2 - Target with Task Details */}
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex-1 flex items-center gap-6">
                      <div className="flex items-center gap-4 w-1/3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0">Target <span className="text-red-500">*</span></label>
                        <div className="relative flex-1">
                          <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
                            <option>Hindi</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-1/2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0">Service</label>
                        <div className="relative flex-1">
                          <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-400">
                            <option>Select Service</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tasks Table */}
                  <div className="space-y-2 pl-4">
                    {[
                      { name: 'Translation', date1: 'dd/mm/yyyy', date2: 'dd/mm/yyyy', unit: 'Word', qty: '1000' },
                      { name: 'Editing', date1: '05/05/2026', date2: 'dd/mm/yyyy', unit: 'Word', qty: '1000' },
                      { name: 'Proofreading', date1: '07/05/2026', date2: '07/05/2026', unit: 'Hour', qty: '1' }
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-4 py-1">
                        <span className="w-24 text-[11px] font-black text-slate-500 uppercase tracking-widest">{task.name}</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="relative w-40">
                            <input type="text" defaultValue={task.date1} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
                            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                          </div>
                          <div className="relative w-40">
                            <input type="text" defaultValue={task.date2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
                            <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                          </div>
                          <div className="flex items-center gap-2">
                            <select className="px-2 py-2 border border-slate-200 rounded-lg text-xs font-medium w-20">
                              <option>{task.unit}</option>
                            </select>
                            <input type="text" defaultValue={task.qty} className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-xs text-center" />
                          </div>
                          <div className="relative flex-1">
                            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-400">
                              <option>Not Started</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 px-2">
                            <Menu className="w-4 h-4 text-slate-900 cursor-pointer" />
                            <div className="w-4 h-4 rounded-full bg-rose-50 flex items-center justify-center cursor-pointer group">
                              <X className="w-2.5 h-2.5 text-rose-500 group-hover:scale-110 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row 3 - Target with Single Task Detail */}
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="flex-1 flex items-center gap-6">
                      <div className="flex items-center gap-4 w-1/3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0">Target <span className="text-red-500">*</span></label>
                        <div className="relative flex-1">
                          <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
                            <option>Hindi</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-1/2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider w-16 shrink-0">Service</label>
                        <div className="relative flex-1">
                          <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-400">
                            <option>Select Service</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 pl-4">
                    <div className="flex items-center gap-4 py-1">
                      <span className="w-24 text-[11px] font-black text-slate-500 uppercase tracking-widest">Proofreading</span>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="relative w-40">
                          <input type="text" defaultValue="07/05/2026" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
                          <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                        </div>
                        <div className="relative w-40">
                          <input type="text" defaultValue="07/05/2026" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs" />
                          <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                        </div>
                        <div className="flex items-center gap-2">
                          <select className="px-2 py-2 border border-slate-200 rounded-lg text-xs font-medium w-20">
                            <option>Hour</option>
                          </select>
                          <input type="text" defaultValue="1" className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-xs text-center" />
                        </div>
                        <div className="relative flex-1">
                          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-400">
                            <option>Not Started</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 px-2">
                          <Menu className="w-4 h-4 text-slate-900 cursor-pointer" />
                          <div className="w-4 h-4 rounded-full bg-rose-50 flex items-center justify-center cursor-pointer group">
                            <X className="w-2.5 h-2.5 text-rose-500 group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Add Section */}
                <div className="flex items-center gap-6 max-w-md p-4">
                  <label className="block text-sm font-bold text-slate-700 w-32 shrink-0">
                    Target <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex-1">
                    <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all font-medium text-sm">
                      <option>Select Target Language</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-50 w-full">
              <button className="px-8 py-2.5 bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold transition-all shadow-md active:scale-95">
                Update
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      case 'Company':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Company</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto py-4">
              {/* Company Field */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Client <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={project.client}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              {/* Company's Client Field */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Client Contact <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all font-medium">
                    <option>{project.manager || 'Selvakumar R'}</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Client PO Field */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Client PO <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue="123"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              {/* Client Project Code Field */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">
                  Client Project Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue="abc"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-slate-50 max-w-4xl mx-auto w-full">
              <button className="px-8 py-3 bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold transition-all shadow-md active:scale-95">
                Update
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      case 'Remark':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-bold text-slate-800">Remark</h2>
            </div>

            <div className="max-w-4xl mx-auto py-4">
              <div className="space-y-2">
                <textarea
                  placeholder="Remark"
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-y"
                />
              </div>

              <div className="flex items-center gap-3 pt-8">
                <button className="px-8 py-2.5 bg-[#3f5d9a] hover:bg-[#344d7e] text-white rounded-lg font-bold transition-all shadow-md active:scale-95">
                  Update
                </button>
                <button
                  onClick={() => navigate('/projects')}
                  className="px-8 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-20 text-center animate-in fade-in duration-500">
            <h3 className="text-xl font-bold text-slate-400">Content for {activeTab} will appear here</h3>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Update Project (P00000{project.id})
          </h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-bold transition-all border-x border-t rounded-t-xl -mb-px shrink-0 ${activeTab === tab
                  ? 'bg-white border-slate-200 text-indigo-600 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {renderTabContent()}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
