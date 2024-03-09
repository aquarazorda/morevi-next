"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { z } from "zod";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import {
  type addReleaseSchema,
  type releaseImages,
} from "~/server/schemas/discogs/release";

export default function ImageSelector({
  images,
}: {
  images: z.infer<typeof releaseImages>;
}) {
  const form = useFormContext<z.infer<typeof addReleaseSchema>>();
  const [imageUrl, setImageUrl] = useState(form.getValues("image"));

  useEffect(() => {
    const { unsubscribe } = form.watch((data, { name }) => {
      if (name === "image") {
        setImageUrl(data.image ?? "");
      }
    });

    return unsubscribe;
  }, [form]);

  return (
    <>
      <div className="absolute inset-0 bg-zinc-900" />
      <div className="z-20 mt-2 flex h-full w-full flex-wrap gap-4">
        <ScrollArea className="flex h-[80dvh] w-full ">
          <div className="flex w-full flex-col items-center justify-center gap-2">
            {images?.map(({ uri }, idx) => (
              <img
                key={idx}
                src={uri}
                alt="Release image"
                className={cn(
                  "z-20 h-40 w-40 cursor-pointer opacity-30 transition-opacity lg:h-64 lg:w-64",
                  imageUrl === uri && "opacity-100",
                )}
                onClick={() => form.setValue("image", uri)}
              />
            ))}
          </div>
        </ScrollArea>
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input className="z-20 mt-auto" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
