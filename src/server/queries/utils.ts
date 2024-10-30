import { Effect } from "effect";

export const effectToPromise = <A, E extends string>(
  effect: Effect.Effect<A, E>,
): Promise<{ _tag: "success"; value: A } | { _tag: "error"; message: E }> =>
  effect.pipe(
    Effect.flatMap((a) =>
      Effect.succeed({
        _tag: "success" as const,
        value: a,
      }),
    ),
    Effect.catchAll((message) =>
      Effect.succeed({
        _tag: "error" as const,
        message,
      }),
    ),
    Effect.runPromise,
  );
