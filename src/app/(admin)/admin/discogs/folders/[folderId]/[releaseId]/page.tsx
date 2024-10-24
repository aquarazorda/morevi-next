import { getRelease } from "~/server/queries/discogs-client";
import AddReleaseForm from "./form";
import { redirect } from "next/navigation";
import { getWcCategories } from "~/server/queries/woocommerce";
import { isLeft } from "effect/Either";

export default async function FolderReleasePage({
  params,
}: {
  params: Promise<{ folderId?: string; releaseId: string }>;
}) {
  const { releaseId, folderId } = await params;
  const data = await getRelease(releaseId);

  if (!data || isLeft(data))
    redirect(
      folderId ? "/admin/discogs/folders/" + folderId : "/admin/discogs/add",
    );
  const categoriesPromise = getWcCategories();

  return (
    <AddReleaseForm data={data.right} categoriesPromise={categoriesPromise} />
  );
}
