import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProjects } from "../lib/salesApi";
import { hasSalesPermission } from "../lib/permissions";

const statusColors = {
  "Not Started": "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
};

const ProjectsList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (q) => {
    setLoading(true);
    try {
      setProjects(await getProjects(q ? { search: q } : {}));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(""); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name or code..."
            className="w-72 max-w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-900">
            Search
          </button>
        </form>

        {hasSalesPermission("projects", "create") && (
          <Link to="/sales/projects/create" className="px-4 py-2 text-sm rounded-lg bg-amber-500 text-white hover:bg-amber-600">
            + Create Project
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 text-xs uppercase tracking-wider shadow-sm">
              <tr>
                <th className="text-left px-5 py-3">Code</th>
                <th className="text-left px-5 py-3">Project</th>
                <th className="text-left px-5 py-3">Client</th>
                <th className="text-left px-5 py-3">Priority</th>
                <th className="text-left px-5 py-3">Deadline</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
              )}
              {!loading && projects.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No projects found.</td></tr>
              )}
              {projects.map((p) => (
                <tr
                  key={p._id}
                  onClick={() => navigate(`/sales/projects/view/${p._id}`)}
                  className="hover:bg-slate-50 cursor-pointer"
                >
                  <td className="px-5 py-3 font-medium text-slate-700">{p.projectId}</td>
                  <td className="px-5 py-3 text-slate-800">{p.projectName}</td>
                  <td className="px-5 py-3 text-slate-500">{p.client?.name || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{p.priority}</td>
                  <td className="px-5 py-3 text-slate-500">{p.deadline ? new Date(p.deadline).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || "bg-slate-100 text-slate-600"}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectsList;
