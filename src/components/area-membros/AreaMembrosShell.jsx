"use client";

import { useState } from "react";
import AreaMembrosSidebar from "@/components/area-membros/AreaMembrosSidebar";
import AreaMembrosTopbar from "@/components/area-membros/AreaMembrosTopbar";

export default function AreaMembrosShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-[#070d16] dark:text-white">
      <AreaMembrosSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AreaMembrosTopbar onMenuClick={() => setMobileSidebarOpen(true)} />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#f6f8fb] dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
