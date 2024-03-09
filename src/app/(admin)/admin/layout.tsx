import type { ReactNode } from "react";
import { Sidebar } from "~/components/admin/sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-8 divide-x">
      <nav className="sticky col-span-1 h-[100dvh]">
        <Sidebar />
      </nav>
      <main className="container col-span-7 px-8 py-4">{children}</main>
    </div>
  );
}
