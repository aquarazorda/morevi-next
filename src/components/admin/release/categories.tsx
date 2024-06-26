import type { Schema } from "@effect/schema/Schema";
import { isRight, type Either } from "effect/Either";
import { useFormContext } from "react-hook-form";
import { use, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Toggle } from "~/components/ui/toggle";
import type { Categories } from "~/server/queries/woocommerce";
import type { addReleaseSchema } from "~/server/schemas/discogs/release";

type Props = {
  categories?: string[];
  categoriesPromise: Promise<Either<Categories, unknown>>;
};

export default function CategorySelector({
  categoriesPromise,
  categories,
}: Props) {
  const form = useFormContext<Schema.Type<typeof addReleaseSchema>>();
  const data = use(categoriesPromise);

  useEffect(() => {
    if (data && isRight(data)) {
      const defaultValues = data.right.reduce((acc, { name, id }) => {
        categories?.forEach((category) => {
          if (category.toLowerCase() === name.toLowerCase()) {
            acc.push(id);
          }
        });
        return acc;
      }, [] as number[]);

      form.setValue("category", defaultValues);
    }
  }, [data, categories]);

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categories</FormLabel>
          <ScrollArea className="h-60 w-full">
            <div className="flex flex-wrap gap-1 overflow-y-auto">
              {isRight(data) &&
                data.right.map(({ name, count, id }) => (
                  <Toggle
                    key={id}
                    variant="outline"
                    className="flex-1 text-nowrap"
                    onPressedChange={(value) =>
                      field.onChange(
                        value
                          ? [...field.value, id]
                          : field.value?.filter((v) => v !== id),
                      )
                    }
                    pressed={field.value?.includes(id)}
                  >
                    {name} {field.value?.includes(id) ? count + 1 : count}
                  </Toggle>
                ))}
            </div>
          </ScrollArea>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
