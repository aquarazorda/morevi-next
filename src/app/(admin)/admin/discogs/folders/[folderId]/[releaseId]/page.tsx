import { getRelease } from "~/server/queries/discogs";
import AddReleaseForm from "./form";
import { redirect } from "next/navigation";
import { getWcCategories } from "~/server/queries/woocommerce";

export default async function FolderReleasePage({
  params,
}: {
  params: { folderId: string; releaseId: string };
}) {
  const data = await getRelease(params.releaseId);
  if (!data) redirect("/admin/discogs/folders/" + params.folderId);
  const categoriesPromise = getWcCategories();

  return <AddReleaseForm data={data} categoriesPromise={categoriesPromise} />;
}
