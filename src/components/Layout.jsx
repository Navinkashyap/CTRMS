import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 selection:bg-indigo-500/30">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[70] lg:relative lg:z-auto transition-transform duration-300 lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar isCollapsed={!sidebarOpen} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#f1f5f9] relative">
        {/* Subtle dynamic background light */}
        <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-gradient-to-br from-indigo-400/10 via-purple-400/5 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/10 via-cyan-400/5 to-transparent rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col h-full">
          <Header 
            onToggleSidebar={() => setSidebarOpen((p) => !p)} 
            onToggleMobileMenu={() => setMobileMenuOpen((p) => !p)}
          />
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
