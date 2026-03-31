import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      {sidebarOpen && <Sidebar />}

      {/* Right column */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#f3f4f6",
        }}
      >
        <Header onToggleSidebar={() => setSidebarOpen((p) => !p)} />

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
