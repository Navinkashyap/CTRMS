import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter,
  Settings,
  ChevronDown,
  ArrowUpDown,
  Star,
  Plus,
  Search,
  X,
  Trash2
} from 'lucide-react';
import { getProjectManagers, createProjectManager, updateProjectManager, deleteProjectManager } from '../lib/projectManagerApi';

// Initial data placeholder removed - fetching from API instead

const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={`${star <= rating
            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]'
            : 'text-slate-200 fill-slate-50'
            } transition-all duration-300`}
        />
      ))}
    </div>
  );
};

export default function ProjectManagerList() {
  const navigate = useNavigate();
  const [projectManagers, setProjectManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjectManagers();
  }, []);

  const loadProjectManagers = async () => {
    try {
      setIsLoading(true);
      const data = await getProjectManagers();
      setProjectManagers(data);
    } catch (error) {
      console.error('Failed to fetch projectManagers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [filters, setFilters] = useState({
    code: '',
    name: '',
    email: '',
    country: '',
    motherTongue: '',
    ptft: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this projectManager?')) {
      try {
        await deleteProjectManager(id);
        await loadProjectManagers();
      } catch (error) {
        console.error('Failed to delete projectManager:', error);
      }
    }
  };

  const handleEdit = (projectManager) => {
    navigate('/project-managers/add', { state: { projectManager } });
  };

  const filteredProjectManagers = projectManagers.filter(projectManager =>
    Object.keys(filters).every(key =>
      projectManager[key]?.toString().toLowerCase().includes(filters[key].toLowerCase())
    )
  );

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-[#fafbfc] p-4 sm:p-8 animate-in fade-in duration-700">
      <div className="max-w-[1400px] mx-auto space-y-4">

        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Project Manager
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide flex items-center gap-3">
              Global Resource Management
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold text-[10px] uppercase tracking-wider">
                {filteredProjectManagers.length} ACTIVE MANAGERS
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Quick Search..."
                className="w-72 pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>

            <button
              onClick={() => navigate('/project-managers/add')}
              className="group relative flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-semibold shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Plus className="relative w-4 h-4" />
              <span className="relative">Add New Project Manager</span>
            </button>
          </div>
        </div>

        {/* Premium Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-wrap items-end gap-3 overflow-hidden relative">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Category</label>
            <div className="relative">
              <select className="w-full h-10 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white">
                <option>All Services</option>
                <option>Translation</option>
                <option>Interpretation</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Source Language</label>
            <div className="relative">
              <select className="w-full h-10 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Language</label>
            <div className="relative">
              <select className="w-full h-10 px-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all focus:bg-white">
                <option>All Targets</option>
                <option>Hindi</option>
                <option>Bengali</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Premium ProjectManager Table */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
          <div className="overflow-x-auto custom-scrollbarThin">
            <table className="w-full text-left text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100/80">
                  <th className="px-6 py-3 w-32">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Code</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 pointer-events-none" />
                      </div>
                      <input
                        type="text"
                        placeholder="Filter..."
                        className="w-full h-8 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 font-sans"
                        value={filters.code}
                        onChange={(e) => handleFilterChange('code', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Full Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 pointer-events-none" />
                      </div>
                      <input
                        type="text"
                        placeholder="Filter..."
                        className="w-full h-8 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 font-sans"
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Email Contact</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300 pointer-events-none" />
                      </div>
                      <input
                        type="text"
                        placeholder="Filter..."
                        className="w-full h-8 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 font-sans"
                        value={filters.email}
                        onChange={(e) => handleFilterChange('email', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3 w-40">
                    <div className="flex flex-col gap-2 text-center h-[52px] justify-between">
                      <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider mt-1">Ratings</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 font-semibold text-slate-500 text-xs text-center uppercase tracking-wider flex-col justify-end pt-[28px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredProjectManagers.map((projectManager, index) => (
                  <tr key={projectManager._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-[11px] font-semibold border border-slate-200 text-center">
                        {projectManager.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0 line-clamp-1">
                          {projectManager.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{projectManager.name}</div>
                          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {projectManager.country}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-700">{projectManager.email}</div>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100/50 hover:bg-indigo-100 transition-colors cursor-pointer">{projectManager.ptft}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer">{projectManager.motherTongue}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-widest pl-0.5">
                            <span>Service</span>
                            <span>{projectManager.serviceQuality}/5</span>
                          </div>
                          <StarRating rating={projectManager.serviceQuality} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-widest pl-0.5">
                            <span>Task</span>
                            <span>{projectManager.taskQuality}/5</span>
                          </div>
                          <StarRating rating={projectManager.taskQuality} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(projectManager)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                          title="Edit ProjectManager"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(projectManager._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-600 transition-all shadow-sm"
                          title="Delete ProjectManager"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing <span className="text-slate-900 font-semibold">{filteredProjectManagers.length}</span> of <span className="text-slate-900 font-semibold">{projectManagers.length}</span> Project Managers
            </p>
            <div className="flex items-center gap-1">
              <button disabled className="px-3 py-1.5 text-sm font-medium text-slate-400 bg-white border border-slate-200 rounded-lg hover:text-indigo-600 transition-colors disabled:opacity-50 cursor-not-allowed">
                Previous
              </button>
              <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold text-sm shadow-sm shadow-indigo-200 ml-1">1</button>
              <button className="w-8 h-8 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-100 transition-all">2</button>
              <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-indigo-600 hover:border-indigo-200 transition-colors ml-1">
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
