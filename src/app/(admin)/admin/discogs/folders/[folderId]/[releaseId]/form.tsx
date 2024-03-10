"use client";

import { useForm } from "react-hook-form";
import type { z } from "zod";
import ImageSelector from "~/components/admin/release/image-selector";
import {
  Form,
  FormControl,
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
import { capitalize, getReleaseTitle } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import CategorySelector from "~/components/admin/release/categories";
import { addProductToWc, type Categories } from "~/server/queries/woocommerce";
import Tracklist from "~/components/admin/release/tracklist";
import { ScrollArea } from "~/components/ui/scroll-area";
import { recordCondition, recordStatus } from "~/server/db/schema/record";
import { Button } from "~/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import { fold } from "fp-ts/lib/Either";
import { toast } from "sonner";

export default function AddReleaseForm({
  data: {
    id,
    images,
    title,
    artists,
    labels,
    styles,
    genres,
    tracklist,
    videos,
    year,
  },
  categoriesPromise,
}: {
  data: z.infer<typeof releaseSchema>;
  categoriesPromise: Promise<Categories>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [pending, startTransition] = useTransition();
  const search = useSearchParams();
  const defaultValues = useMemo(
    () => ({
      id: String(id),
      image: images?.[0]?.uri,
      title: getReleaseTitle(title, artists),
      labelId: labels?.[0]?.id ? String(labels[0].id) : "",
      label: labels?.[0]?.name,
      catno: labels?.[0]?.catno ?? "",
      category: [],
      year,
      status: "active" as const,
      price: search.get("price") ?? "0.00",
      stock: search.get("quantity") ? Number(search.get("quantity")) : 1,
      condition:
        (search.get(
          "condition",
        ) as unknown as (typeof recordCondition)[number]) ?? "Mint (M)",
      tracks:
        tracklist?.map((track) => ({
          ...track,
          link:
            videos?.find(({ title }) =>
              title.toLowerCase().includes(track.title.toLowerCase()),
            )?.uri ?? "",
        })) ?? [],
    }),
    [],
  );

  const form = useForm<z.infer<typeof addReleaseSchema>>({
    resolver: zodResolver(addReleaseSchema),
    defaultValues,
  });

  const onSubmit = (data: z.infer<typeof addReleaseSchema>) => {
    startTransition(async () => {
      const res = await addProductToWc(data);

      fold(
        (e: string) => {
          toast.error(e);
        },
        (m: string) => {
          toast.success(m);
          router.push(
            pathname.split("/").slice(0, -1).join("/") + "#" + data.id,
          );
        },
      )(res);
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative my-auto h-full min-h-fit flex-col items-center justify-center overflow-hidden rounded-[0.5rem] bg-background shadow lg:container lg:grid lg:max-w-none lg:grid-cols-8 lg:border lg:px-0"
      >
        <div className="relative col-span-2 mb-3 h-full flex-col items-center justify-center bg-muted p-4 dark:border-r lg:mb-0 lg:flex">
          <ImageSelector images={images} />
        </div>
        <div className="col-span-6 flex h-full flex-col justify-between gap-8">
          <ScrollArea className="h-[80dvh] w-full">
            <div className="flex w-full flex-col justify-center space-y-6 p-4">
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
                      <FormMessage />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <CategorySelector
                categoriesPromise={categoriesPromise}
                categories={genres?.concat(styles ?? [])}
              />
              <Tracklist />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input className="w-24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recordCondition.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recordStatus.map((status) => (
                            <SelectItem key={status} value={status}>
                              {capitalize(status)}
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input className="w-24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex w-full justify-end gap-2 p-4">
            <Button variant="outline">
              <a href={`https://www.discogs.com/release/${id}`} target="_blank">
                Preview on discogs
              </a>
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={() => form.reset(defaultValues)}
            >
              Reset
            </Button>
            <Button type="submit" loading={pending}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
