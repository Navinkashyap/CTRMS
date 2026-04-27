import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import brandLogo from "../assets/logo.jpeg";
import {
  LayoutDashboard,
  Database,
  Shield,
  Menu as MenuIcon,
  Users,
  User,
  Store,
  Building2,
  BookUser,
  Layers,
  FileText,
  PieChart,

  Search,
  ChevronRight,
  Settings,
  Command
} from "lucide-react";

// --- Configuration ---

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/", sub: [] },

  {
    label: "Add Admin",
    icon: User,
    to: null,
    sub: [
      { label: "Add Admin", to: "/add-admin" },
    ],
  },

  {
    label: "Master",
    icon: Database,
    to: null,
    sub: [
      { label: "Country", to: "/master/country" },
      { label: "State", to: "/master/state" },
      { label: "District", to: "/master/district" },
      { label: "City", to: "/master/city" },
      { label: "Mother Tongue", to: "/master/mother-tongue" },
      { label: "Services", to: "/master/services" },
      { label: "Tool", to: "/master/tool" },
      { label: "Currency", to: "/master/currency" },
      { label: "Language", to: "/master/language" },
      { label: "Specialization", to: "/master/specialization" },
      { label: "Quality", to: "/master/quality" },
      { label: "Deadline", to: "/master/deadline" },
      { label: "Type", to: "/master/type" },
      { label: "Membership", to: "/master/membership" },
    ],
  },
  {
    label: "Role",
    icon: Shield,
    to: null,
    sub: [

      { label: "Manage Role", to: "/roles/manage-role" },
      { label: "Action", to: "/roles/action" },
      { label: "Role Action Mapping", to: "/roles/role-action-mapping" },
    ],
  },
  {
    label: "Menu",
    icon: MenuIcon,
    to: null,
    sub: [
      { label: "Manage Menus", to: "/menus" },
      { label: "Role Menu Permission", to: "/menus/role-menu-permission" },
    ],
  },
  { label: "Manage Users", icon: Users, to: "/users", sub: [] },
  {
    label: "Vendor",
    icon: Store,
    to: null,
    sub: [
      { label: "All Vendors", to: "/vendors" },
      { label: "Manage Vendors", to: "/vendors/manage-vendors" },
      { label: "Evaluation", to: "/vendors/evaluation" },
    ],
  },
  { label: "Clients", icon: Building2, to: "/clients", sub: [] },
  { label: "Contacts", icon: BookUser, to: "/contacts", sub: [] },
  { label: "Projects", icon: Layers, to: "/projects", sub: [] },
  {
    label: "Invoice",
    icon: FileText,
    to: "/invoice",
    sub: [],
  },
  { label: "Report", icon: PieChart, to: "/report", sub: [] },

];

// --- Helpers ---

const getActiveParentMenus = (pathname) =>
  navItems.reduce((acc, item) => {
    if (item.sub.length > 0 && item.sub.some((subItem) => pathname.startsWith(subItem.to))) {
      acc[item.label] = true;
    }
    return acc;
  }, {});

const toSubmenuId = (label) => `submenu-${label.toLowerCase().replace(/\s+/g, "-")}`;

// --- Sidebar Component ---

