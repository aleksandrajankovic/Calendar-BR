// app/admin/layout.jsx
"use client";

import AdminHeader from "./components/Header";
import SidebarNav from "./components/Sidebar";


export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <AdminHeader title="BackOffice" logoutHref="/login" sticky />
      <main className="grid grid-cols-1 lg:grid-cols-[360px_1fr] min-h-[calc(100vh-56px)]">
        <SidebarNav topOffsetPx={56} />
        <section className="p-[50px] font-roboto">
          {children}
        </section>
      </main>
    </div>
  );
}
