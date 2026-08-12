import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({}, { strict: false });

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
    gstEnabled: { type: Boolean, default: false },
    gstPercentage: { type: Number, default: 18 },
    targets: { type: [TargetSchema], default: [] },
    referenceFiles: { type: [FileRefSchema], default: [] },
    workingFiles: { type: [FileRefSchema], default: [] },
    manager: { type: String, trim: true, default: "" },
    assignedVendor: { type: String, trim: true, default: "" },
    assignedDate: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("VMSProject", VMSProjectSchema);
