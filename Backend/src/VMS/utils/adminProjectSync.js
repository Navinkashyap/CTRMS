import Project from "../../models/Project.js";

// The Admin, PM and Vendor portals each keep their own copy of "the project"
// (Project / VMSProject / Job), linked only by the human-readable projectId
// string — there's no shared ObjectId. These helpers push PM/vendor-side
// events back onto the Admin's own Project record so the Admin dashboard
// doesn't stay frozen at creation-time status forever. Both are best-effort:
// a failure here must never block the caller's real request.

// Record how the PM responded to an incoming project (accept/reject).
export async function flagAdminProjectPmStatus(projectIdStr, pmStatus, note = "") {
  if (!projectIdStr) return;
  try {
    await Project.findOneAndUpdate(
      { projectId: projectIdStr },
      { pmStatus, pmStatusNote: note, pmStatusAt: new Date() }
    );
  } catch (error) {
    console.error("Failed to flag admin project PM status:", error.message);
  }
}

// Mirror a downstream status change (e.g. the vendor completed the work) onto
// the Admin's own status fields.
export async function syncAdminProjectStatus(projectIdStr, status) {
  if (!projectIdStr || !status) return;
  try {
    await Project.findOneAndUpdate(
      { projectId: projectIdStr },
      { status, projectStatus: status }
    );
  } catch (error) {
    console.error("Failed to sync admin project status:", error.message);
  }
}
