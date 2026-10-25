import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, BookUser, Layers, Users, LogOut } from "lucide-react";
import { logout, getCurrentUser } from "../../lib/authApi";
import { hasSalesPermission, isSalesManager } from "../lib/permissions";

const SalesSidebar = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/sales", end: true, show: true },
    { label: "Clients", icon: Building2, to: "/sales/clients", show: hasSalesPermission("clients", "view") },
    { label: "Client Contacts", icon: BookUser, to: "/sales/contacts", show: hasSalesPermission("contacts", "view") },
    { label: "Projects", icon: Layers, to: "/sales/projects", show: hasSalesPermission("projects", "view") },
    { label: "Sales Managers", icon: Users, to: "/sales/users", show: !isSalesManager() },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="sticky top-0 h-screen w-[240px] flex-shrink-0 flex flex-col bg-[#0a0a0c] border-r border-white/5 text-slate-400">
      <div className="px-5 pt-8 pb-6">
        <p className="text-base font-black tracking-tight text-white leading-tight">SALES PORTAL</p>
        <p className="text-[9px] font-bold text-indigo-400/80 tracking-[0.2em] uppercase">Perfecttrans</p>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.filter((item) => item.show).map(({ label, icon: Icon, to, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 h-11 rounded-xl text-[14px] font-semibold transition-colors ${
                isActive ? "text-white bg-white/5" : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/5">
        <p className="text-sm font-bold text-white truncate">{user?.name || user?.email}</p>
        <p className="text-[11px] text-slate-500 uppercase tracking-tight mb-3">
          {user?.role?.replace("_", " ")}
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500/80 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default SalesSidebar;
