import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  taskName: { type: String, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  unit: { type: String, trim: true, default: "Words" },
  quantity: { type: Number, default: 0 },
  rate: { type: Number, default: 0 },
  currency: { type: String, trim: true },
  fees: { type: Number, default: 0 },
  status: { type: String, default: "Not Started" },
});

const TargetSchema = new mongoose.Schema({
  sourceLanguage: { type: mongoose.Schema.Types.ObjectId, ref: "Language" },
  targetLanguage: { type: mongoose.Schema.Types.ObjectId, ref: "Language" },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  tasks: [TaskSchema],
});

const ProjectSchema = new mongoose.Schema(
  {
    // Common / AddProject Info
    projectName: { type: String, required: true, trim: true },
    projectCode: { type: String, trim: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    manager: { type: String, trim: true }, // Usually from Contacts or Admins
    budget: { type: String, trim: true },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    deadline: { type: Date },
    progress: { type: Number, default: 0 },
    status: { type: String, default: "Not Started" },

    // ViewProject - Project Tab
    projectId: { type: String, unique: true }, // E.g. PT25260050
    jobType: { type: String, trim: true },
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    source: { type: String, enum: ["Inhouse", "Outsource"], default: "Outsource" },
    type: { type: String, enum: ["Extended", "Non Extended"], default: "Non Extended" },
    projectStatus: { type: String, default: "In Progress" },
    receivingDate: { type: Date },
    dueDate: { type: Date },
    dueTime: { type: String, trim: true },
    dateOfDelivery: { type: Date },

    // ViewProject - Company Tab
    clientContact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
    clientPO: { type: String, trim: true },
    clientProjectCode: { type: String, trim: true },
    isProgramGroup: { type: Boolean, default: false },
    programName: { type: String, trim: true },
    amount: { type: String, trim: true },
    description: { type: String, trim: true },

    // ViewProject - Translations Tab
    translationTool: { type: String, trim: true },
    subjectMatter: { type: String, trim: true },
    deliverable: { type: String, trim: true },
    gstEnabled: { type: Boolean, default: false },
    cgstPercent: { type: Number, default: 9 },
    sgstPercent: { type: Number, default: 9 },
    igstPercent: { type: Number, default: 18 },
    gstPercent: { type: Number, default: 18 },
    otherCharges: { type: Number, default: 0 },
    otherChargesLabel: { type: String, trim: true, default: "None" },
    sourceLanguage: { type: mongoose.Schema.Types.ObjectId, ref: "Language" },
    targets: [TargetSchema],

    // Uploaded files, each { name, url }. Typed Mixed rather than a subdocument
    // so legacy rows — which stored a bare filename string — still hydrate
    // instead of throwing a CastError. normalizeProjectFiles() in the routes
    // coerces both shapes to the object form.
    referenceFiles: { type: [mongoose.Schema.Types.Mixed], default: [] },
    workingFiles: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // ViewProject - Remark Tab
    remark: { type: String, trim: true },
  },
  { timestamps: true }
);

ProjectSchema.pre("save", async function (next) {
  if (!this.projectId) {
    const lastProject = await mongoose
      .model("Project")
      .findOne({ projectId: { $regex: /^PT2526\d{4}$/ } })
      .sort({ projectId: -1 })
      .select("projectId")
      .lean();
    const lastNumber = lastProject ? parseInt(lastProject.projectId.slice(-4), 10) : 0;
    this.projectId = `PT2526${String(lastNumber + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Project", ProjectSchema);
