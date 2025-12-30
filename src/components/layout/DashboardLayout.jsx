import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-screen bg-gray-50">
      <div className="sticky top-0 z-30 w-full bg-white shadow-sm flex-none">
        <Header onMenuClick={() => setSidebarOpen(true)} />
      </div>
      <main className="flex-1 px-3 sm:px-4 py-3 sm:py-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
