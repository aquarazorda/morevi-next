import { getFolders } from "~/server/queries/discogs-client";
import { FoldersTable } from "./table";

export default async function FoldersPage() {
  const folders = await getFolders();

  return <FoldersTable folders={folders} />;
}
