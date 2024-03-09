import { Fragment } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { addReleaseSchema } from "~/server/schemas/discogs/release";

export default function Tracklist() {
  const { control, register } =
    useFormContext<z.infer<typeof addReleaseSchema>>();
  const { fields, remove, append } = useFieldArray({
    control,
    name: "tracks",
  });

  return (
    <FormField
      control={control}
      name="tracks"
      render={() => (
        <FormItem>
          <FormLabel>Tracklist</FormLabel>
          <div className="grid grid-cols-12 grid-rows-1 gap-2">
            {fields?.map((field, idx) => (
              <Fragment key={field.id}>
                <Input
                  className="col-span-1"
                  {...register(`tracks.${idx}.position`)}
                />
                <Input
                  className="col-span-5"
                  {...register(`tracks.${idx}.title`)}
                />
                <Input
                  className="col-span-1"
                  {...register(`tracks.${idx}.duration`)}
                />
                <Input
                  className="col-span-3"
                  {...register(`tracks.${idx}.link`)}
                />
                <Button variant="secondary" type="button" asChild>
                  <a href={field.link} target="_blank">
                    Play
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => remove(idx)}
                >
                  Remove
                </Button>
              </Fragment>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full"
            type="button"
            size="sm"
            onClick={() =>
              append({
                title: "",
                position: "",
                duration: "",
                link: "",
              })
            }
          >
            Add Track
          </Button>
        </FormItem>
      )}
    />
  );
}
