import { getFolders } from "~/server/queries/discogs";
import { FoldersTable } from "./table";
import { Effect } from "effect";

export default async function FoldersPage() {
  const { folders } = await Effect.runPromise(getFolders);

  return <FoldersTable folders={folders} />;
}
