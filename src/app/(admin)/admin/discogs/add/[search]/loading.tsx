import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function DiscogsSearchLoading() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card
          key={i}
          className="flex h-full cursor-pointer flex-col justify-around transition-colors"
        >
          <CardHeader>
            <CardTitle>
              <Skeleton className="mx-auto mb-2 size-40" />
              <Skeleton className="h-6" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col  space-y-2">
            <CardTitle>
              <Skeleton className="h-4" />
            </CardTitle>
            <CardTitle>
              <Skeleton className="h-4" />
            </CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
