import * as S from "@effect/schema/Schema";
import { removeNumberInParentheses } from "~/lib/utils";

export const addReleaseSchema = S.struct({
  id: S.string,
  title: S.string,
  image: S.string.pipe(S.startsWith("http")),
  artists: S.optional(S.array(S.string)),
  labelId: S.string,
  year: S.number,
  catno: S.optional(S.string),
  label: S.optional(S.string),
  tracks: S.optional(
    S.array(
      S.struct({
        position: S.string,
        title: S.string,
        duration: S.optional(S.string),
        link: S.optional(S.string),
      }),
    ),
  ),
  stock: S.number,
  condition: S.literal(
    "Mint (M)",
    "Near Mint (NM or M-)",
    "Very Good Plus (VG+)",
    "Very Good (VG)",
    "Good Plus (G+)",
    "Good (G)",
    "Fair (F)",
    "Poor (P)",
  ),
  status: S.literal("draft", "active"),
  price: S.optional(S.string),
  category: S.array(S.number),
});

export const discogsLabelSchema = S.struct({
  id: S.number,
  name: S.string.pipe(
    S.transform(S.string, removeNumberInParentheses, (name) => name),
  ),
  catno: S.optional(S.string),
});

export const releaseImages = S.optional(
  S.array(
    S.struct({
      type: S.literal("primary", "secondary"),
      uri: S.string.pipe(S.startsWith("http")),
    }),
  ),
);

export const discogsTracklistSchema = S.optional(
  S.array(
    S.struct({
      position: S.string,
      title: S.string,
      duration: S.optional(S.string),
    }),
  ),
);

export const releaseSchema = S.struct({
  id: S.number,
  year: S.number,
  title: S.string,
  artists: S.array(
    S.struct({
      name: S.string.pipe(
        S.transform(S.string, removeNumberInParentheses, (name) => name),
      ),
    }),
  ),
  labels: S.array(discogsLabelSchema),
  genres: S.optional(S.array(S.string)),
  styles: S.optional(S.array(S.string)),
  tracklist: discogsTracklistSchema,
  images: releaseImages,
  videos: S.optional(
    S.array(
      S.struct({
        uri: S.string.pipe(S.startsWith("http")),
        title: S.string,
      }),
    ),
  ),
});
