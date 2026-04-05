import React from "react";

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

const Dashboard = () => (
  <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-900">
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    {/* Premium Stats Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: "Monthly Revenue", value: "$124,500", trend: "+14.5%", isUp: true, color: "rgb(74, 111, 212)", data: "M0 25 Q 15 20, 30 25 T 60 15 T 80 5 T 100 10" },
        { label: "Active Projects", value: "142", trend: "+5.2%", isUp: true, color: "#3b82f6", data: "M0 20 Q 20 5, 40 15 T 70 20 T 100 5" },
        { label: "Pending Invoices", value: "24", trend: "-2.1%", isUp: false, color: "#f59e0b", data: "M0 5 Q 20 15, 40 5 T 70 20 T 100 25" },
        { label: "Total Clients", value: "1,204", trend: "+8.4%", isUp: true, color: "#06b6d4", data: "M0 25 L 20 20 L 40 22 L 60 10 L 80 15 L 100 5" },
      ].map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 group cursor-default">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-500 text-sm font-semibold tracking-wide">{stat.label}</h3>
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <i className={`fa-solid ${stat.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
              {stat.trend}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-zinc-900 tracking-tight">{stat.value}</p>
            <div className="opacity-70 group-hover:opacity-100 transition-opacity">
              <Sparkline color={stat.color} data={stat.data} />
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* SVG Area Chart Section */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Revenue Overview</h3>
            <p className="text-sm text-zinc-500 mt-1">Analytics for the current fiscal year</p>
          </div>
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            <button className="px-4 py-1.5 text-xs font-semibold bg-white shadow-sm rounded-md text-[rgb(74,111,212)]">12M</button>
            <button className="px-4 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900">30D</button>
            <button className="px-4 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900">7D</button>
          </div>
        </div>

        {/* Custom SVG Chart Mockup */}
        <div className="h-[280px] w-full relative">
          {/* Chart Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pt-4 pb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full border-b border-zinc-100 border-dashed relative">
                <span className="absolute -left-2 -top-2.5 bg-white pr-2 text-[10px] font-medium text-zinc-400">${(5 - i) * 20}k</span>
              </div>
            ))}
          </div>

          <svg className="absolute inset-0 w-full h-full pt-4 pb-6 ml-6" viewBox="0 0 800 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(74,111,212)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(74,111,212)" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Smooth Area */}
            <path
              fill="url(#gradientArea)"
              d="M0,200 C100,200 150,80 250,110 C350,140 450,40 550,70 C650,100 750,20 800,40 L800,240 L0,240 Z"
            />
            {/* Smooth Line */}
            <path
              fill="none"
              stroke="rgb(74,111,212)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#glow)"
              d="M0,200 C100,200 150,80 250,110 C350,140 450,40 550,70 C650,100 750,20 800,40"
            />
            {/* Data Points */}
            <circle cx="250" cy="110" r="5" fill="#fff" stroke="rgb(74,111,212)" strokeWidth="3" className="drop-shadow-md cursor-pointer hover:r-6 transition-all" />
            <circle cx="550" cy="70" r="5" fill="#fff" stroke="rgb(74,111,212)" strokeWidth="3" className="drop-shadow-md cursor-pointer hover:r-6 transition-all" />
          </svg>

          {/* X Axis Labels */}
          <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[11px] font-semibold text-zinc-400 px-4">
            <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
          </div>
        </div>
      </div>

      {/* Styled Timeline Activity */}
      <div className="bg-white rounded-2xl border border-zinc-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Recent Activity</h3>
          <button className="text-[rgb(74,111,212)] text-sm font-semibold hover:text-blue-800 transition-colors flex items-center gap-1">
            View All <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>

        <div className="relative pl-3 border-l-2 border-zinc-100 space-y-8 mt-4">
          {[
            { title: "Invoice #INV-2026 Paid", desc: "TechCorp settled their outstanding balance.", time: "2h ago", dot: "bg-emerald-500", ring: "ring-emerald-50" },
            { title: "New Client Onboarded", desc: "Global Industries LLC added to CRM.", time: "5h ago", dot: "bg-[rgb(74,111,212)]", ring: "ring-blue-50" },
            { title: "Milestone Approved", desc: "Website redesign phase 1 signed off.", time: "1d ago", dot: "bg-indigo-500", ring: "ring-indigo-50" },
            { title: "Server Maintenance", desc: "Routine backup and update completed.", time: "2d ago", dot: "bg-zinc-400", ring: "ring-zinc-50" },
          ].map((item, i) => (
            <div key={i} className="relative group">
              <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 ${item.dot.replace('bg-', 'border-')} ring-4 ${item.ring} group-hover:scale-125 transition-transform`}></div>
              <div className="pl-4">
                <p className="text-sm font-bold text-zinc-800">{item.title}</p>
                <p className="text-sm text-zinc-500 mt-0.5 leading-relaxed">{item.desc}</p>
                <p className="text-[11px] text-zinc-400 font-semibold mt-1.5 uppercase tracking-wide">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  </div>
);

export default Dashboard;

