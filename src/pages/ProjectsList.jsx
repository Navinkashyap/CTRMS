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
} from 'lucide-react';

const initialProjects = [
  {
    id: 1,
    projectName: 'Global Reach Website',
    client: 'Lionsbridge Technologies',
    service: 'Translation',
    deadline: '2026-05-15',
    status: 'In Progress',
    progress: 65,
    priority: 'High',
    manager: 'John Doe',
    budget: '$10,000',
  },
  {
    id: 2,
    projectName: 'Q2 Marketing Campaign',
    client: 'ADK Fortune',
    service: 'Localization',
    deadline: '2026-04-10',
    status: 'Completed',
    progress: 100,
    priority: 'Medium',
    manager: 'Jane Smith',
    budget: '$5,000',
  },
  {
    id: 3,
    projectName: 'Legal Contracts Review',
    client: 'Mayflower Services',
    service: 'Interpretation',
    deadline: '2026-06-20',
    status: 'On Hold',
    progress: 15,
    priority: 'High',
    manager: 'Mike Ross',
    budget: '$15,000',
  },
  {
    id: 4,
    projectName: 'App UI Translation',
    client: 'TechNova',
    service: 'Translation',
    deadline: '2026-08-01',
    status: 'Not Started',
    progress: 0,
    priority: 'Low',
    manager: 'Sarah Connor',
    budget: '$8,000',
  },
  {
    id: 5,
    projectName: 'User Manual Localization',
    client: 'Samsung Corp',
    service: 'DTP',
    deadline: '2026-05-30',
    status: 'In Progress',
    progress: 40,
    priority: 'Medium',
    manager: 'David Kim',
    budget: '$12,000',
  },
  {
    id: 6,
    projectName: 'Subtitling Promo Video',
    client: 'Netflix Asia',
    service: 'Subtitling',
    deadline: '2026-04-25',
    status: 'In Progress',
    progress: 80,
    priority: 'High',
    manager: 'Emily Chen',
    budget: '$7,500',
  },
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
  const navigate = useNavigate();

  const [projects, setProjects] = useState(initialProjects);
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

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);

    window.addEventListener('click', handleClickOutside);

    return () =>
      window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredProjects = React.useMemo(() => {
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.projectName.toLowerCase().includes(query) ||
        project.client.toLowerCase().includes(query) ||
        project.service.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleDelete = (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this project?'
      )
    )
      return;

    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleEdit = (project) => {
    navigate('/projects/add-project', {
      state: { project },
    });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-900 pb-10">
      <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-6">

        {/* HEADER */}
        <div className="bg-white border border-slate-200/70 p-6 rounded-3xl shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Projects List
              </h1>

              <p className="mt-2 text-sm text-slate-500 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-500" />
                Manage ongoing projects and monitor progress.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

              {/* SEARCH */}
              <div className="relative w-full sm:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full pl-11 pr-4 h-11 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* SETTINGS */}
              <button
                onClick={() => {
                  setTempVisibleColumns(visibleColumns);
                  setIsSettingsModalOpen(true);
                }}
                className="h-11 w-11 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* ADD BUTTON */}
              <button
                onClick={handleAdd}
                className="flex items-center justify-center gap-2 px-5 h-11 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-indigo-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full min-w-[900px] lg:min-w-full text-sm">

              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>

                  <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    S.No.
                  </th>

                  {visibleColumns.includes('projectName') && (
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Project Name
                    </th>
                  )}

                  {visibleColumns.includes('client') && (
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Client
                    </th>
                  )}

                  {visibleColumns.includes('service') && (
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Service
                    </th>
                  )}

                  {visibleColumns.includes('manager') && (
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Manager
                    </th>
                  )}

                  {visibleColumns.includes('budget') && (
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Budget
                    </th>
                  )}

                  {visibleColumns.includes('priority') && (
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Priority
                    </th>
                  )}

                  {visibleColumns.includes('deadline') && (
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Deadline
                    </th>
                  )}

                  {visibleColumns.includes('progress') && (
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Progress
                    </th>
                  )}

                  {visibleColumns.includes('status') && (
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  )}

                  <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredProjects.length === 0 && (
                  <tr>
                    <td
                      colSpan={visibleColumns.length + 2}
                      className="py-20 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <FolderGit2 className="w-10 h-10 text-slate-300" />
                        <p className="text-slate-500 font-medium">
                          No projects found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {filteredProjects.map((project, idx) => (
                  <tr
                    key={project.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-200 ease-out"
                  >

                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                        {idx + 1}
                      </div>
                    </td>

                    {visibleColumns.includes('projectName') && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <FolderGit2 className="w-5 h-5" />
                          </div>

                          <span className="font-semibold text-slate-900">
                            {project.projectName}
                          </span>
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

                    {/* ACTION */}
                    <td className="px-6 py-4 text-center">

                      <div
                        className="relative flex justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >

                        <button
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === project.id
                                ? null
                                : project.id
                            )
                          }
                          className={`p-2 rounded-xl transition-all ${activeMenuId === project.id
                              ? 'bg-indigo-600 text-white'
                              : 'hover:bg-slate-100 text-slate-500'
                            }`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeMenuId === project.id && (
                          <div className="absolute right-12 top-0 w-40 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">

                            <div className="p-2">

                              <button
                                onClick={() => {
                                  handleEdit(project);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit
                              </button>

                              <button
                                onClick={() => {
                                  handleDelete(project.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">

            <p className="text-sm text-slate-500">
              Showing{' '}
              <span className="font-semibold text-slate-900">
                {filteredProjects.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-900">
                {projects.length}
              </span>{' '}
              projects
            </p>

            <div className="flex items-center gap-2">

              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button className="w-10 h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
                1
              </button>

              <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsSettingsModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200">

            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-6 py-5 flex items-center justify-between">

              <h2 className="text-white text-lg font-semibold">
                Choose Columns
              </h2>

              <button
                onClick={() =>
                  setIsSettingsModalOpen(false)
                }
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">

              <div className="space-y-1">

                {allColumns.map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-all"
                  >

                    <div className="relative">

                      <input
                        type="checkbox"
                        checked={tempVisibleColumns.includes(
                          col.id
                        )}
                        onChange={() =>
                          toggleColumnSelection(col.id)
                        }
                        className="peer h-5 w-5 appearance-none rounded-md border border-slate-300 checked:bg-indigo-600 checked:border-indigo-600 transition-all"
                      />

                      <CheckCircle2 className="absolute w-3.5 h-3.5 text-white left-[3px] top-[3px] opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>

                    <span className="text-sm font-medium text-slate-700">
                      {col.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-slate-200">

              <button
                onClick={applyColumnSettings}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Inter', sans-serif;
        }

        .custom-scrollbarThin::-webkit-scrollbar {
          height: 6px;
        }

        .custom-scrollbarThin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}