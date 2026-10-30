  import mongoose from "mongoose";
import Job from "../models/Job.js";
import VMSProject from "../VMS/models/VMSProject.js";

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Automatically transfers deliverable files submitted by a completed task's vendor
 * to the next task in the same language pair (target).
 * 
 * Workflow rules:
 * - Only the first task in a language pair receives original PM files.
 * - Each subsequent task receives the deliverables submitted by the previous task vendor.
 * - If subsequent task already has an assigned vendor/job, that job's workingFiles are updated
 *   and its waiting status is cleared.
 */
export async function transferDeliverablesToNextTask(job, filesToTransfer = null) {
  try {
    if (!job) return null;

    // 1. Gather files to transfer
    const files = (filesToTransfer && filesToTransfer.length > 0)
      ? filesToTransfer
      : (job.deliveredFiles || []);

    if (!files || files.length === 0) {
      console.log(`[SequentialTransfer] No delivered files found for job ${job.po || job._id}`);
      return null;
    }

    const formattedFiles = files.map(f => ({
      name: f?.name || (typeof f === 'string' ? f.split('/').pop() : 'deliverable_file'),
      url: f?.url || (typeof f === 'string' ? f : '')
    })).filter(f => Boolean(f.name));

    if (formattedFiles.length === 0) return null;

    // 2. Find the project
    let project = null;
    if (job.project) {
      project = await VMSProject.findById(job.project);
    }
    if (!project && job.projectId) {
      project = await VMSProject.findOne({
        $or: [
          { projectId: job.projectId },
          ...(mongoose.isValidObjectId(job.projectId) ? [{ _id: job.projectId }] : [])
        ]
      });
    }

    if (!project || !project.targets || project.targets.length === 0) {
      console.log(`[SequentialTransfer] Project or targets not found for job ${job.po || job._id}`);
      return null;
    }

    // 3. Find matching target (language pair)
    const targets = project.targets;
    let targetIndex = -1;

    if (job.targetId) {
      targetIndex = targets.findIndex(t => String(t.id) === String(job.targetId));
    }

    if (targetIndex === -1 && job.taskId) {
      targetIndex = targets.findIndex(t =>
        Array.isArray(t.tasks) && t.tasks.some(tk => String(tk.id) === String(job.taskId))
      );
    }

    if (targetIndex === -1 && job.po) {
      targetIndex = targets.findIndex(t =>
        Array.isArray(t.tasks) && t.tasks.some(tk =>
          (tk.po && (tk.po === job.po || tk.po === job.basePo || job.po.startsWith(tk.po))) ||
          (Array.isArray(tk.assignedVendors) && tk.assignedVendors.some(av => av.po === job.po))
        )
      );
    }

    if (targetIndex === -1) {
      const sLang = (job.sourceLanguage || '').trim().toLowerCase();
      const tLang = (job.targetLanguages || job.targetLanguage || '').trim().toLowerCase();
      targetIndex = targets.findIndex(t => {
        const ts = (t.source || '').trim().toLowerCase();
        const tt = (t.target || '').trim().toLowerCase();
        return (!sLang || ts === sLang) && (!tLang || tt === tLang);
      });
      if (targetIndex === -1 && targets.length === 1) {
        targetIndex = 0;
      }
    }

    if (targetIndex === -1) {
      console.log(`[SequentialTransfer] Target language pair not found for job ${job.po || job._id}`);
      return null;
    }

    const currentTarget = targets[targetIndex];
    const tasks = currentTarget.tasks || [];
    if (tasks.length === 0) return null;

    // 4. Find current task in language pair
    let currentTaskIndex = -1;
    if (job.taskId) {
      currentTaskIndex = tasks.findIndex(tk => String(tk.id) === String(job.taskId));
    }
    if (currentTaskIndex === -1 && job.po) {
      currentTaskIndex = tasks.findIndex(tk =>
        (tk.po && (tk.po === job.po || tk.po === job.basePo || job.po.startsWith(tk.po))) ||
        (Array.isArray(tk.assignedVendors) && tk.assignedVendors.some(av => av.po === job.po))
      );
    }
    if (currentTaskIndex === -1 && (job.serviceType || job.jobType || job.service)) {
      const svc = (job.serviceType || job.jobType || job.service).trim().toLowerCase();
      currentTaskIndex = tasks.findIndex(tk => {
        const tkName = (tk.taskName || tk.type || tk.service || '').trim().toLowerCase();
        return tkName === svc;
      });
    }

    if (currentTaskIndex === -1) {
      console.log(`[SequentialTransfer] Current task not found in target for job ${job.po || job._id}`);
      return null;
    }

    // Record deliverables on the current task
    tasks[currentTaskIndex].deliveredFiles = formattedFiles;

    // 5. If this is the last task, all tasks in the language pair are done!
    if (currentTaskIndex >= tasks.length - 1) {
      await VMSProject.updateOne({ _id: project._id }, { $set: { targets } });
      console.log(`[SequentialTransfer] Task ${currentTaskIndex} is the final task in target ${currentTarget.source} -> ${currentTarget.target}. Deliverables recorded.`);
      return { completedAll: true, taskIndex: currentTaskIndex };
    }

    // 6. Transfer to next task in the language pair
    const nextTaskIndex = currentTaskIndex + 1;
    const nextTask = tasks[nextTaskIndex];

    nextTask.workingFiles = formattedFiles;
    nextTask.workingFile = formattedFiles[0] || null;
    nextTask.isWaitingForPrevious = false;
    nextTask.transferredFromTask = tasks[currentTaskIndex].taskName || tasks[currentTaskIndex].type || `Task ${currentTaskIndex + 1}`;
    // Its input files are here now, so an early-accepted next task comes off hold
    // (the Job itself flips in its pre-save hook below).
    if (nextTask.status === "On Hold") nextTask.status = "In Progress";
    (nextTask.assignedVendors || []).forEach(av => {
      if (av.status === "On Hold") av.status = "In Progress";
    });

    await VMSProject.updateOne({ _id: project._id }, { $set: { targets } });

    // 7. Find and update any existing Jobs for the next task
    const nextTaskScope = [];
    if (nextTask.id) nextTaskScope.push({ taskId: String(nextTask.id) });
    if (nextTask.po) {
      nextTaskScope.push({ po: nextTask.po });
      nextTaskScope.push({ basePo: nextTask.po });
      nextTaskScope.push({ po: new RegExp(`^${escapeRegExp(nextTask.po)}-`) });
    }
    if (Array.isArray(nextTask.assignedVendors)) {
      nextTask.assignedVendors.forEach(av => {
        if (av.po) nextTaskScope.push({ po: av.po });
      });
    }

    if (nextTaskScope.length > 0) {
      const projOr = [];
      if (project._id) projOr.push({ project: project._id });
      if (project.projectId) projOr.push({ projectId: project.projectId });

      const query = projOr.length > 0
        ? { $and: [{ $or: projOr }, { $or: nextTaskScope }] }
        : { $or: nextTaskScope };

      const nextJobs = await Job.find(query);

      for (const nj of nextJobs) {
        // Enforce strict language pair isolation: never transfer files to a job belonging to a different language pair
        if (nj.targetId && currentTarget.id && String(nj.targetId) !== String(currentTarget.id)) {
          console.log(`[SequentialTransfer] Skipping job ${nj.po} due to target mismatch (${nj.targetId} !== ${currentTarget.id})`);
          continue;
        }
        nj.workingFiles = formattedFiles;
        nj.isWaitingForPrevious = false;
        nj.previousTaskName = tasks[currentTaskIndex].taskName || tasks[currentTaskIndex].type || `Task ${currentTaskIndex + 1}`;
        await nj.save();
        console.log(`[SequentialTransfer] Updated next task Job ${nj.po} in language pair "${currentTarget.source} -> ${currentTarget.target}" with ${formattedFiles.length} transferred file(s)`);
      }
    }

    console.log(`[SequentialTransfer] Successfully transferred ${formattedFiles.length} file(s) from "${tasks[currentTaskIndex].taskName || tasks[currentTaskIndex].type}" to "${nextTask.taskName || nextTask.type}"`);
    return {
      transferredToTaskIndex: nextTaskIndex,
      transferredTaskName: nextTask.taskName || nextTask.type,
      fileCount: formattedFiles.length
    };
  } catch (error) {
    console.error('[SequentialTransfer] Error transferring files to next task:', error);
    return null;
  }
}

