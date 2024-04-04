import { getReleases } from "~/server/queries/discogs";
import { ReleasesTable } from "./table";
import { redirect } from "next/navigation";
import { isLeft } from "effect/Either";

export default async function ReleasesPage({
  params: { folderId },
}: {
  params: { folderId: string };
}) {
  const data = await getReleases(folderId);
  if (!data || isLeft(data)) redirect("/admin/discogs/folders");

  return <ReleasesTable data={data.right.releases} />;
}
