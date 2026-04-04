"use client";

import AreaMembrosSidebar from "@/components/area-membros/AreaMembrosSidebar";

export default function AreaMembrosLayout({ children }) {
  return (
    <div className="h-screen overflow-hidden bg-[#08111b] text-white">
      <div className="flex h-full min-h-0">
        <AreaMembrosSidebar />
        <div className="min-w-0 min-h-0 flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}