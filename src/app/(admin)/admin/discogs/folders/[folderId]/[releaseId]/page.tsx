import { getRelease } from "~/server/queries/discogs";
import AddReleaseForm from "./form";
import { redirect } from "next/navigation";

export default async function FolderReleasePage({
  params,
}: {
  params: { folderId: string; releaseId: string };
}) {
  const data = await getRelease(params.releaseId);
  if (!data) redirect("/admin/discogs/folders/" + params.folderId);

  return <AddReleaseForm data={data} />;
}
