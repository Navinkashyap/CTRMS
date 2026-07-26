import express from "express";
import Job from "../../models/Job.js";
import Invoice from "../../models/Invoice.js";
import vmsAuth from "../middleware/vmsAuth.js";

const router = express.Router();
router.use(vmsAuth);

// GET /api/vms/vendor/dashboard/:code
router.get("/dashboard/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    
    // 1. Calculate Stats
    const jobOffers = await Job.countDocuments({ vendorCode: code, vendorStatus: "Pending" });
    const inProgress = await Job.countDocuments({ vendorCode: code, vendorStatus: "In Progress" });
    const completed = await Job.countDocuments({ vendorCode: code, vendorStatus: "Completed" });
    const pendingInvoices = await Invoice.countDocuments({ supplierNo: code, status: "Pending" });
    
    // 2. Fetch Recent Job Offers
    const rawOffers = await Job.find({ vendorCode: code, vendorStatus: "Pending" })
      .sort({ createdAt: -1 })
      .limit(5);
      
    const recentOffers = rawOffers.map(job => ({
      id: job._id,
      title: job.projectName || job.po || "New Job Offer",
      lang: job.lang || (job.sourceLanguage ? `${job.sourceLanguage} → ${job.targetLanguages}` : "N/A"),
      date: job.deadline || job.createdAt
    }));
    
    // 3. Fetch Recent Activities (Mix of recently updated jobs/invoices)
    const recentJobs = await Job.find({ vendorCode: code })
      .sort({ updatedAt: -1 })
      .limit(5);
      
    const activities = recentJobs.map(job => {
      let action = `Job ${job.po} updated`;
      if (job.vendorStatus === "Pending") action = `New job offer received: ${job.po}`;
      else if (job.vendorStatus === "In Progress") action = `Started working on job ${job.po}`;
      else if (job.vendorStatus === "Completed") action = `Completed job ${job.po}`;
      
      return {
        action,
        time: job.updatedAt
      };
    });

    res.json({
      stats: {
        jobOffers,
        inProgress,
        completed,
        pendingInvoices
      },
      recentOffers,
      activities
    });
  } catch (error) {
    next(error);
  }
});

export default router;
