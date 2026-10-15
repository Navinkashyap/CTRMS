import mongoose from "mongoose";

// `id` has to be declared (and the `id` virtual turned off) or Mongoose treats it as
// the built-in _id alias and drops the client-side id the PM form matches tasks on —
// which left saved tasks unmatchable after a reload, losing their assigned vendor.
const TaskSchema = new mongoose.Schema(
  { id: { type: mongoose.Schema.Types.Mixed } },
  { strict: false, id: false }
);

const TargetSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    source: { type: String, trim: true, default: "English" },
    target: { type: String, trim: true, default: "Hindi" },
    tasks: { type: [TaskSchema], default: [] },
  },
  { strict: false }
);

const FileRefSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    name: { type: String, trim: true, default: "" },
    // Path under /uploads served by the API; empty for legacy rows that only
    // ever captured a filename.
    url: { type: String, trim: true, default: "" },
  },
  { strict: false, _id: false }
);

// A link the PM hands back to sales alongside (or instead of) uploaded files.
// Unlike Job.deliveredLinks these carry a title, so they're objects, not strings.
const DeliveredLinkSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    name: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { strict: false, _id: false }
);

const VMSProjectSchema = new mongoose.Schema(
  {
    projectId: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    client: { type: String, trim: true, default: "" },
    projectType: { type: String, trim: true, default: "Translation" },
    lang: { type: String, trim: true, default: "" },
    sourceLang: { type: String, trim: true, default: "English" },
    targetLang: { type: String, trim: true, default: "Hindi" },
    startDate: { type: String, trim: true, default: "" },
    deadline: { type: String, trim: true, default: "" },
    status: { type: String, default: "Not Started" },
    priority: { type: String, default: "Normal" },
    description: { type: String, trim: true, default: "" },
    instructions: { type: String, trim: true, default: "" },
    clientContact: { type: String, trim: true, default: "" },
    clientPo: { type: String, trim: true, default: "" },
    clientProjectCode: { type: String, trim: true, default: "" },
    amount: { type: String, trim: true, default: "" },
    currency: { type: String, trim: true, default: "INR" },
    dueTime: { type: String, trim: true, default: "" },
    isProgramGroup: { type: Boolean, default: false },
    programName: { type: String, trim: true, default: "" },
    translationTool: { type: String, trim: true, default: "" },
    subjectMatter: { type: String, trim: true, default: "" },
    deliverable: { type: String, trim: true, default: "" },
    gstEnabled: { type: Boolean, default: false },
    gstPercentage: { type: Number, default: 18 },
    otherCharges: { type: Number, default: 0 },
    otherChargesLabel: { type: String, trim: true, default: "None" },
    targets: { type: [TargetSchema], default: [] },
    referenceFiles: { type: [FileRefSchema], default: [] },
    workingFiles: { type: [FileRefSchema], default: [] },
    manager: { type: String, trim: true, default: "" },
    assignedVendor: { type: String, trim: true, default: "" },
    assignedDate: { type: String, trim: true, default: "" },

    // The project exactly as sales/admin sent it. The PM reworks `targets`,
    // files and instructions freely; these keep the original brief readable on
    // the Sales tab. Snapshotted on accept (see vmsProjectRoutes).
    salesTargets: { type: [TargetSchema], default: [] },
    salesReferenceFiles: { type: [FileRefSchema], default: [] },
    salesWorkingFiles: { type: [FileRefSchema], default: [] },
    salesInstructions: { type: String, trim: true, default: "" },

    // Per-task delivery uploads on the PM's project view, keyed by the
    // frontend's delivery key (target/task) → list of files.
    deliveryFiles: { type: mongoose.Schema.Types.Mixed, default: {} },

    // What the PM delivers back to sales when closing the project (PMSales).
    // The sales* twins are what the frontend sends alongside; both are kept so
    // either name reads back.
    deliveredFiles: { type: [FileRefSchema], default: [] },
    salesDeliveredFiles: { type: [FileRefSchema], default: [] },
    deliveredLinks: { type: [DeliveredLinkSchema], default: [] },
    salesDeliveredLinks: { type: [DeliveredLinkSchema], default: [] },
    notesForPm: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    completedDate: { type: String, trim: true, default: "" },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("VMSProject", VMSProjectSchema);
