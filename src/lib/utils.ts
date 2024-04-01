import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type ZodSchema, type z } from "zod";
import { type noteSchema } from "~/server/schemas/discogs/folders";
import { match } from "ts-pattern";
import { toast } from "sonner";
import { left, right } from "fp-ts/lib/Either";

export const fromPromiseFn =
  <T, U>(promiseFn: (args: U) => Promise<T>) =>
  (args: U) =>
  () => {
    console.log(args);
    return promiseFn(args);
  };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function removeNumberInParentheses<T extends string>(str: T) {
  return str?.replace(/\(?\d+\)?/g, "");
}

export function getReleaseTitle(title: string, artists: { name: string }[]) {
  // we need to replace all "(n)" with empty string in artist name
  return `${artists.map((artist) => removeNumberInParentheses(artist.name)).join(", ")} - ${title}`;
}

export const parseToEither =
  <T>(schema: ZodSchema<T>) =>
  (data: unknown) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return right(result.data);
    }

    return left(result.error.flatten().formErrors.join(" | "));
  };

export async function copyToClipboard(text: string) {
  try {
    await window.navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard");
  } catch (_) {
    toast.error("Failed to copy to clipboard");
  }
}

const parsePriceAndQuantity = (
  input: string,
): { price?: number; quantity?: number } => {
  const parts = input.split(" ");
  if (!parts[0]) {
    return {};
  }
  const price = parseInt(parts[0], 10);
  const quantityPart = parts.find((part) => part.startsWith("x"));

  if (quantityPart) {
    const quantity = parseInt(quantityPart.slice(1), 10);
    return { price, quantity };
  }

  return { price };
};

export const getNotesAsSearchParams = (
  notes?: z.infer<typeof noteSchema>[],
) => {
  if (!notes) return "";

  const search = new URLSearchParams();
  notes.forEach((note) => {
    match(note.field_id)
      .with(1, () => search.append("condition", note.value))
      .with(3, () => {
        const { price, quantity } = parsePriceAndQuantity(note.value);
        if (price) search.append("price", String(price - 0.01));
        if (quantity) search.append("quantity", String(quantity));
      })
      .otherwise(() => {
        undefined;
      });
  });

  return search.size > 0 ? "?" + search.toString() : "";
};
