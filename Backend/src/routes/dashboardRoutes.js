import express from "express";
import Project from "../models/Project.js";
import Client from "../models/Client.js";
import Invoice from "../models/Invoice.js";
import Vendor from "../models/Vendor.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { range } = req.query;
    let startDate;
    if (range === "Today") {
      startDate = new Date();
      startDate.setHours(0,0,0,0);
    } else if (range === "Last 7 Days") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0,0,0,0);
    } else if (range === "Last 30 Days") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0,0,0,0);
    } else if (range === "Last 12 Months") {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0,0,0,0);
    }

    const matchQuery = startDate ? { createdAt: { $gte: startDate } } : {};
    const invoiceMatchQuery = startDate ? { invoiceDate: { $gte: startDate } } : {};

    // Basic Counts
    const projectsCount = await Project.countDocuments(matchQuery);
    const clientsCount = await Client.countDocuments(matchQuery);
    const vendorsCount = await Vendor.countDocuments(matchQuery);
    const invoicesCount = await Invoice.countDocuments(invoiceMatchQuery);

    // Projects specific calculations
    const completedProjects = await Project.countDocuments({
      ...matchQuery,
      $or: [
        { status: { $regex: /^completed$/i } },
        { projectStatus: { $regex: /^completed$/i } }
      ]
    });
    const pendingProjects = projectsCount - completedProjects;

    // Upcoming deadlines (Top 5 closest future deadlines)
    const upcomingDeadlines = await Project.find({
      $and: [
        { status: { $not: { $regex: /^completed$/i } } },
        { projectStatus: { $not: { $regex: /^completed$/i } } },
        {
          $or: [
            { deadline: { $exists: true, $ne: null } },
            { dueDate: { $exists: true, $ne: null } }
          ]
        }
      ]
    })
    .sort({ deadline: 1, dueDate: 1 })
    .limit(5);

    // Invoices calculations
    const totalRevenueResult = await Invoice.aggregate([
      { $match: invoiceMatchQuery },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    // Unpaid Invoices
    const unpaidInvoices = await Invoice.find({
      status: { $regex: /^(pending|overdue|draft)$/i } // Exclude Paid
    })
    .populate("client", "clientName companyName")
    .sort({ createdAt: -1, invoiceDate: -1 })
    .limit(5);

    // Top Clients by Revenue
    const topClientsAggregation = await Invoice.aggregate([
      {
        $group: {
          _id: "$client",
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "clientDetails"
        }
      },
      { $unwind: "$clientDetails" }
    ]);

    const topClients = topClientsAggregation.map(item => ({
      ...item.clientDetails,
      totalRevenue: item.totalRevenue
    }));

    // Activities
    const latestProjects = await Project.find().sort({ createdAt: -1 }).limit(2);
    const latestClients = await Client.find().sort({ createdAt: -1 }).limit(2);
    
    let activities = [];
    latestProjects.forEach(p => {
      activities.push({
        title: "New Project Added",
        desc: p.projectName || p.projectCode || "A new project was created",
        time: "Recently",
        dot: "bg-indigo-500",
        date: p.createdAt || new Date()
      });
    });
    latestClients.forEach(c => {
      activities.push({
        title: "New Client Onboarded",
        desc: c.companyName || c.clientName || "A new client registered",
        time: "Recently",
        dot: "bg-emerald-500",
        date: c.createdAt || new Date()
      });
    });
    
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activities.length === 0) {
      activities = [
        { title: "System Ready", desc: "Awaiting new activities...", time: "Just now", dot: "bg-slate-400" },
        { title: "Server Maintenance", desc: "Routine backup and update completed.", time: "2d ago", dot: "bg-slate-300" },
      ];
    }

    res.json({
      success: true,
      data: {
        projectsCount,
        pendingProjects,
        completedProjects,
        clientsCount,
        vendorsCount,
        invoicesCount,
        totalRevenue,
        upcomingDeadlines,
        unpaidInvoices,
        topClients,
        activities
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, message: "Error fetching dashboard statistics" });
  }
});

const getChartAggregation = async (Model, dateField, range, isSumAmount = false) => {
  const now = new Date();
  let startDate;
  let formatString;
  let slots = [];
  
  if (range === "Today") {
    startDate = new Date(now.setHours(0,0,0,0));
    formatString = "%H"; 
    for (let i = 0; i <= 23; i++) slots.push(String(i).padStart(2, '0'));
  } else if (range === "Last 7 Days") {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0,0,0,0);
    formatString = "%Y-%m-%d";
    for (let i = 0; i < 7; i++) {
      let d = new Date(startDate);
      d.setDate(d.getDate() + i);
      slots.push(d.toISOString().split('T')[0]);
    }
  } else if (range === "Last 30 Days") {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0,0,0,0);
    formatString = "%Y-%m-%d";
    for (let i = 0; i < 30; i++) {
      let d = new Date(startDate);
      d.setDate(d.getDate() + i);
      slots.push(d.toISOString().split('T')[0]);
    }
  } else if (range === "Last 12 Months") {
    startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0,0,0,0);
    formatString = "%Y-%m";
    for (let i = 0; i < 12; i++) {
      let d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      slots.push(d.toISOString().slice(0, 7));
    }
  }

  const matchStage = startDate ? { [dateField]: { $gte: startDate } } : {};
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: formatString, date: `$${dateField}` } },
        value: isSumAmount ? { $sum: "$totalAmount" } : { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const results = await Model.aggregate(pipeline);
  
  const dataMap = {};
  results.forEach(r => { dataMap[r._id] = r.value });

  const finalData = slots.map(slot => {
    let label = slot;
    if (range === "Today") {
      label = `${slot}:00`;
    } else if (range === "Last 7 Days" || range === "Last 30 Days") {
      const d = new Date(slot);
      label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (range === "Last 12 Months") {
      const d = new Date(slot + "-01");
      label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    
    return {
      label,
      value: dataMap[slot] || 0
    };
  });

  return finalData;
};

router.get("/chart", async (req, res) => {
  try {
    const { metric, range } = req.query;
    let Model;
    let dateField = "createdAt";
    let isSumAmount = false;

    if (metric === "Total Projects") Model = Project;
    else if (metric === "Total Clients") Model = Client;
    else if (metric === "Total Revenue") {
      Model = Invoice;
      dateField = "invoiceDate";
      isSumAmount = true;
    }
    else if (metric === "Total Vendors") Model = Vendor;
    else return res.status(400).json({ success: false, message: "Invalid metric" });

    // Handle "All Time" by default defaulting to Last 12 Months for simplicity
    const activeRange = range === "All Time" ? "Last 12 Months" : (range || "Last 30 Days");
    
    const chartData = await getChartAggregation(Model, dateField, activeRange, isSumAmount);

    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ success: false, message: "Error fetching chart data" });
  }
});

export default router;
