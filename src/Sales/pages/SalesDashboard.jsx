import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, BookUser, Layers } from "lucide-react";
import { getSalesSummary } from "../lib/salesApi";
import { getCurrentUser } from "../../lib/authApi";
import { hasSalesPermission } from "../lib/permissions";

const StatCard = ({ icon: Icon, label, value, to, color }) => (
  <Link to={to} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value ?? "–"}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </Link>
);

const SalesDashboard = () => {
  const [summary, setSummary] = useState(null);
  const user = getCurrentUser();

  useEffect(() => {
    getSalesSummary().then(setSummary).catch(() => setSummary({ clients: 0, contacts: 0, projects: 0 }));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Welcome back, {user?.name || user?.email} 👋</h2>
        <p className="text-sm text-slate-500">Here's what's happening with your accounts today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {hasSalesPermission("clients", "view") && (
          <StatCard icon={Building2} label="Total Clients" value={summary?.clients} to="/sales/clients" color="bg-indigo-600" />
        )}
        {hasSalesPermission("contacts", "view") && (
          <StatCard icon={BookUser} label="Client Contacts" value={summary?.contacts} to="/sales/contacts" color="bg-emerald-600" />
        )}
        {hasSalesPermission("projects", "view") && (
          <StatCard icon={Layers} label="Projects" value={summary?.projects} to="/sales/projects" color="bg-amber-500" />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {hasSalesPermission("clients", "add") && (
            <Link to="/sales/clients/add" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              + Add Client
            </Link>
          )}
          {hasSalesPermission("contacts", "add") && (
            <Link to="/sales/contacts/add" className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              + Add Contact
            </Link>
          )}
          {hasSalesPermission("projects", "create") && (
            <Link to="/sales/projects/create" className="px-4 py-2 text-sm rounded-lg bg-amber-500 text-white hover:bg-amber-600">
              + Create Project
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
