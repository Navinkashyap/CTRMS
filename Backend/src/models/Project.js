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
  targetLanguage: { type: mongoose.Schema.Types.ObjectId, ref: "Language" },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  tasks: [TaskSchema],
});

const ProjectSchema = new mongoose.Schema(
  {
    // Common / AddProject Info
    projectName: { type: String, required: true, trim: true },
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
    gstPercent: { type: Number, default: 18 },
    otherCharges: { type: Number, default: 0 },
    otherChargesLabel: { type: String, trim: true, default: "None" },
    sourceLanguage: { type: mongoose.Schema.Types.ObjectId, ref: "Language" },
    targets: [TargetSchema],

    // ViewProject - Remark Tab
    remark: { type: String, trim: true },
  },
  { timestamps: true }
);

ProjectSchema.pre("save", async function (next) {
  if (!this.projectId) {
    const count = await mongoose.model("Project").countDocuments();
    this.projectId = `PT2526${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

export default mongoose.model("Project", ProjectSchema);
