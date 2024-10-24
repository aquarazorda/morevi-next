import { ReleasesTable } from "./table";
import { redirect } from "next/navigation";
import { isLeft } from "effect/Either";
import { getReleases } from "~/server/queries/discogs-client";

export default async function ReleasesPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  const data = await getReleases(folderId);
  if (!data || isLeft(data)) redirect("/admin/discogs/folders");

  return <ReleasesTable data={data.right.releases} />;
}
