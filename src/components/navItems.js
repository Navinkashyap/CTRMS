// Sidebar menu definition. Kept apart from Sidebar.jsx so the global search can
// read the same list without breaking fast-refresh (components-only exports).
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
  PieChart
} from "lucide-react";

export const navItems = [
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
      { label: "Designation", to: "/master/designation" },
      { label: "Unit", to: "/master/unit" },
      { label: "Pay Duration", to: "/master/pay-duration" },
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
      { label: "Vendor Manager", to: "/vendors" },
      { label: "Vendors", to: "/vendors/vendor-users" },
      { label: "Evaluation", to: "/vendors/evaluation" },
    ],
  },
  { label: "Project Manager", icon: User, to: "/project-managers", sub: [] },
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
