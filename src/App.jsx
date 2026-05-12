import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Country from "./pages/Country";
import State from "./pages/State";
import City from "./pages/City";
import Services from "./pages/Services";
import Tools from "./pages/Tools";
import Currency from "./pages/Currency";
import Languages from "./pages/Languages";
import Specialization from "./pages/Specialization";
import Quality from "./pages/Quality";
import Deadline from "./pages/Deadline";
import Typelist from "./pages/Typelist";
import Membership from "./pages/Membership";
import Department from "./pages/Department";
import RoleAction from "./pages/RoleAction";
import Action from "./pages/Action";
import MangerRole from "./pages/MangerRole";
import RoleMenuPermission from "./pages/RoleMenuPermission";
import ClientList from "./pages/ClientList";
import ContactList from "./pages/ContactList";
import ProjectsList from "./pages/ProjectsList";
import InvoiceList from "./pages/InvoiceList";
import UsersList from "./pages/UsersList";
import VendorList from "./pages/VendorList";
import AddVendor from "./pages/AddVendor";
import Evaluation from "./pages/Evaluation";
import AddAdmin from "./pages/AddAdmin";
import AddClient from "./pages/AddClient";
import ViewClient from "./pages/ViewClient";
import AddContact from "./pages/AddContact";
import ViewContact from "./pages/ViewContact";
import AddProject from "./pages/AddProject";
import ViewProject from "./pages/ViewProject";
import Login from "./pages/Login";

// Generic placeholder for other pages
const PagePlaceholder = ({ title, icon }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-zinc-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] min-h-[65vh] animate-in fade-in zoom-in-95 duration-500">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-[rgb(74,111,212)] blur-[30px] opacity-20 rounded-full"></div>
      <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200/50 border border-zinc-100 relative z-10 rotate-3 transition-transform hover:rotate-0">
        <i className={`fa-solid ${icon} text-4xl text-[rgb(74,111,212)]`}></i>
      </div>
    </div>
    <h1 className="text-3xl font-bold text-zinc-900 mb-3 tracking-tight">{title} Workspace</h1>
    <p className="text-zinc-500 max-w-md text-sm leading-relaxed">
      This is the dedicated management area for the {title} module. Tables, configurations, and analytical tools will be rendered here.
    </p>
    <button className="mt-8 px-6 py-2.5 bg-[rgb(74,111,212)] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 group">
      <i className="fa-solid fa-plus group-hover:rotate-90 transition-transform duration-300"></i>
      Create New Record
    </button>
  </div>
);

const App = () => {
  useEffect(() => {
    if (!document.querySelector('#fontawesome-css')) {
      const link = document.createElement('link');
      link.id = 'fontawesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
      
      /* Smooth intro animations */
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slide-in-from-bottom-4 { from { transform: translateY(1rem); } to { transform: translateY(0); } }
      @keyframes zoom-in-95 { from { transform: scale(0.95); } to { transform: scale(1); } }
      
      .animate-in { animation-duration: 0.5s; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); animation-fill-mode: forwards; }
      .fade-in { animation-name: fade-in; }
      .slide-in-from-bottom-4 { animation-name: slide-in-from-bottom-4; }
      .zoom-in-95 { animation-name: zoom-in-95; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>

          <Route index element={<Dashboard />} />
          <Route path="add-admin" element={<AddAdmin />} />
          <Route path="master" element={<PagePlaceholder title="Master Data" icon="fa-cart-shopping" />} />
          <Route path="master/country" element={<Country />} />
          <Route path="master/state" element={<State />} />
          <Route path="master/city" element={<City />} />
          <Route path="master/district" element={<PagePlaceholder title="District Master" icon="fa-cube" />} />
          <Route path="master/mother-tongue" element={<PagePlaceholder title="Mother Tongue Master" icon="fa-microphone-lines" />} />
          <Route path="master/services" element={<Services />} />
          <Route path="master/tool" element={<Tools />} />
          <Route path="master/currency" element={<Currency />} />
          <Route path="master/language" element={<Languages />} />
          <Route path="master/specialization" element={<Specialization />} />
          <Route path="master/quality" element={<Quality />} />
          <Route path="master/deadline" element={<Deadline />} />
          <Route path="master/type" element={<Typelist />} />
          <Route path="master/membership" element={<Membership />} />
          <Route path="master/department" element={<Department />} />

          <Route path="roles/manage-role" element={<MangerRole />} />

          <Route path="roles/action" element={<Action />} />
          <Route path="roles/role-action-mapping" element={<RoleAction />} />
          <Route path="menus" element={<PagePlaceholder title="Menu Configuration" icon="fa-bars-staggered" />} />
          <Route path="menus/role-menu-permission" element={<RoleMenuPermission />} />
          <Route path="users" element={<UsersList />} />
          <Route path="vendors" element={<VendorList />} />
          <Route path="vendors/add-vendor" element={<AddVendor />} />
          <Route path="vendors/manage-vendors" element={<VendorList />} />
          <Route path="vendors/evaluation" element={<Evaluation />} />
          <Route path="clients">
            <Route index element={<ClientList />} />
            <Route path="add-client" element={<AddClient />} />
            <Route path="view-client/:id" element={<ViewClient />} />
          </Route>
          <Route path="contacts" element={<ContactList />} />
          <Route path="contacts/add-contact" element={<AddContact />} />
          <Route path="contacts/view-contact/:id" element={<ViewContact />} />
          <Route path="projects">
            <Route index element={<ProjectsList />} />
            <Route path="add-project" element={<AddProject />} />
            <Route path="view-project/:id" element={<ViewProject />} />
          </Route>
          <Route path="invoice" element={<InvoiceList />} />
          <Route path="report" element={<PagePlaceholder title="Analytics & Reports" icon="fa-chart-pie" />} />
          <Route path="logout" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<PagePlaceholder title="Page Not Found" icon="fa-circle-exclamation" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
