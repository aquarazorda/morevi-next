import { Effect } from "effect";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

export default function effectComponent<P, E>(
  fn: (props?: P) => Effect.Effect<ReactNode, E>,
) {
  return (props?: P) => {
    return Effect.runPromise(fn(props)).catch((cause: { message: string }) => {
      const err = JSON.parse(cause.message) as { _tag: string; url: string };
      if (err._tag === "RedirectError") {
        redirect(err.url);
      }

      return <div>Error - {cause.message}</div>;
    });
  };
}
