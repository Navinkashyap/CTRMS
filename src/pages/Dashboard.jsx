import React, { useState } from "react";
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
  Zap
} from "lucide-react";

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
  const [activeMetric, setActiveMetric] = useState("Revenue");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const stats = [
    { label: "Revenue", value: "$124,500", trend: "+14.5%", isUp: true, color: "#6366f1", data: "M0 25 Q 15 20, 30 25 T 60 15 T 80 5 T 100 10", icon: DollarSign, gradient: "from-indigo-500 to-blue-600" },
    { label: "Clients", value: "1,204", trend: "+8.4%", isUp: true, color: "#06b6d4", data: "M0 25 L 20 20 L 40 22 L 60 10 L 80 15 L 100 5", icon: Users, gradient: "from-cyan-500 to-blue-500" },
    { label: "Performance", value: "98.2%", trend: "+1.2%", isUp: true, color: "#10b981", data: "M0 20 Q 20 5, 40 15 T 70 20 T 100 5", icon: Zap, gradient: "from-emerald-500 to-teal-600" },
    { label: "Tasks", value: "24", trend: "-2.1%", isUp: false, color: "#f59e0b", data: "M0 5 Q 20 15, 40 5 T 70 20 T 100 25", icon: Activity, gradient: "from-amber-500 to-orange-600" },
  ];

  const quickActions = [
    { name: "Add Client", icon: Plus, color: "bg-blue-600", shadow: "shadow-blue-200", path: "/clients/add-client" },
    { name: "Create Invoice", icon: FileText, color: "bg-purple-600", shadow: "shadow-purple-200", path: "/invoice" },
    { name: "Analytics", icon: PieChart, color: "bg-indigo-600", shadow: "shadow-indigo-200", path: "/report" },
    { name: "Settings", icon: Settings, color: "bg-slate-700", shadow: "shadow-slate-300", path: "/menus" },
  ];

  const activities = [
    { title: "Invoice #INV-2026 Paid", desc: "TechCorp settled their outstanding balance.", time: "2h ago", dot: "bg-emerald-500" },
    { title: "New Client Onboarded", desc: "Global Industries LLC added to CRM.", time: "5h ago", dot: "bg-blue-500" },
    { title: "Milestone Approved", desc: "Website redesign phase 1 signed off.", time: "1d ago", dot: "bg-indigo-500" },
    { title: "Server Maintenance", desc: "Routine backup and update completed.", time: "2d ago", dot: "bg-slate-400" },
  ];

  const chartPaths = {
    Revenue: "M0,180 C100,180 150,60 250,90 C350,120 450,20 550,50 C650,80 750,10 800,30 L800,220 L0,220 Z",
    Clients: "M0,200 C150,150 250,180 400,100 C500,60 650,120 800,40 L800,220 L0,220 Z",
    Performance: "M0,100 C200,80 400,120 600,60 C700,40 750,50 800,30 L800,220 L0,220 Z",
    Tasks: "M0,50 C100,80 250,40 400,120 C550,160 700,100 800,180 L800,220 L0,220 Z"
  };

  const chartStroke = {
    Revenue: "M0,180 C100,180 150,60 250,90 C350,120 450,20 550,50 C650,80 750,10 800,30",
    Clients: "M0,200 C150,150 250,180 400,100 C500,60 650,120 800,40",
    Performance: "M0,100 C200,80 400,120 600,60 C700,40 750,50 800,30",
    Tasks: "M0,50 C100,80 250,40 400,120 C550,160 700,100 800,180"
  };

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
                    {["Last 7 Days", "Last 30 Days", "Last 12 Months", "All Time"].map((range) => (
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
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-xl ${stat.isUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                    {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-slate-600 text-[11px] font-black uppercase tracking-[0.2em] mb-1 pl-1">{stat.label}</h3>
                <div className="flex items-end justify-between px-1">
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                  <div className={`transition-all duration-500 translate-x-2 group-hover:translate-x-0 ${activeMetric === stat.label ? 'opacity-100 translate-x-0 scale-110' : 'opacity-0 group-hover:opacity-100'}`}>
                    <Sparkline color={stat.color} data={stat.data} />
                  </div>
                </div>
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
                  {['7D', '30D', '12M'].map((t) => (
                    <button key={t} className={`px-5 py-2 text-[11px] font-black rounded-xl transition-all ${(t === '7D' && dateRange === 'Last 7 Days') || (t === '30D' && dateRange === 'Last 30 Days') || (t === '12M' && dateRange === 'Last 12 Months')
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
                    d={chartPaths[activeMetric]}
                    className="transition-all duration-700 ease-in-out"
                  />
                  <path
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="5"
                    strokeLinecap="round"
                    filter="url(#chartGlow)"
                    d={chartStroke[activeMetric]}
                    className="transition-all duration-700 ease-in-out"
                    strokeDasharray="1000"
                    strokeDashoffset="0"
                  />

                  {[
                    { x: 100, y: 150, val: "2,4k" },
                    { x: 400, y: 80, val: "4.8k" },
                    { x: 750, y: 20, val: "5.2k" }
                  ].map((pt, i) => (
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
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(m => <span key={m}>{m}</span>)}
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
          </div>

          {/* Sidebar Section */}
          <div className="space-y-8">
            {/* System Health Widget */}
            <div className="bg-[#1a1c31] rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.3)] min-h-[300px] flex flex-col justify-center border border-white/5">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-1000" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="font-black text-xl italic tracking-tight">System Core</h3>
                  <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Healthy
                  </span>
                </div>
                <div className="space-y-8">
                  {[
                    { label: "Infrastructure", value: "84%", color: "bg-indigo-500", glow: "shadow-indigo-500/20" },
                    { label: "API Latency", value: "32ms", color: "bg-emerald-500", glow: "shadow-emerald-500/20" },
                    { label: "Memory Usage", value: "62%", color: "bg-purple-500", glow: "shadow-purple-500/20" },
                  ].map((item, i) => (
                    <div key={i} className="group/item">
                      <div className="flex justify-between text-[11px] font-black mb-3 uppercase tracking-widest text-slate-600 group-hover/item:text-slate-300 transition-colors">
                        <span>{item.label}</span>
                        <span className="text-white">{item.value}</span>
                      </div>
                      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-[2px] border border-white/5">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-1000 shadow-lg ${item.glow}`} style={{ width: item.value.includes('%') ? item.value : '45%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

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

