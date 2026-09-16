import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClient, getContacts, getProjects } from "../lib/salesApi";
import { hasSalesPermission } from "../lib/permissions";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{label}</p>
    <p className="text-sm text-slate-800">{value || "—"}</p>
  </div>
);

const ViewClient = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getClient(id).then(setClient);
    if (hasSalesPermission("contacts", "view")) {
      getContacts({ clientId: id }).then(setContacts).catch(() => {});
    }
    if (hasSalesPermission("projects", "view")) {
      getProjects({ clientId: id }).then(setProjects).catch(() => {});
    }
  }, [id]);

  if (!client) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{client.name}</h2>
          <p className="text-sm text-slate-500">{client.membershipCode}</p>
        </div>
        {hasSalesPermission("clients", "edit") && (
          <Link to={`/sales/clients/edit/${client._id}`} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50">
            Edit
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
        <Field label="Status" value={client.status} />
        <Field label="Email" value={client.email} />
        <Field label="Phone" value={client.phone} />
        <Field label="Website" value={client.website} />
        <Field label="Currency" value={client.currency} />
        <Field label="Country" value={client.country} />
        <Field label="City" value={client.city} />
        <Field label="State" value={client.state} />
        <Field label="Zip" value={client.zip} />
        <div className="col-span-2 sm:col-span-3"><Field label="Address" value={client.address} /></div>
        <div className="col-span-2 sm:col-span-3"><Field label="Notes" value={client.notes} /></div>
      </div>

      {hasSalesPermission("contacts", "view") && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Contacts</h3>
            {hasSalesPermission("contacts", "add") && (
              <Link to={`/sales/contacts/add?clientId=${client._id}`} className="text-sm text-indigo-600 hover:underline">
                + Add Contact
              </Link>
            )}
          </div>
          {contacts.length === 0 ? (
            <p className="text-sm text-slate-400">No contacts yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {contacts.map((c) => (
                <li key={c._id} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-slate-800">{c.salutation} {c.firstName} {c.lastName}</span>
                  <span className="text-slate-500">{c.email}</span>
                  {hasSalesPermission("contacts", "edit") && (
                    <Link to={`/sales/contacts/edit/${c._id}`} className="text-indigo-600 hover:underline">Edit</Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {hasSalesPermission("projects", "view") && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Projects</h3>
            {hasSalesPermission("projects", "create") && (
              <Link to={`/sales/projects/create?clientId=${client._id}`} className="text-sm text-indigo-600 hover:underline">
                + Create Project
              </Link>
            )}
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-400">No projects yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {projects.map((p) => (
                <li key={p._id} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-slate-800">{p.projectId} — {p.projectName}</span>
                  <span className="text-slate-500">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewClient;
