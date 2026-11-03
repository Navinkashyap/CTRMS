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

// Sync completed / delivered files from VMS project to Admin project
export async function syncAdminProjectDeliverables(vmsProject) {
  if (!vmsProject) return;
  try {
    const rawFiles = [
      ...(Array.isArray(vmsProject.deliveredFiles) ? vmsProject.deliveredFiles : []),
      ...(Array.isArray(vmsProject.salesDeliveredFiles) ? vmsProject.salesDeliveredFiles : []),
      ...(Array.isArray(vmsProject.completedFiles) ? vmsProject.completedFiles : []),
      ...(vmsProject.deliveryFiles ? Object.values(typeof vmsProject.deliveryFiles === 'object' ? vmsProject.deliveryFiles : {}).flat() : [])
    ];

    const uniqueFiles = [];
    const seen = new Set();
    for (const f of rawFiles) {
      if (!f) continue;
      const name = f.name || (typeof f === 'string' ? f.split('/').pop() : '');
      const url = f.url || (typeof f === 'string' ? f : '');
      const key = `${name}_${url}`;
      if (!seen.has(key) && (name || url)) {
        seen.add(key);
        uniqueFiles.push({
          name: name || 'Deliverable',
          url: url,
          size: f.size || '',
          uploadedAt: f.uploadedAt || new Date().toISOString(),
        });
      }
    }

    const update = {};
    if (vmsProject.status) {
      update.status = vmsProject.status;
      update.projectStatus = vmsProject.status;
    }
    if (uniqueFiles.length > 0) {
      update.completedFiles = uniqueFiles;
      update.deliveredFiles = uniqueFiles;
    }
    const pmNote = vmsProject.notesForPm || vmsProject.notes || '';
    if (pmNote) {
      update.pmNotes = pmNote;
      update.notesForSales = pmNote;
    }

    const matchConditions = [
      ...(vmsProject.projectId ? [{ projectId: vmsProject.projectId }, { projectCode: vmsProject.projectId }] : []),
      ...(vmsProject.name ? [{ projectName: vmsProject.name }, { projectCode: vmsProject.name }] : [])
    ];

    if (matchConditions.length > 0 && Object.keys(update).length > 0) {
      await Project.updateMany(
        { $or: matchConditions },
        { $set: update }
      );
    }
  } catch (error) {
    console.error("Failed to sync admin project deliverables:", error.message);
  }
}
