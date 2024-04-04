"use client";

import { type Schema } from "@effect/schema/Schema";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTable } from "~/components/ui/data-table";
import { type wcProductSchema } from "~/server/schemas/woocommerce/product";

const columns: ColumnDef<Schema.Type<typeof wcProductSchema>>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected() ||
          (table.getIsSomeRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "image",
    header: "Image",
    accessorFn: (row) => row.images?.[0]?.src,
    cell: ({ getValue }) => (
      <img src={getValue() as string} className="size-20" alt="Release Image" />
    ),
  },
  { header: "ID", accessorKey: "id" },
  { header: "Title", accessorKey: "name" },
  {
    header: "Date added",
    accessorFn: ({ date_created }) => format(date_created, "dd/MM/yyyy"),
  },
];

export default function WoltGenerateProductTable({
  data,
}: {
  data: Schema.Type<typeof wcProductSchema>[];
}) {
  return <DataTable columns={columns} data={data} />;
}
