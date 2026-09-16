import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getContacts } from "../lib/salesApi";
import { hasSalesPermission } from "../lib/permissions";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (q) => {
    setLoading(true);
    try {
      setContacts(await getContacts(q ? { search: q } : {}));
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
            placeholder="Search by name or email..."
            className="w-72 max-w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-900">
            Search
          </button>
        </form>

        {hasSalesPermission("contacts", "add") && (
          <Link to="/sales/contacts/add" className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            + Add Contact
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Client</th>
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
            {!loading && contacts.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No contacts found.</td></tr>
            )}
            {contacts.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800">{c.salutation} {c.firstName} {c.lastName}</td>
                <td className="px-5 py-3 text-slate-500">{c.clientCode || "—"}</td>
                <td className="px-5 py-3 text-slate-500">{c.email}</td>
                <td className="px-5 py-3 text-slate-500">{c.countryCode} {c.phone}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right space-x-3">
                  {hasSalesPermission("contacts", "edit") && (
                    <Link to={`/sales/contacts/edit/${c._id}`} className="text-indigo-600 hover:underline">Edit</Link>
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

export default ContactList;
