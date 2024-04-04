"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { discogsFolderSchema } from "~/server/schemas/discogs/folders";
import { DataTable } from "~/components/ui/data-table";
import type { Schema } from "@effect/schema/Schema";
import { useRouter } from "next/navigation";

type Data = Schema.Type<typeof discogsFolderSchema>;

export const folderColumns: ColumnDef<Data>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "count", header: "Count" },
];

export const FoldersTable = ({ folders }: { folders: readonly Data[] }) => {
  const router = useRouter();

  return (
    <DataTable
      data={folders as Data[]}
      columns={folderColumns}
      onRowClick={({ id }) => router.push("/admin/discogs/folders/" + id)}
    />
  );
};
