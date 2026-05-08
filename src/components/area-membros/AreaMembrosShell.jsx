"use client";

import { useState } from "react";
import AreaMembrosSidebar from "@/components/area-membros/AreaMembrosSidebar";
import AreaMembrosTopbar from "@/components/area-membros/AreaMembrosTopbar";

export default function AreaMembrosShell({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="gp-app-shell flex h-screen overflow-hidden transition-colors">
      <AreaMembrosSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AreaMembrosTopbar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="gp-main min-h-0 min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
