import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getClients } from "../lib/salesApi";
import { hasSalesPermission } from "../lib/permissions";

const statusColors = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-zinc-100 text-zinc-600",
  Onboarding: "bg-blue-100 text-blue-700",
  Client: "bg-indigo-100 text-indigo-700",
  "Prospect Warm": "bg-amber-100 text-amber-700",
  "Prospect Cold": "bg-sky-100 text-sky-700",
};

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (q) => {
    setLoading(true);
    try {
      setClients(await getClients(q ? { search: q } : {}));
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
            placeholder="Search by name, code or email..."
            className="w-72 max-w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-900">
            Search
          </button>
        </form>

        {hasSalesPermission("clients", "add") && (
          <Link to="/sales/clients/add" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            + Add Client
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Code</th>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Phone</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
            )}
            {!loading && clients.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No clients found.</td></tr>
            )}
            {clients.map((client) => (
              <tr key={client._id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-700">{client.membershipCode}</td>
                <td className="px-5 py-3 text-slate-800">{client.name}</td>
                <td className="px-5 py-3 text-slate-500">{client.email || "—"}</td>
                <td className="px-5 py-3 text-slate-500">{client.phone || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[client.status] || "bg-slate-100 text-slate-600"}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right space-x-3">
                  <Link to={`/sales/clients/view/${client._id}`} className="text-indigo-600 hover:underline">View</Link>
                  {hasSalesPermission("clients", "edit") && (
                    <Link to={`/sales/clients/edit/${client._id}`} className="text-slate-600 hover:underline">Edit</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;
