"use client";

import { type ReactNode } from "react";
import AddNewSearchForm from "./search-form";

export default function AddNewRecordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <AddNewSearchForm />
      {children}
    </div>
  );
}
