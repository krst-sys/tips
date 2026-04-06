"use client";

import AreaMembrosSidebar from "@/components/area-membros/AreaMembrosSidebar";

export default function AreaMembrosLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-[#08111b] dark:text-white">
      <div className="flex min-h-screen">
        <AreaMembrosSidebar />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}