"use client";

import { type Schema } from "@effect/schema/Schema";
import { type ColumnDef } from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";
import { DataTable } from "~/components/ui/data-table";
import {
  getNotesAsSearchParams,
  getReleaseTitle,
  removeNumberInParentheses,
} from "~/lib/utils";
import {
  type noteSchema,
  type basicInformationSchema,
} from "~/server/schemas/discogs/folders";

type Data = Schema.Type<typeof basicInformationSchema> & {
  notes?: readonly Schema.Type<typeof noteSchema>[];
};

export const releasesTableColumns: ColumnDef<Data>[] = [
  {
    header: "Thumbnail",
    accessorKey: "thumb",
    cell: ({ row }) =>
      row.original.thumb ? (
        <img
          className="size-20"
          src={row.original.thumb}
          alt="Release Image"
          id={String(row.original.id)}
        />
      ) : (
        <div className="bg-grey-200 size-20 items-center justify-center">
          No image found
        </div>
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
    accessorFn: ({ labels }) =>
      labels[0]
        ? removeNumberInParentheses(labels[0]?.name) +
          " (" +
          labels[0]?.catno +
          ")"
        : "",
  },
];

export const ReleasesTable = ({ data }: { data: readonly Data[] }) => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <DataTable
      data={data as Data[]}
      columns={releasesTableColumns}
      onRowClick={({ id, notes }) =>
        router.push(pathname + "/" + id + getNotesAsSearchParams(notes))
      }
    />
  );
};
