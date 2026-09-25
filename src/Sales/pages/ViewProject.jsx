import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject } from "../lib/salesApi";

const statusColors = {
  "Not Started": "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Cancelled: "bg-red-100 text-red-700",
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{label}</p>
    <p className="text-sm text-slate-800">{value || "—"}</p>
  </div>
);

const ViewProject = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProject(id)
      .then(setProject)
      .catch((err) => setError(err.response?.data?.message || "Failed to load project"));
  }, [id]);

  if (error) return <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>;
  if (!project) return <p className="text-slate-500">Loading...</p>;

  const contact = project.clientContact;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{project.projectName}</h2>
          <p className="text-sm text-slate-500">{project.projectId}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusColors[project.status] || "bg-slate-100 text-slate-600"}`}>
          {project.status}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
        <Field label="Client" value={project.client?.name} />
        <Field
          label="Client Contact"
          value={contact ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim() : ""}
        />
        <Field label="Job Type" value={project.jobType} />
        <Field label="Priority" value={project.priority} />
        <Field label="Deadline" value={project.deadline ? new Date(project.deadline).toLocaleDateString() : ""} />
        <Field label="Amount" value={project.amount} />
        <div className="col-span-2 sm:col-span-3">
          <Field label="Description" value={project.description} />
        </div>
      </div>

      {project.client?._id && (
        <Link to={`/sales/clients/view/${project.client._id}`} className="text-sm text-indigo-600 hover:underline">
          ← Back to {project.client.name}
        </Link>
      )}
    </div>
  );
};

export default ViewProject;
