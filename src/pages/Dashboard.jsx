import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Download,
  Plus,
  FileText,
  PieChart,
  Settings,
  ChevronDown,
  ArrowRight,
  Zap,
  Briefcase,
  UserCheck,
  Clock,
  AlertCircle
} from "lucide-react";
import { getDashboardData, getChartData } from "../lib/dashboardApi";

// Sparkline SVG Component for Stat Cards
const Sparkline = ({ color, data }) => (
  <svg viewBox="0 0 100 30" className="w-16 h-8 overflow-visible" preserveAspectRatio="none">
    <path
      d={data}
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="drop-shadow-md"
    />
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMetric, setActiveMetric] = useState("Total Projects");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    projectsCount: 0,
    pendingProjects: 0,
    completedProjects: 0,
    clientsCount: 0,
    vendorsCount: 0,
    invoicesCount: 0,
    totalRevenue: 0,
    upcomingDeadlines: [],
    unpaidInvoices: [],
    topClients: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [chartGraphics, setChartGraphics] = useState({ path: "", stroke: "", dots: [], labels: [] });

  const generateChartGraphics = (data) => {
    if (!data || data.length === 0) return { path: "", stroke: "", dots: [], labels: [] };
    const width = 800;
    const height = 240;
    const paddingY = 40; 
    const drawHeight = height - paddingY * 2;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const stepX = width / Math.max(data.length - 1, 1);
    
    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = paddingY + drawHeight - ((d.value / maxVal) * drawHeight);
      return { x, y, val: d.value >= 1000 ? (d.value/1000).toFixed(1)+'k' : d.value.toString(), label: d.label };
    });

    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C${cx},${prev.y} ${cx},${curr.y} ${curr.x},${curr.y}`;
    }

    return { 
      path: `${d} L${width},${height} L0,${height} Z`, 
      stroke: d, 
      dots: points, 
      labels: points.map(p => p.label) 
    };
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await getChartData(activeMetric, dateRange);
        if (res.success && res.data) {
          setChartGraphics(generateChartGraphics(res.data));
        }
      } catch (err) {
        console.error("Error fetching chart data", err);
      }
    };
    fetchChartData();
  }, [activeMetric, dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDashboardData(dateRange);
        if (res.success && res.data) {
          setDashboardData(res.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const stats = [
    {
      label: "Total Projects",
      value: dashboardData.projectsCount,
      subStats: { pending: dashboardData.pendingProjects, completed: dashboardData.completedProjects },
      trend: "+14.5%",
      isUp: true,
      color: "#6366f1",
      data: "M0 25 Q 15 20, 30 25 T 60 15 T 80 5 T 100 10",
      icon: Briefcase,
      gradient: "from-indigo-500 to-blue-600",
      path: "/projects",
    },
    { label: "Total Clients", value: dashboardData.clientsCount, trend: "+8.4%", isUp: true, color: "#06b6d4", data: "M0 25 L 20 20 L 40 22 L 60 10 L 80 15 L 100 5", icon: Users, gradient: "from-cyan-500 to-blue-500", path: "/clients" },
    {
      label: "Total Revenue",
      value: `₹${(dashboardData.totalRevenue || 0).toLocaleString()}`,
      subStats: { invoicesCount: dashboardData.invoicesCount },
      trend: "+1.2%",
      isUp: true,
      color: "#8b5cf6",
      data: "M0 20 Q 20 5, 40 15 T 70 20 T 100 5",
      icon: DollarSign,
      gradient: "from-purple-500 to-violet-600",
      path: "/invoice",
    },
    { label: "Total Vendors", value: dashboardData.vendorsCount, trend: "+3.1%", isUp: true, color: "#ec4899", data: "M0 10 Q 20 25, 40 15 T 70 5 T 100 20", icon: UserCheck, gradient: "from-pink-500 to-rose-600", path: "/vendors" },
  ];

  const quickActions = [
    { name: "Add Client", icon: Plus, color: "bg-blue-600", shadow: "shadow-blue-200", path: "/clients/add-client" },
    { name: "Create Invoice", icon: FileText, color: "bg-purple-600", shadow: "shadow-purple-200", path: "/invoice" },
    { name: "Add Project", icon: Briefcase, color: "bg-indigo-600", shadow: "shadow-indigo-200", path: "/projects/add-project" },
    { name: "Settings", icon: Settings, color: "bg-slate-700", shadow: "shadow-slate-300", path: "/menus" },
  ];

  const { activities, upcomingDeadlines, unpaidInvoices, topClients } = dashboardData;

  const handleExport = () => {
    alert("System Intelligence Report is being generated. Your download will start shortly.");
  };

  return (
    <div className="font-sans text-slate-900 pb-10 min-h-screen bg-transparent">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-8 animate-in fade-in duration-1000 p-4 md:p-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent italic">
              System Overview
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Real-time analytics for your business architecture.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowDateDropdown(!showDateDropdown)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <Calendar className="w-4 h-4 opacity-70" />
                {dateRange}
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showDateDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDateDropdown && (
                <div className="absolute right-0 top-[calc(100%+8px)] bg-white/90 backdrop-blur-2xl border border-white rounded-2xl min-w-[180px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 flex flex-col gap-1">
                    {["Today", "Last 7 Days", "Last 30 Days", "Last 12 Months", "All Time"].map((range) => (
                      <button
                        key={range}
                        onClick={() => { setDateRange(range); setShowDateDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all ${dateRange === range ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 hover:translate-y-[-2px] transition-all shadow-xl shadow-indigo-200 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              onClick={() => setActiveMetric(stat.label)}
              className={`group relative bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 border transition-all duration-500 cursor-pointer overflow-hidden ${activeMetric === stat.label
                  ? 'border-indigo-400 ring-2 ring-indigo-500/10 shadow-indigo-200/40 shadow-2xl translate-y-[-4px]'
                  : 'border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-100 hover:translate-y-[-4px]'
                }`}
            >
              {/* Animated Background Glow */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-700`} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${activeMetric === stat.label ? 'scale-110 shadow-indigo-200' : 'shadow-slate-100 group-hover:scale-110'
                    } transition-transform duration-500`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl ${stat.isUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stat.trend}
                    </span>
                    {/* Open the full list for this metric, without disturbing the card's own click-to-chart behavior */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate(stat.path); }}
                      title={`Open ${stat.label}`}
                      className="w-7 h-7 shrink-0 rounded-xl bg-white/80 border border-slate-100 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:border-indigo-200 hover:bg-white transition-all shadow-sm"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-slate-600 text-[11px] font-black uppercase tracking-[0.2em] mb-1 pl-1">{stat.label}</h3>
                <div className="flex items-end justify-between px-1">
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    {loading ? "..." : stat.value}
                  </p>
                  <div className={`transition-all duration-500 translate-x-2 group-hover:translate-x-0 ${activeMetric === stat.label ? 'opacity-100 translate-x-0 scale-110' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Sparkline color={stat.color} data={stat.data} />
                  </div>
                </div>
                {stat.subStats && stat.subStats.pending !== undefined && !loading && (
                  <div className="flex justify-between mt-4 px-1 pt-3 border-t border-slate-100/60">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.subStats.completed} Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.subStats.pending} Pending</span>
                    </div>
                  </div>
                )}
                {stat.subStats && stat.subStats.invoicesCount !== undefined && !loading && (
                  <div className="flex justify-between mt-4 px-1 pt-3 border-t border-slate-100/60">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.subStats.invoicesCount} Invoices Generated</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] sm:rounded-[3rem] border border-white shadow-2xl shadow-slate-200/60 p-6 sm:p-10 relative overflow-hidden group">
              {/* Premium Header Decoration */}
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 relative z-10 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">{activeMetric} Analysis</h3>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-tighter animate-in fade-in zoom-in duration-500" key={activeMetric}>
                      Live
                    </span>
                  </div>
                  <p className="text-slate-500 font-bold text-[13px] tracking-wide uppercase opacity-70">Metric tracking • {dateRange}</p>
                </div>
                <div className="flex bg-slate-100/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/50">
                  {['1D', '7D', '30D', '12M'].map((t) => (
                    <button 
                      key={t} 
                      onClick={() => {
                        if (t === '1D') setDateRange('Today');
                        else if (t === '7D') setDateRange('Last 7 Days');
                        else if (t === '30D') setDateRange('Last 30 Days');
                        else if (t === '12M') setDateRange('Last 12 Months');
                      }}
                      className={`px-5 py-2 text-[11px] font-black rounded-xl transition-all ${(t === '1D' && dateRange === 'Today') || (t === '7D' && dateRange === 'Last 7 Days') || (t === '30D' && dateRange === 'Last 30 Days') || (t === '12M' && dateRange === 'Last 12 Months')
                        ? 'bg-white text-indigo-600 shadow-md transform scale-[1.05]'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[360px] w-full relative">
                <div className="absolute inset-0 flex flex-col justify-between pt-4 pb-12">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full border-b border-slate-100/80 border-dashed relative">
                      <span className="absolute -left-2 -top-2.5 bg-white/40 backdrop-blur-sm px-2 text-[10px] font-black text-slate-600 uppercase">
                        {5000 - i * 1000}
                      </span>
                    </div>
                  ))}
                </div>

                <svg className="absolute inset-x-0 top-0 bottom-0 w-full h-full pt-4 pb-12 ml-6 pr-4" viewBox="0 0 800 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  <path
                    fill="url(#chartGradient)"
                    d={chartGraphics.path || ""}
                    className="transition-all duration-700 ease-in-out"
                  />
                  <path
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="5"
                    strokeLinecap="round"
                    filter="url(#chartGlow)"
                    d={chartGraphics.stroke || ""}
                    className="transition-all duration-700 ease-in-out"
                    strokeDasharray="1000"
                    strokeDashoffset="0"
                  />

                  {chartGraphics.dots.map((pt, i) => (
                    <g key={i} className="group/dot cursor-pointer">
                      <circle cx={pt.x} cy={pt.y} r="8" fill="#fff" stroke="#6366f1" strokeWidth="4" className="shadow-2xl" />
                      <circle cx={pt.x} cy={pt.y} r="14" fill="#6366f1" className="opacity-0 group-hover/dot:opacity-20 transition-all duration-300 transform group-hover/dot:scale-125" />

                      {/* Tooltip on hover */}
                      <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <rect x={pt.x - 30} y={pt.y - 45} width="60" height="30" rx="10" fill="#1e293b" />
                        <text x={pt.x} y={pt.y - 25} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="900">{pt.val}</text>
                      </g>
                    </g>
                  ))}
                </svg>

                <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[11px] font-black text-slate-600 uppercase tracking-widest px-4 translate-y-2">
                  {chartGraphics.labels.map((label, i) => <span key={i}>{label}</span>)}
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => action.path ? navigate(action.path) : alert(`${action.name} functionality coming soon.`)}
                  className="group flex flex-col items-center justify-center p-8 bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50 hover:translate-y-[-4px] transition-all duration-300 outline-none"
                >
                  <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center text-white mb-4 shadow-xl ${action.shadow} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-black text-slate-700 tracking-tight">{action.name}</span>
                </button>
              ))}
            </div>

            {/* Upcoming Deadlines & Unpaid Invoices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Upcoming Deadlines */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl shadow-slate-200/60 p-8 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shadow-inner">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Upcoming Deadlines</h3>
                </div>
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-sm font-bold text-slate-500 text-center py-4">No upcoming deadlines.</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingDeadlines.map((p, i) => {
                      const date = new Date(p.deadline || p.dueDate);
                      const isOverdue = date < new Date();
                      return (
                        <div key={i} onClick={() => navigate(`/projects/view/${p._id || p.projectId}`)} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-amber-100 transition-all cursor-pointer">
                          <div>
                            <p className="text-sm font-black text-slate-800">{p.projectName || p.projectId}</p>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Due: {date.toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                            {isOverdue ? 'Overdue' : 'Upcoming'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Unpaid Invoices */}
              <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl shadow-slate-200/60 p-8 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shadow-inner">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Unpaid Invoices</h3>
                </div>
                {unpaidInvoices.length === 0 ? (
                  <p className="text-sm font-bold text-slate-500 text-center py-4">All invoices are paid.</p>
                ) : (
                  <div className="space-y-4">
                    {unpaidInvoices.map((inv, i) => (
                      <div key={i} onClick={() => navigate(`/invoice`)} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-rose-100 transition-all cursor-pointer">
                        <div>
                          <p className="text-sm font-black text-slate-800">{inv.invoiceNumber}</p>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">{inv.client?.companyName || inv.client?.clientName || 'Client'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-800">₹{(inv.totalAmount || 0).toLocaleString()}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${inv.status?.toLowerCase() === 'overdue' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'}`}>
                            {inv.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Sidebar Section */}
          <div className="space-y-8">
            {/* Activity Feed */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl shadow-slate-200/60 p-8 sm:p-10 relative">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Pulse Feed</h3>
                <button
                  onClick={() => navigate("/report")}
                  className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-indigo-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all outline-none"
                >
                  Live View
                </button>
              </div>

              <div className="space-y-10 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100/50">
                {activities.map((item, i) => (
                  <div key={i} className="flex gap-6 group scale-100 hover:scale-[1.05] transition-all duration-300 cursor-pointer" onClick={() => navigate("/report")}>
                    <div className="relative z-10">
                      <div className={`w-4 h-4 rounded-full ${item.dot} ring-[6px] ring-white shadow-lg group-hover:scale-125 group-hover:shadow-indigo-200 transition-all`}></div>
                    </div>
                    <div className="pb-1">
                      <p className="text-[15px] font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">{item.title}</p>
                      <p className="text-sm font-bold text-slate-500 mt-1 leading-relaxed opacity-80">{item.desc}</p>
                      <div className="flex items-center gap-3 mt-4">
                        <div className="h-[1px] w-4 bg-slate-200 group-hover:w-8 transition-all" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                          {item.time}
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-[#1a1c31] backdrop-blur-2xl rounded-[3rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 sm:p-10 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors duration-1000" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/20 shadow-inner">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight italic">Top Clients</h3>
                </div>

                {topClients.length === 0 ? (
                  <p className="text-sm font-bold text-slate-400 text-center py-4">No client data available.</p>
                ) : (
                  <div className="space-y-4">
                    {topClients.map((client, i) => (
                      <div key={i} className="flex items-center justify-between group/item p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/10" onClick={() => navigate(`/clients`)}>
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${i === 0 ? 'bg-amber-400 text-amber-900' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-slate-800 text-slate-300'}`}>
                            #{i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-200 group-hover/item:text-cyan-400 transition-colors">{client.companyName || client.clientName || 'Unknown Client'}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{client.clientType || 'Corporate'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">₹{(client.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
