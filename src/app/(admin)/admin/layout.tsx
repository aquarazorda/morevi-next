import { isLeft } from "effect/Either";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "~/components/admin/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { validateRequestClient } from "~/server/auth/utils";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isAuth = await validateRequestClient(true);

  if (isLeft(isAuth)) {
    return redirect("/admin/login");
  }

  return (
    <div className="grid grid-cols-8 divide-x">
      <nav className="sticky col-span-1 h-[100dvh]">
        <Sidebar userId={isAuth.right.user.id} />
      </nav>
      <main className="container col-span-7 px-8 py-4">{children}</main>
      <Toaster position="top-right" />
    </div>
  );
}
