import type { ReactNode } from "react";
import DiscogsBreadCrumbs from "./breadcrumbs";

export default function DiscogsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <DiscogsBreadCrumbs />
      {children}
    </div>
  );
}
