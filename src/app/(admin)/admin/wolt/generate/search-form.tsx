"use client";

import { useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parse, startOfDay } from "date-fns";
import { useParams, useRouter } from "next/navigation";

export default function WoltGenerateSearchForm() {
  const router = useRouter();
  const params = useParams<{ date?: string }>();

  const [date, setDate] = useState<Date>(
    params.date
      ? parse(
          decodeURIComponent(params.date),
          "yyyy-MM-dd'T'HH:mm:ss'Z'",
          new Date(),
        )
      : new Date(),
  );

  return (
    <div className="flex w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              if (!date) return;

              setDate(date);
              router.push(
                `/admin/wolt/generate/${format(startOfDay(date), "yyyy-MM-dd'T'HH:mm:ss'Z'")}`,
              );
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
