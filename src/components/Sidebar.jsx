import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import brandLogo from "../assets/logo.jpeg";
import {
  LayoutDashboard,
  Database,
  Shield,
  Menu as MenuIcon,
  Users,
  Store,
  Building2,
  BookUser,
  Layers,
  FileText,
  PieChart,
  LogOut,
  Search,
  ChevronRight,
  Settings,
  Command
} from "lucide-react";

// --- Configuration ---

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/", sub: [] },
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
  {
    label: "Logout",
    icon: LogOut,
    to: "/logout",
    sub: [],
  },
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

const Sidebar = () => {
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
    <aside className="relative w-[260px] min-h-screen flex flex-col flex-shrink-0 border-r border-slate-800 bg-slate-950 text-slate-300 selection:bg-indigo-500/30">

      {/* Top Header / Logo Area */}
      <div className="relative z-10 px-4 py-4 border-b border-slate-800/60">
        <NavLink
          to="/"
          end
          className="block rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.8)]"
          aria-label="Go to Dashboard"
        >
          <img
            src={brandLogo}
            alt="Perfectrans logo"
            className="w-32 mx-auto h-16 object-contain rounded-lg bg-[#d8d8da]"
          />
        </NavLink>
      </div>

      {/* Main Navigation */}
      <nav className="relative z-10 flex-1 px-3 pt-5 pb-4 overflow-y-auto overflow-x-hidden sidebar-scrollbar">

        {/* Search Bar Fake Input */}
        <button
          type="button"
          className="w-full mb-6 flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all duration-200 group"
        >
          <Search size={16} className="text-slate-500 group-hover:text-slate-400" />
          <span className="text-[13px] font-medium">Search modules...</span>
          <div className="ml-auto flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
            <Command size={10} />
            <span>K</span>
          </div>
        </button>

        <div className="text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase mb-3 px-3">
          Main Menu
        </div>


        <div className="space-y-1">
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
                <div key={label} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggle(label)}
                    aria-expanded={isOpen}
                    aria-controls={submenuId}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 outline-none
                      ${isActiveParent
                        ? "text-indigo-400 bg-indigo-500/[0.08]"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      }`}
                  >
                    {isActiveParent && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-indigo-500" />
                    )}
                    {React.createElement(Icon, {
                      size: 18,
                      className: isActiveParent
                        ? "text-indigo-400"
                        : "text-slate-500 group-hover:text-slate-400",
                    })}
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronRight
                      size={14}
                      className={`transition-transform duration-300 ${isOpen ? "rotate-90 text-indigo-400" : "text-slate-500"}`}
                    />
                  </button>

                  {/* Smooth animated submenu wrapper */}
                  <div
                    id={submenuId}
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="relative ml-6 pl-3 py-1 mt-1 space-y-1 border-l border-slate-800/80">
                        {sub.map((subItem) => (
                          <NavLink
                            key={subItem.label}
                            to={subItem.to}
                            end
                            className={({ isActive }) =>
                              `group flex items-center gap-3 py-2 px-3 rounded-md text-[13px] font-medium transition-all duration-200 outline-none
                                ${isActive
                                ? "text-white bg-slate-800/80"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                {/* Tree branch connector */}
                                <div className="w-3 h-px bg-slate-800/80 group-hover:bg-slate-600 transition-colors" />
                                <span
                                  className={`h-1.5 w-1.5 rounded-full transition-colors ${isActive ? "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" : "bg-slate-600"
                                    }`}
                                />
                                <span>{subItem.label}</span>
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Render Standard Link
            return (
              <NavLink
                key={label}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 outline-none
                    ${isActive
                    ? "text-indigo-400 bg-indigo-500/[0.08]"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-indigo-500" />
                    )}
                    {React.createElement(Icon, {
                      size: 18,
                      className: isActive
                        ? "text-indigo-400"
                        : "text-slate-500 group-hover:text-slate-400",
                    })}
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer Area */}
      <div className="relative z-10 px-3 pb-4 pt-4 border-t border-slate-800/60 space-y-2 bg-slate-950">
        {logoutItem && (
          <NavLink
            to={logoutItem.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 outline-none
                ${isActive
                ? "bg-red-500/10 text-red-400"
                : "text-slate-400 hover:bg-red-500/10 hover:text-red-400"
              }`
            }
          >
            <LogOut size={18} className="text-inherit" />
            <span>{logoutItem.label}</span>
          </NavLink>
        )}

        {/* User Profile */}
        <div className="p-2 mt-2 rounded-lg border border-slate-800 bg-slate-900/50 flex items-center gap-3 hover:bg-slate-900 transition-colors group cursor-pointer">
          <div className="relative shrink-0">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Jane&backgroundColor=transparent"
              alt="User"
              className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 p-0.5"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-200 truncate group-hover:text-white transition-colors">Jane Doe</p>
            <p className="text-[11px] text-slate-500 truncate">Administrator</p>
          </div>
          <button
            type="button"
            className="h-7 w-7 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            aria-label="Open settings"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
      
      <style>{`
        .sidebar-scrollbar::-webkit-scrollbar { width: 2px; }
        .sidebar-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
      `}</style>
    </aside>
  );
};

export default Sidebar;
