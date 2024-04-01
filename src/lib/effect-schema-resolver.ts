import * as S from "@effect/schema/Schema";
import { Effect, pipe } from "effect";
import { type FieldValues, type Resolver } from "react-hook-form";

export const createSchemaResolver =
  <A extends FieldValues, I>(schema: S.Schema<A, I, never>): Resolver<A> =>
  (values) =>
    pipe(
      Effect.sync(() => values),
      Effect.flatMap(S.decodeUnknown(schema)),
      Effect.match({
        onFailure: (error) => {
          console.log(error);
          return { values: {}, errors: {} };
          //   error._tag === "Many"
          //     ? error.error.issues.reduce(
          //         (acc, issue) => {
          //           const path = issue.path.join(".");
          //           acc[path] = {
          //             type: issue._tag,
          //             message: issue.message,
          //           };
          //           return acc;
          //         },
          //         {} as Record<string, { type: string; message: string }>,
          //       )
          //     : {
          //         [error.error.path.join(".")]: {
          //           type: error.error._tag,
          //           message: error.error.message,
          //         },
          //       };
          //
          // return Effect.fail({ values: {}, errors });
        },
        onSuccess: (values) => ({ values, errors: {} }),
      }),
      Effect.runSync,
    );
