import type { ReactNode } from "react";
import WoltGenerateSearchForm from "./search-form";

export default function WoltGenerateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full space-y-4">
      <WoltGenerateSearchForm />
      {children}
    </div>
  );
}