/**
 * Checks whether a given task is the first task or a subsequent task in the language pair,
 * and whether it should wait for the previous task's deliverables.
 */
export async function getSequentialTaskContext(projectId, targetId, taskId, taskService = '') {
  try {
    if (!projectId) return { isFirstTask: true, isWaitingForPrevious: false, workingFiles: [] };

    const project = await VMSProject.findOne({
      $or: [
        { projectId: projectId },
        ...(mongoose.isValidObjectId(projectId) ? [{ _id: projectId }] : [])
      ]
    });

    if (!project || !project.targets || project.targets.length === 0) {
      return { isFirstTask: true, isWaitingForPrevious: false, workingFiles: [] };
    }

    let target = project.targets.find(t => String(t.id) === String(targetId));
    if (!target) target = project.targets[0];
    const tasks = target?.tasks || [];
    if (tasks.length === 0) {
      return { isFirstTask: true, isWaitingForPrevious: false, workingFiles: [] };
    }

    let idx = tasks.findIndex(tk => String(tk.id) === String(taskId));
    if (idx === -1 && taskService) {
      const svc = taskService.trim().toLowerCase();
      idx = tasks.findIndex(tk => (tk.taskName || tk.type || '').trim().toLowerCase() === svc);
    }
    if (idx === -1) idx = 0;

    const isFirstTask = idx === 0;
    if (isFirstTask) {
      return {
        taskIndex: 0,
        isFirstTask: true,
        isWaitingForPrevious: false,
        workingFiles: project.workingFiles || []
      };
    }

    // Subsequent task: check previous task
    const prevTask = tasks[idx - 1];
    let prevDelivered = prevTask?.deliveredFiles || [];

    // If not found on project task, check previous task's Job
    if (prevDelivered.length === 0 && (prevTask?.id || prevTask?.po)) {
      // Scoped to this project so another project's task can never unlock this one.
      const prevJob = await Job.findOne({
        $and: [
          { $or: [{ project: project._id }, ...(project.projectId ? [{ projectId: project.projectId }] : [])] },
          {
            $or: [
              ...(prevTask.id ? [{ taskId: String(prevTask.id) }] : []),
              ...(prevTask.po ? [{ po: prevTask.po }, { basePo: prevTask.po }] : [])
            ]
          }
        ],
        vendorStatus: { $in: ["Completed", "Accepted", "Pending Review"] }
      });
      if (prevJob?.deliveredFiles?.length > 0) {
        prevDelivered = prevJob.deliveredFiles;
      }
    }

    const hasPreviousDelivered = prevDelivered.length > 0;
    return {
      taskIndex: idx,
      isFirstTask: false,
      isWaitingForPrevious: !hasPreviousDelivered,
      previousTaskName: prevTask?.taskName || prevTask?.type || `Task ${idx}`,
      workingFiles: hasPreviousDelivered ? prevDelivered : []
    };
  } catch (err) {
    console.error('[SequentialTransfer] Error in getSequentialTaskContext:', err);
    return { isFirstTask: true, isWaitingForPrevious: false, workingFiles: [] };
  }
}
