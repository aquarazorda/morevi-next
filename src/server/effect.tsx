import { Effect } from "effect";
import { redirect } from "next/navigation";

export default function effectComponent<P, A, E>(
  fn: (props: P) => Effect.Effect<A, E>,
) {
  return (props?: P) => {
    return Effect.runPromise(fn(props ?? ({} as P))).catch(
      (cause: { message: string }) => {
        const err = JSON.parse(cause.message) as { _tag: string; url: string };
        if (err._tag === "RedirectError") {
          redirect(err.url);
        }

        return (<div>Error - {cause.message}</div>) as A;
      },
    );
  };
}
