"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";
import { type z } from "zod";
import { DataTable } from "~/components/ui/data-table";
import { getReleaseTitle } from "~/lib/utils";
import { type basicInformationSchema } from "~/server/schemas/discogs/folders";

export const releasesTableColumns: ColumnDef<
  z.infer<typeof basicInformationSchema>
>[] = [
  {
    header: "Thumbnail",
    accessorKey: "thumb",
    cell: ({ getValue }) => (
      <img className="size-20" src={getValue() as string} alt="Release Image" />
    ),
  },
  {
    header: "Title",
    accessorFn: ({ title, artists }) => getReleaseTitle(title, artists),
  },
  {
    header: "Genres",
    accessorFn: ({ genres, styles }) => genres?.concat(styles ?? []).join(", "),
  },
  {
    header: "Year",
    accessorKey: "year",
  },
  {
    header: "Label",
    accessorFn: ({ labels }) => labels[0]?.name + " (" + labels[0]?.catno + ")",
  },
];

export const ReleasesTable = ({
  data,
}: {
  data: z.infer<typeof basicInformationSchema>[];
}) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <DataTable
      data={data}
      columns={releasesTableColumns}
      onRowClick={({ id }) => router.push(pathname + "/" + id)}
    />
  );
};
