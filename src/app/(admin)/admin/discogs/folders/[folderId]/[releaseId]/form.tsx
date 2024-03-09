"use client";

import { useForm } from "react-hook-form";
import type { z } from "zod";
import ImageSelector from "~/components/admin/release/image-selector";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  addReleaseSchema,
  type releaseSchema,
} from "~/server/schemas/discogs/release";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { getReleaseTitle } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export default function AddReleaseForm({
  data: { id, images, title, artists, labels, ...rest },
}: {
  data: z.infer<typeof releaseSchema>;
}) {
  const form = useForm<z.infer<typeof addReleaseSchema>>({
    resolver: zodResolver(addReleaseSchema),
    defaultValues: {
      id: String(id),
      image: images?.[0]?.uri,
      title: getReleaseTitle(title, artists),
      labelId: labels?.[0]?.id ? String(labels[0].id) : "",
      catno: labels?.[0]?.catno ?? "",
      ...rest,
    },
  });

  return (
    <Form {...form}>
      <form className="relative my-auto h-full min-h-fit flex-col items-center justify-center overflow-hidden rounded-[0.5rem] bg-background shadow lg:container lg:grid lg:max-w-none lg:grid-cols-8 lg:border lg:px-0">
        <div className="relative col-span-2 mb-3 h-full flex-col items-center justify-center bg-muted p-4 dark:border-r lg:mb-0 lg:flex">
          <ImageSelector images={images} />
        </div>
        <div className="col-span-6 flex h-full flex-col justify-between gap-8 p-4">
          <div className="flex w-full flex-col justify-center space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full gap-2">
              <FormField
                control={form.control}
                name="labelId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Label</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select label" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {labels.map((label) => (
                          <SelectItem key={label.id} value={String(label.id)}>
                            {label.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="catno"
                render={({ field }) => (
                  <FormItem className="w-48">
                    <FormLabel>Cat#</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
