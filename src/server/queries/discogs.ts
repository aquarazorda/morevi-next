import { env } from "~/env";
import { pipe, Effect } from "effect";
import type * as S from "@effect/schema/Schema";
import * as ParseResult from "@effect/schema/ParseResult";

export const getDiscogs = <A, I>(path: string, schema: S.Schema<A, I, never>) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        fetch("https://api.discogs.com" + path, {
          headers: {
            Authorization: `Discogs token=${env.DISCOGS_TOKEN}`,
          },
          cache: "no-cache",
        }).then((response) => response.json()),
      catch: () => "Error fetching data",
    }),
    Effect.flatMap(ParseResult.decodeUnknown(schema)),
    Effect.mapError((e) => {
      if (typeof e === "string") {
        return e;
      }

      return (e.actual as { message: string }).message + "\n" + path;
    }),
  );
