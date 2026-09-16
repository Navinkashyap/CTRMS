import { Outlet } from "react-router-dom";
import SalesSidebar from "./SalesSidebar";

const SalesLayout = () => (
  <div className="flex h-screen overflow-hidden bg-slate-50">
    <SalesSidebar />
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f1f5f9]">
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default SalesLayout;
