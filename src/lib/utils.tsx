import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type noteSchema } from "~/server/schemas/discogs/folders";
import { toast } from "sonner";
import type * as S from "@effect/schema/Schema";
import { Match } from "effect";

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

export function formatDuration(durationInSeconds: number) {
  if (isNaN(durationInSeconds) || durationInSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  const formattedSeconds = seconds.toString().padStart(2, "0");

  return `${minutes}:${formattedSeconds}`;
}

export function highlightText(text: string, query: string | undefined) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 text-black">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function removeNumberInParentheses<T extends string>(str: T) {
  return str?.replace(/\(?\d+\)?/g, "");
}

export function getReleaseTitle(
  title: string,
  artists: readonly { readonly name: string }[],
) {
  // we need to replace all "(n)" with empty string in artist name
  return `${artists.map((artist) => removeNumberInParentheses(artist.name)).join(", ")} - ${title}`;
}

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
  notes?: readonly S.Schema.Type<typeof noteSchema>[],
) => {
  if (!notes) return "";

  const search = new URLSearchParams();

  notes.forEach((note) => {
    Match.value(note.field_id).pipe(
      Match.when(1, () => search.append("condition", note.value)),
      Match.when(3, () => {
        const { price, quantity } = parsePriceAndQuantity(note.value);
        if (price) search.append("price", String(price - 0.01));
        if (quantity) search.append("quantity", String(quantity));
      }),
      Match.orElse(() => undefined),
    );
  });

  return search.size > 0 ? "?" + search.toString() : "";
};
