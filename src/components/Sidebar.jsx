import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import brandLogo from "../assets/logo.jpeg";
import { logout } from "../lib/authApi";
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
  Command,
  LogOut,
  Bell
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
      { label: "Domain", to: "/master/type" },
      { label: "Membership", to: "/master/membership" },
      { label: "Department", to: "/master/department" },
      { label: "Unit", to: "/master/unit" },
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
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState(() => getActiveParentMenus(location.pathname));

  useEffect(() => {
    const autoOpenMenus = getActiveParentMenus(location.pathname);
    if (Object.keys(autoOpenMenus).length > 0) {
      setOpenMenus((prev) => ({ ...prev, ...autoOpenMenus }));
    }
  }, [location.pathname]);

  const toggle = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = useMemo(() => navItems, []);

  return (
    <aside className={`sticky top-0 h-screen flex flex-col flex-shrink-0 border-r border-white/5 bg-[#0a0a0c]/95 backdrop-blur-3xl text-slate-400 selection:bg-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? "w-[72px]" : "w-[240px]"} shadow-[10px_0_40px_-20px_rgba(0,0,0,0.7)] z-50`}>

      {/* Premium Decorative Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[20%] w-[140%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[30%] w-[100%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Header Section */}
      <div className={`relative z-10 pt-8 pb-6 flex items-center ${isCollapsed ? "justify-center px-0" : "px-5"}`}>
        <NavLink
          to="/"
          className={`group relative flex items-center gap-3 overflow-hidden transition-all duration-500 ${isCollapsed ? "w-12 h-12 justify-center" : "w-full"}`}
        >
          <div className={`relative flex items-center justify-center shrink-0 bg-white p-1 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] ${isCollapsed ? "w-10 h-10" : "w-10 h-10"}`}>
            <img
              src={brandLogo}
              alt="Logo"
              className="w-full h-full object-contain rounded-xl transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-indigo-500/50 transition-colors" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white leading-tight">PERFECTRANS</span>
              <span className="text-[9px] font-bold text-indigo-400/80 tracking-[0.2em] uppercase">Enterprise</span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Search Section */}
      <div className={`relative z-10 mb-6 ${isCollapsed ? "px-3" : "px-5"}`}>
        {isCollapsed ? (
          <button className="w-full h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all duration-300">
            <Search size={16} />
          </button>
        ) : (
          <div className="relative group">
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 bg-white/[0.03] border border-white/5 rounded-xl text-sm font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.07] focus:border-indigo-500/30 transition-all duration-300"
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
              <Command size={10} className="text-slate-600" />
              <span className="text-[8px] font-bold text-slate-600">K</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="relative z-10 flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <div className="px-4 mb-3">
            <span className="text-[10px] font-black text-slate-600 tracking-[0.25em] uppercase">Management</span>
          </div>
        )}

        {menuItems.map(({ label, icon: Icon, to, sub }) => {
          const hasSub = sub.length > 0;
          const childIsActive = hasSub ? sub.some((s) => location.pathname.startsWith(s.to)) : false;
          const isActive = to ? (to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)) : false;
          const isOpen = Boolean(openMenus[label]);
          const isHighlighted = isActive || childIsActive || (hasSub && isOpen);

          return (
            <div key={label} className="relative group/nav-item">
              {hasSub ? (
                <>
                  <button
                    onClick={() => !isCollapsed && toggle(label)}
                    className={`w-full flex items-center gap-3.5 ${isCollapsed ? "justify-center px-0 h-12" : "px-4 h-12"} rounded-xl transition-all duration-300 group ${isHighlighted
                      ? "text-white bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]"
                      }`}
                  >
                    <div className={`relative flex items-center justify-center shrink-0 ${isHighlighted ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                      <Icon size={20} className={`transition-transform duration-500 ${isHighlighted ? "scale-110" : "group-hover:scale-110"}`} />
                      {isHighlighted && <div className="absolute -inset-1.5 bg-indigo-500/20 blur-md rounded-full -z-10 animate-pulse" />}
                    </div>

                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-[14px] font-semibold text-left tracking-wide">{label}</span>
                        <ChevronRight size={14} className={`transition-transform duration-500 ${isOpen ? "rotate-90 text-indigo-400" : "text-slate-600"}`} />
                      </>
                    )}
                  </button>

                  {!isCollapsed && (
                    <div className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 mt-0"}`}>
                      <div className="overflow-hidden">
                        <div className="ml-6 pl-4 border-l border-white/5 space-y-0.5">
                          {sub.map((subItem) => (
                            <NavLink
                              key={subItem.label}
                              to={subItem.to}
                              className={({ isActive: isSubActive }) => `
                                flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-300
                                ${isSubActive
                                  ? "text-white bg-indigo-500/10"
                                  : "text-slate-500 hover:text-slate-300 hover:translate-x-1"
                                }
                              `}
                            >
                              {({ isActive: isSubActive }) => (
                                <>
                                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSubActive ? "bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)] scale-125" : "bg-slate-700"}`} />
                                  <span>{subItem.label}</span>
                                </>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full top-0 ml-3 invisible opacity-0 -translate-x-2 group-hover/nav-item:visible group-hover/nav-item:opacity-100 group-hover/nav-item:translate-x-0 transition-all duration-300 z-50">
                      <div className="min-w-[200px] bg-[#0c0c0e] border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
                        <div className="px-3 py-2 border-b border-white/5 mb-1">
                          <span className="text-[10px] font-black text-indigo-400 tracking-wider uppercase">{label}</span>
                        </div>
                        {sub.map((subItem) => (
                          <NavLink
                            key={subItem.label}
                            to={subItem.to}
                            className={({ isActive: isSubActive }) => `
                              block px-3 py-2 rounded-lg text-[13px] font-medium transition-all
                              ${isSubActive ? "text-white bg-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}
                            `}
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive: isNavActive }) => `
                    flex items-center gap-3.5 ${isCollapsed ? "justify-center px-0 h-12" : "px-4 h-12"} rounded-xl transition-all duration-300 group
                    ${isNavActive
                      ? "text-white bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.02]"
                    }
                  `}
                >
                  {({ isActive: isNavActive }) => (
                    <>
                      <div className={`relative flex items-center justify-center shrink-0 ${isNavActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}>
                        <Icon size={20} className={`transition-transform duration-500 ${isNavActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"}`} />
                        {isNavActive && (
                          <>
                            <div className="absolute -inset-1.5 bg-indigo-500/20 blur-md rounded-full -z-10 animate-pulse" />
                            <div className="absolute -left-4 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[2px_0_10px_rgba(99,102,241,0.5)]" />
                          </>
                        )}
                      </div>
                      {!isCollapsed && <span className="text-[14px] font-semibold tracking-wide">{label}</span>}
                      {isCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-indigo-600 text-white text-[12px] font-bold rounded-lg invisible opacity-0 -translate-x-2 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all whitespace-nowrap z-50">
                          {label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / Profile Section */}
      <div className={`relative z-6 border-t border-white/5 pt-3 pb-4 ${isCollapsed ? "px-3" : "px-4"}`}>
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-4 px-1">
            <button className="relative p-2 text-slate-500 hover:text-white transition-colors group">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#0a0a0c]" />
            </button>
            <button className="p-2 text-slate-500 hover:text-white transition-colors">
              <Settings size={18} className="hover:rotate-45 transition-transform duration-500" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-red-500/70 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}

        <div className={`group relative flex items-center ${isCollapsed ? "justify-center" : "gap-4 p-3 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.06] transition-all duration-500 cursor-pointer shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-500/20"}`}>
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-white/10 p-0.5 overflow-hidden transition-transform duration-500 group-hover:scale-105">
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Jane&backgroundColor=transparent"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-[#0a0a0c] rounded-full" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-white truncate">PYUSH</p>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-tighter">Super Admin</p>
            </div>
          )}

          {isCollapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-[#0c0c0e] border border-white/10 rounded-xl p-3 shadow-2xl invisible opacity-0 -translate-x-2 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all z-50 min-w-[140px]">
              <p className="text-[13px] font-bold text-white">PYUSH</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase">Super Admin</p>
              <div className="mt-2 pt-2 border-t border-white/5 flex gap-2">
                <Settings size={14} className="text-slate-500 hover:text-white cursor-pointer" />
                <LogOut 
                  size={14} 
                  className="text-red-500/70 hover:text-red-400 cursor-pointer" 
                  onClick={handleLogout}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.3);
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;

