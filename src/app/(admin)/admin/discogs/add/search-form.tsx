"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export default function AddNewSearchForm() {
  const params = useParams<{ search: string }>();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(
      z.object({
        search: z.string().min(3),
      }),
    ),
    defaultValues: {
      search: params.search ?? "",
    },
  });

  useEffect(() => {
    form.reset({ search: params.search });
  }, [params.search]);

  const onSubmit = (data: { search: string }) => {
    router.push(`/admin/discogs/add/${data.search}`);
  };

  return (
    <Form {...form}>
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem className="mt-0 flex items-center gap-2 space-y-0">
              <FormControl>
                <Input placeholder="Search..." {...field} />
              </FormControl>
              <Button disabled={!form.formState.isValid} type="submit">
                Search
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