const Sidebar = ({ isCollapsed = false }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState(() => getActiveParentMenus(location.pathname));

  // Automatically open parent menu if a child is active
  useEffect(() => {
    const autoOpenMenus = getActiveParentMenus(location.pathname);
    if (Object.keys(autoOpenMenus).length > 0) {
      setOpenMenus((prev) => ({ ...prev, ...autoOpenMenus }));
    }
  }, [location.pathname]);

  const toggle = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const menuItems = useMemo(() => navItems.filter((item) => item.to !== "/logout"), []);
  const logoutItem = useMemo(() => navItems.find((item) => item.to === "/logout"), []);

  return (
    <aside className={`sticky top-0 h-screen flex flex-col flex-shrink-0 border-r border-white/5 bg-slate-950/90 backdrop-blur-2xl text-slate-300 selection:bg-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "w-[80px]" : "w-[240px]"} shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]`}>

      {/* Dynamic Background Noise/Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />

      {/* Top Header / Logo Area */}
      <div className={`relative z-10 py-6 flex items-center justify-center ${isCollapsed ? "px-0" : "px-6"}`}>
        <NavLink
          to="/"
          end
          className={`group block overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl transition-all duration-500 hover:border-indigo-500/50 hover:shadow-indigo-500/20 active:scale-95 ${isCollapsed ? "p-1 w-12 h-12" : "p-1.5 w-full h-14"}`}
          aria-label="Go to Dashboard"
        >
          <img
            src={brandLogo}
            alt="Perfectrans logo"
            className="w-full h-full object-contain rounded-xl bg-[#e2e2e4] group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </NavLink>
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 px-4 pt-2 pb-6 overflow-y-auto overflow-x-hidden sidebar-scrollbar custom-scrollbar">

        {/* Premium Search Bar */}
        <div className="relative mb-8 px-1">
          {isCollapsed ? (
            <button
              type="button"
              className="w-full flex justify-center py-3 rounded-xl bg-white/5 border border-white/5 text-slate-600 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
              title="Search modules"
            >
              <Search size={20} className="transition-transform group-hover:rotate-12" />
            </button>
          ) : (
            <div className="relative group">
              <input
                type="text"
                placeholder="Search modules..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm font-medium text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/10 focus:border-indigo-500/30 transition-all duration-300"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 group-focus-within:opacity-100 transition-opacity">
                <Command size={10} className="text-slate-600" />
                <span className="text-[10px] font-bold text-slate-600">K</span>
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase mb-4 px-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            Main Architecture
          </div>
        )}

        <div className="space-y-1.5">
          {menuItems.map(({ label, icon: Icon, to, sub }) => {
            const hasSub = sub.length > 0;
            const childIsActive = hasSub
              ? sub.some((subItem) => location.pathname.startsWith(subItem.to))
              : false;
            const isOpen = Boolean(openMenus[label]);

            // Render Submenu Parent
            if (hasSub) {
              const submenuId = toSubmenuId(label);
              const isActiveParent = isOpen || childIsActive;

              return (
                <div key={label} className="flex flex-col relative group/parent">
                  <button
                    type="button"
                    onClick={() => !isCollapsed && toggle(label)}
                    aria-expanded={isOpen}
                    aria-controls={submenuId}
                    title={isCollapsed ? label : undefined}
                    className={`group relative w-full flex items-center ${isCollapsed ? "justify-center gap-0 py-3.5 px-0" : "gap-3.5 px-4 py-3"} rounded-xl text-[14px] font-semibold transition-all duration-300 outline-none
                      ${isActiveParent
                        ? "text-white bg-indigo-600/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                        : "text-slate-600 hover:bg-white/5 hover:text-slate-100"
                      }`}
                  >
                    {isActiveParent && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-indigo-500 shadow-[2px_0_12px_rgba(99,102,241,0.8)]" />
                    )}
                    {React.createElement(Icon, {
                      size: 20,
                      className: `transition-all duration-300 ${isActiveParent ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110"}`,
                    })}
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left tracking-wide">{label}</span>
                        <ChevronRight
                          size={16}
                          className={`transition-all duration-500 ${isOpen ? "rotate-90 text-indigo-400" : "text-slate-600 group-hover:text-slate-600"}`}
                        />
                      </>
                    )}
                  </button>

                  {!isCollapsed && (
                    <div
                      id={submenuId}
                      className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                        <div className="relative ml-8 pl-4 py-2 mt-1 space-y-1 border-l-2 border-slate-800/50">
                          {sub.map((subItem) => (
                            <NavLink
                              key={subItem.label}
                              to={subItem.to}
                              end
                              className={({ isActive }) =>
                                `group flex items-center gap-3.5 py-2.5 px-4 rounded-lg text-[13px] font-medium transition-all duration-300 outline-none
                                  ${isActive
                                  ? "text-white bg-indigo-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  <span
                                    className={`shrink-0 h-1.5 w-1.5 rounded-full transition-all duration-500 ${isActive ? "bg-indigo-400 scale-125 shadow-[0_0_10px_rgba(99,102,241,0.8)]" : "bg-slate-700 group-hover:bg-slate-500 group-hover:scale-110"}`}
                                  />
                                  <span className="tracking-tight">{subItem.label}</span>
                                </>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full top-0 invisible opacity-0 -translate-x-4 group-hover/parent:translate-x-0 group-hover/parent:visible group-hover/parent:opacity-100 transition-all duration-500 min-w-[220px] z-[100] bg-[#0c111d] border border-white/5 rounded-2xl shadow-[24px_0_48px_-12px_rgba(0,0,0,0.6)] p-3 ml-4 pointer-events-none group-hover/parent:pointer-events-auto backdrop-blur-3xl">
                      <div className="text-[11px] font-black tracking-[0.2em] text-indigo-400/80 uppercase mb-3 px-4 pt-2 pb-2 border-b border-white/5">
                        {label}
                      </div>
                      <div className="space-y-1">
                        {sub.map((subItem) => (
                          <NavLink
                            key={subItem.label}
                            to={subItem.to}
                            end
                            className={({ isActive }) =>
                              `group flex items-center px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 outline-none
                                ${isActive
                                ? "text-white bg-indigo-600/20"
                                : "text-slate-600 hover:text-white hover:bg-white/10"
                              }`
                            }
                          >
                            <span className="truncate">{subItem.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Render Standard Link
            return (
              <NavLink
                key={label}
                to={to}
                end={to === "/"}
                style={({ isActive }) => ({ transitionDelay: '50ms' })}
                title={isCollapsed ? label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center ${isCollapsed ? "justify-center gap-0 py-3.5 px-0" : "gap-3.5 px-4 py-3"} rounded-xl text-[14px] font-semibold transition-all duration-300 outline-none
                    ${isActive
                    ? "text-white bg-indigo-600/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] font-bold"
                    : "text-slate-600 hover:bg-white/5 hover:text-slate-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-indigo-500 shadow-[2px_0_12px_rgba(99,102,241,0.8)]" />
                    )}
                    {React.createElement(Icon, {
                      size: 20,
                      className: `transition-all duration-300 ${isActive ? "text-indigo-400 scale-110" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110 group-hover:rotate-3"}`,
                    })}
                    {!isCollapsed && <span className="tracking-wide">{label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Premium Footer Area */}
      <div className={`relative z-10 pb-8 pt-6 border-t border-white/5 space-y-4 bg-transparent ${isCollapsed ? "flex flex-col items-center px-2" : "px-4"}`}>


        {/* User Card */}
        <div className={`mt-2 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl flex items-center hover:bg-white/[0.08] hover:border-white/10 transition-all duration-500 group cursor-pointer ${isCollapsed ? "p-2 justify-center" : "p-3 gap-4 shadow-xl shadow-black/20"}`}>
          <div className="relative shrink-0 scale-90 group-hover:scale-100 transition-transform duration-500">
            <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full animate-pulse" />
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Jane&backgroundColor=transparent"
              alt="User"
              className="relative w-11 h-8 rounded-2xl bg-slate-800 border border-white/10 p-0.5 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-slate-900 shadow-lg" />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-100 truncate tracking-tight">Jane Doe</p>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Shield size={10} className="text-indigo-400 group-hover:animate-bounce" />
                  <p className="text-[11px] text-slate-500 truncate font-semibold uppercase tracking-tighter">Chief Admin</p>
                </div>
              </div>
              <button
                type="button"
                className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-indigo-600 transition-all duration-300 shadow-sm"
                aria-label="Account Settings"
              >
                <Settings size={18} className="group-hover:rotate-90 transition-transform duration-700" />
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .sidebar-scrollbar::-webkit-scrollbar { width: 4px; }
        .sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 20px; transition: all 0.5s; }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.4); }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
