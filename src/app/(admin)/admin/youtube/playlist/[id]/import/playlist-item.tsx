import { Card, CardContent } from "~/components/ui/card";

export default function PlaylistItem({
  thumbnailUrl,
  title,
}: {
  thumbnailUrl: string;
  title: string;
}) {
  return (
    <Card>
      <CardContent className="p-2">
        <div className="relative">
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-auto w-full rounded-md"
          />
        </div>
        <h2 className="mt-2 line-clamp-2 text-center text-sm font-semibold">
          {title}
        </h2>
      </CardContent>
    </Card>
  );
}
