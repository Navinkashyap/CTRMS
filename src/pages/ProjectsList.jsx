import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Search,
  Settings,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
  X,
  User,
  Trash2,
  Pencil,
  Building2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { getProjects, deleteProject, updateProject, getProject } from '../lib/projectApi';
import { getContacts } from '../lib/contactApi';
import { getClients } from '../lib/clientApi';
import { getServices } from '../lib/serviceApi';

const OVERRIDE_ELIGIBLE_PROJECT_IDS = ['PT25260002'];

const formatProject = (project, managerMap = {}) => ({
  ...project,
  id: project._id,
  client:
    typeof project.client === 'object'
      ? project.client?.name
      : project.client || '—',
  service:
    typeof project.service === 'object'
      ? project.service?.name
      : project.service || '—',
  manager: managerMap[project.manager] || project.manager || '—',
  deadline: project.deadline
    ? new Date(project.deadline).toISOString().split('T')[0]
    : '—',
});

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
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [visibleColumns, setVisibleColumns] = useState([
    'projectName',
    'client',
    'service',
    'deadline',
    'progress',
    'status',
  ]);

  const [tempVisibleColumns, setTempVisibleColumns] =
    useState(visibleColumns);

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideProjectId, setOverrideProjectId] = useState(null);
  const [overrideForm, setOverrideForm] = useState(null);
  const [overrideSaving, setOverrideSaving] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const [projectsData, contactsData] = await Promise.all([
        getProjects(),
        getContacts(),
      ]);

      const managerMap = Object.fromEntries(
        contactsData.map((c) => [
          c._id,
          `${c.firstName} ${c.lastName}`.trim(),
        ])
      );

      setProjects(
        projectsData.map((p) => formatProject(p, managerMap))
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || 'Could not load projects.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);

    window.addEventListener('click', handleClickOutside);

    return () =>
      window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [clientsData, servicesData, contactsData] = await Promise.all([
          getClients(),
          getServices(),
          getContacts(),
        ]);
        setClients(clientsData);
        setServices(
          servicesData
            .filter((s) => s.status === 'Active')
            .sort(
              (a, b) =>
                (a.priority ?? 0) - (b.priority ?? 0) ||
                a.name.localeCompare(b.name)
            )
        );
        setContacts(contactsData);
      } catch (error) {
        console.error('Failed to load master data:', error);
      }
    };

    loadMasters();
    loadProjects();
  }, []);

  const filteredProjects = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        (project.projectName || '').toLowerCase().includes(query) ||
        (project.client || '').toLowerCase().includes(query) ||
        (project.service || '').toLowerCase().includes(query) ||
        (project.projectId || '').toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this project?'
      )
    )
      return;

    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert(
        error.response?.data?.message || 'Failed to delete project.'
      );
    }
  };

  const handleEdit = (project) => {
    navigate('/projects/add-project', {
      state: { project },
    });
  };

  const handleView = (project) => {
    navigate(`/projects/view-project/${project.id}`, {
      state: { project },
    });
  };

  const canShowOverrideOption = (project) =>
    OVERRIDE_ELIGIBLE_PROJECT_IDS.includes(project.projectId);

  const handleOpenOverride = async (project) => {
    setActiveMenuId(null);
    try {
      const full = await getProject(project.id);
      setOverrideProjectId(project.id);
      setOverrideForm({
        projectId: full.projectId || '',
        projectName: full.projectName || '',
        client: full.client?._id || full.client || '',
        service: full.service?._id || full.service || '',
        manager: full.manager || full.projectManager?._id || '',
        budget: full.budget || '',
        priority: full.priority || 'Medium',
        deadline: full.deadline
          ? new Date(full.deadline).toISOString().split('T')[0]
          : '',
        progress: full.progress ?? 0,
        status: full.status || 'Not Started',
      });
      setIsOverrideModalOpen(true);
    } catch (error) {
      alert(
        error.response?.data?.message || 'Could not load project for override.'
      );
    }
  };

  const handleSaveOverride = async () => {
    if (!overrideProjectId || !overrideForm) return;

    setOverrideSaving(true);
    try {
      await updateProject(overrideProjectId, overrideForm);
      setIsOverrideModalOpen(false);
      setOverrideForm(null);
      setOverrideProjectId(null);
      await loadProjects();
    } catch (error) {
      alert(
        error.response?.data?.message || 'Failed to save override changes.'
      );
    } finally {
      setOverrideSaving(false);
    }
  };

  const handleAdd = () => {
    navigate('/projects/add-project');
  };

  const toggleColumnSelection = (colId) => {
    setTempVisibleColumns((prev) =>
      prev.includes(colId)
        ? prev.filter((id) => id !== colId)
        : [...prev, colId]
    );
  };

  const applyColumnSettings = () => {
    setVisibleColumns(tempVisibleColumns);
    setIsSettingsModalOpen(false);
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'Medium':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-sky-50 text-sky-600 border-sky-100';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'On Hold':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:px-8 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Projects List
            </h1>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-500" />
              Manage ongoing projects and monitor progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setTempVisibleColumns(visibleColumns);
                  setIsSettingsModalOpen(true);
                }}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                <Settings className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-slate-200 hidden md:block" />

              <button
                onClick={handleAdd}
                className="flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 shadow-sm">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">

          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100/80">
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">S.No.</th>
                  {visibleColumns.includes('projectName') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Project Name</th>}
                  {visibleColumns.includes('client') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Client</th>}
                  {visibleColumns.includes('service') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Service</th>}
                  {visibleColumns.includes('manager') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Manager</th>}
                  {visibleColumns.includes('budget') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Budget</th>}
                  {visibleColumns.includes('priority') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Priority</th>}
                  {visibleColumns.includes('deadline') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Deadline</th>}
                  {visibleColumns.includes('progress') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Progress</th>}
                  {visibleColumns.includes('status') && <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</th>}
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-center sticky right-0 bg-slate-50 z-30 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] border-l border-slate-100">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/80">
                {loading && (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-600 space-y-3">
                        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <p className="font-medium text-slate-500">Loading projects...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={visibleColumns.length + 2} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-600 space-y-3">
                        <Search className="w-12 h-12 text-slate-200" />
                        <p className="font-medium text-slate-500">No projects found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filteredProjects.map((project, idx) => (
                  <tr key={project.id} className="group hover:bg-slate-50/50 transition-colors">

                    <td className="px-6 py-4">
                      <span className="text-slate-400 font-medium text-sm">{idx + 1}</span>
                    </td>

                    {visibleColumns.includes('projectName') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FolderGit2 className="w-5 h-5" />
                          </div>

                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {project.projectName}
                            </span>
                            {project.projectId && (
                              <span className="text-[11px] text-slate-400 font-medium">
                                {project.projectId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('client') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Building2 className="w-4 h-4 text-indigo-400" />
                          {project.client}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('service') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Layers className="w-4 h-4" />
                          {project.service}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('manager') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4" />
                          {project.manager}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('budget') && (
                      <td className="px-6 py-4 font-semibold text-emerald-600">
                        {project.budget}
                      </td>
                    )}

                    {visibleColumns.includes('priority') && (
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-medium border ${getPriorityStyles(
                            project.priority
                          )}`}
                        >
                          {project.priority}
                        </span>
                      </td>
                    )}

                    {visibleColumns.includes('deadline') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {project.deadline}
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('progress') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                              style={{
                                width: `${project.progress}%`,
                              }}
                            />
                          </div>

                          <span className="text-xs font-medium text-slate-500 w-10">
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('status') && (
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-2 border ${getStatusStyles(
                            project.status
                          )}`}
                        >
                          <div className="w-2 h-2 rounded-full bg-current opacity-70" />
                          {project.status}
                        </span>
                      </td>
                    )}

                    <td className={`px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 transition-colors border-l border-slate-100 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] ${activeMenuId === project.id ? 'z-40' : 'z-20'}`}>
                      <div className="relative flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                          className={`p-2 rounded-xl transition-all ${activeMenuId === project.id
                            ? 'bg-indigo-50 text-indigo-600 shadow-inner'
                            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeMenuId === project.id && (
                          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 py-2 z-30">
                            <div className="px-4 py-1.5 mb-1 border-b border-slate-50">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</p>
                            </div>
                            <button
                              onClick={() => {
                                handleView(project);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group/item"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover/item:bg-white flex items-center justify-center transition-colors">
                                <Eye className="w-4 h-4" />
                              </div>
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                handleEdit(project);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group/item"
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover/item:bg-white flex items-center justify-center transition-colors">
                                <Pencil className="w-4 h-4" />
                              </div>
                              Edit Project
                            </button>
                            {canShowOverrideOption(project) && (
                              <button
                                onClick={() => handleOpenOverride(project)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-violet-600 hover:bg-violet-50 transition-all group/item"
                              >
                                <div className="w-8 h-8 rounded-lg bg-violet-50 group-hover/item:bg-white flex items-center justify-center transition-colors">
                                  <SlidersHorizontal className="w-4 h-4" />
                                </div>
                                Override
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleDelete(project.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all group/item"
                            >
                              <div className="w-8 h-8 rounded-lg bg-rose-50 group-hover/item:bg-white flex items-center justify-center transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </div>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing <span className="text-slate-900 font-semibold">{filteredProjects.length}</span> of <span className="text-slate-900 font-semibold">{projects.length}</span> projects
            </p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30 cursor-not-allowed">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold text-sm shadow-sm shadow-indigo-200">1</button>
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOverrideModalOpen && overrideForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !overrideSaving && setIsOverrideModalOpen(false)}
          />

          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-violet-700 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-white text-lg font-semibold tracking-tight">Override Project</h2>
                <p className="text-violet-200 text-xs mt-0.5">Change values as per your requirement</p>
              </div>
              <button
                onClick={() => !overrideSaving && setIsOverrideModalOpen(false)}
                className="text-violet-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  value={overrideForm.projectId}
                  onChange={(e) => setOverrideForm({ ...overrideForm, projectId: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  value={overrideForm.projectName}
                  onChange={(e) => setOverrideForm({ ...overrideForm, projectName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    value={overrideForm.client}
                    onChange={(e) => setOverrideForm({ ...overrideForm, client: e.target.value })}
                  >
                    <option value="">Select Client</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Service</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    value={overrideForm.service}
                    onChange={(e) => setOverrideForm({ ...overrideForm, service: e.target.value })}
                  >
                    <option value="">Select Service</option>
                    {services.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manager</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  value={overrideForm.manager}
                  onChange={(e) => setOverrideForm({ ...overrideForm, manager: e.target.value })}
                >
                  <option value="">Select Manager</option>
                  {contacts.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Budget</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    value={overrideForm.budget}
                    onChange={(e) => setOverrideForm({ ...overrideForm, budget: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    value={overrideForm.priority}
                    onChange={(e) => setOverrideForm({ ...overrideForm, priority: e.target.value })}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    value={overrideForm.deadline}
                    onChange={(e) => setOverrideForm({ ...overrideForm, deadline: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    value={overrideForm.status}
                    onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>On Hold</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress ({overrideForm.progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-violet-600"
                  value={overrideForm.progress}
                  onChange={(e) => setOverrideForm({ ...overrideForm, progress: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-slate-100 flex gap-3 shrink-0">
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                disabled={overrideSaving}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                disabled={overrideSaving}
                className="flex-[2] py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              >
                {overrideSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingsModalOpen(false)} />

          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white text-lg font-semibold tracking-tight">Choose Columns</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-0.5">
                {allColumns.map((col) => (
                  <label key={col.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        className="peer h-5 w-5 appearance-none rounded border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                        checked={tempVisibleColumns.includes(col.id)}
                        onChange={() => toggleColumnSelection(col.id)}
                      />
                      <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={applyColumnSettings}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-500/10"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbarThin::-webkit-scrollbar { height: 4px; }
        .custom-scrollbarThin::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}