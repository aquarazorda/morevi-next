import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getDiscogsSearch } from "~/server/queries/discogs";

export default async function AddNewRecordSearchPage({
  params: { search },
}: {
  params: { search: string };
}) {
  const searchResults = (await getDiscogsSearch(search))?.results;

  return (
    <div className="grid grid-cols-4 gap-2">
      {searchResults?.map(({ id, title, year, label, thumb }) => (
        <Link
          key={id}
          href={`/admin/discogs/add/${search}/${id}`}
          prefetch={false}
        >
          <Card
            id={String(id)}
            className="flex h-full cursor-pointer flex-col justify-around transition-colors hover:bg-secondary"
          >
            <CardHeader>
              <img src={thumb} className="mx-auto mb-2 size-40" alt={title} />
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col  space-y-2">
              <span className="line-clamp-2">{label?.join(", ")}</span>
              <span>{year}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
