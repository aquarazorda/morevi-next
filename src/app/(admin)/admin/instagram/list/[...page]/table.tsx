"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { type z } from "zod";
import { DataTable } from "~/components/ui/data-table";
import { type wcProductResponseSchema } from "~/server/schemas/woocommerce/product";
import AddVideoModal from "./modal";
import { useState } from "react";
import { type Schema } from "@effect/schema/Schema";

type DataType = Schema.Type<typeof wcProductResponseSchema>;

const columns: ColumnDef<DataType["data"][number]>[] = [
  {
    id: "image",
    header: "Image",
    accessorFn: (row) => row.images[0]?.src,
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

function extractYouTubeVideoIds(str: string): string[] {
  const regex =
    /href="(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?([^\s&"]+)"/g;
  const matches = str.match(regex);

  if (matches) {
    return matches
      .map((match) => {
        const videoIdMatch = match.match(/v=([^&"]+)/);
        return videoIdMatch ? videoIdMatch[1] ?? "" : "";
      })
      .filter(Boolean);
  }

  return [];
}

export default function InstagramListTable({
  page,
  data,
}: {
  page: number;
  data: DataType;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [videos, setVideos] = useState<string[]>([]);

  return (
    <>
      <DataTable
        data={data.data as DataType["data"][number][]}
        columns={columns}
        manualPagination
        pageCount={-1}
        onRowClick={(data) => {
          const links = extractYouTubeVideoIds(data.short_description);

          setVideos(links);
          setIsOpen(true);
        }}
        onPaginationChange={(updater) => {
          if (typeof updater !== "function") return;
          const { pageIndex } = updater({
            pageIndex: page - 1,
            pageSize: data.data.length,
          });

          router.push("/admin/instagram/list/" + (pageIndex + 1));
        }}
        pagination={{ pageIndex: page - 1, pageSize: data.data.length }}
      />
      <AddVideoModal isOpen={isOpen} setIsOpen={setIsOpen} videos={videos} />
    </>
  );
}
