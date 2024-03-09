"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { z } from "zod";
import type { discogsFolderSchema } from "~/server/schemas/discogs/folders";
import { DataTable } from "~/components/ui/data-table";
import { useRouter } from "next/navigation";

export const folderColumns: ColumnDef<z.infer<typeof discogsFolderSchema>>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "count", header: "Count" },
];

export const FoldersTable = ({
  folders,
}: {
  folders: z.infer<typeof discogsFolderSchema>[];
}) => {
  const router = useRouter();

  return (
    <DataTable
      data={folders}
      columns={folderColumns}
      onRowClick={({ id }) => router.push("/admin/discogs/folders/" + id)}
    />
  );
};
