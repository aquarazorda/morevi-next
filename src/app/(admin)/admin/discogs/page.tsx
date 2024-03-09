import { FoldersIcon } from "lucide-react";
import { Card, CardContent, CardTitle } from "~/components/ui/card";

export default function DiscogsPage() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card className="flex items-center">
        <CardTitle>
          <FoldersIcon />
        </CardTitle>
        <CardContent className="items-center p-0 font-semibold uppercase">
          Folders
        </CardContent>
      </Card>
      <Card className="flex items-center">
        <CardTitle>
          <FoldersIcon />
        </CardTitle>
        <CardContent className="items-center p-0 font-semibold uppercase">
          Search
        </CardContent>
      </Card>
    </div>
  );
}
