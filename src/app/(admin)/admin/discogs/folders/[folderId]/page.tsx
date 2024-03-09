import { getReleases } from "~/server/queries/discogs";
import { ReleasesTable } from "./table";
import { redirect } from "next/navigation";

export default async function ReleasesPage({
  params: { folderId },
}: {
  params: { folderId: string };
}) {
  const data = await getReleases(folderId);
  if (!data) redirect("/admin/discogs/folders");

  return <ReleasesTable data={data.releases} />;
}
