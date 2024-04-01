import * as S from "@effect/schema/Schema";
import { removeNumberInParentheses } from "~/lib/utils";

export const discogsSearchResultSchema = S.struct({
  catno: S.optional(S.string),
  cover_image: S.optional(S.string),
  thumb: S.optional(S.string),
  genre: S.optional(S.array(S.string)),
  style: S.optional(S.array(S.string)),
  id: S.number,
  title: S.string.pipe(
    S.transform(
      S.string,
      (title) =>
        title
          .split("-")
          .map((s, i) => (i === 0 ? removeNumberInParentheses(s) : s))
          .join(" - "),
      (transformedTitle) => transformedTitle,
    ),
  ),
  label: S.array(S.string),
  year: S.optional(S.string),
});

export const discogsSearchResultsSchema = S.struct({
  pagination: S.struct({
    page: S.number,
    pages: S.number,
    per_page: S.number,
    items: S.number,
  }),
  results: S.array(discogsSearchResultSchema),
});
