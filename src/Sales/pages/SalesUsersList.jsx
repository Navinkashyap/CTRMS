import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSalesUsers, updateSalesUser, deleteSalesUser } from "../lib/salesApi";

const SalesUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getSalesUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleStatus = async (user) => {
    await updateSalesUser(user.id, { status: user.status === "Active" ? "Inactive" : "Active" });
    load();
  };

  const remove = async (user) => {
    if (!window.confirm(`Delete ${user.name || user.email}? This cannot be undone.`)) return;
    await deleteSalesUser(user.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">Create and manage Sales Manager accounts and their permissions.</p>
        <Link to="/sales/users/add" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
          + Add Sales Manager
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Mobile</th>
              <th className="text-left px-5 py-3">Gender</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No Sales Managers yet.</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800">{u.name}</td>
                <td className="px-5 py-3 text-slate-500">{u.email}</td>
                <td className="px-5 py-3 text-slate-500">{u.mobile || "—"}</td>
                <td className="px-5 py-3 text-slate-500">{u.gender || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right space-x-3">
                  <Link to={`/sales/users/edit/${u.id}`} className="text-indigo-600 hover:underline">Edit</Link>
                  <button onClick={() => toggleStatus(u)} className="text-slate-600 hover:underline">
                    {u.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => remove(u)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesUsersList;
