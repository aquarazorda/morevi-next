import { Effect } from "effect";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function effectComponent<P, A, E>(
  fn: (props: P) => Effect.Effect<A, E>,
) {
  return (props?: P) =>
    Effect.runPromise(
      fn(props ?? ({} as P)).pipe(Effect.tapError(Effect.logError)),
    ).catch((cause: { message?: string; url?: string; _tag?: string }) => {
      let err = cause;

      try {
        err = cause.message
          ? (JSON.parse(cause.message) as {
              _tag?: string;
              url?: string;
              message?: string;
            })
          : cause;
      } catch {
        err = cause;
      }

      if (err._tag === "RedirectError" && err.url) {
        redirect(err.url);
      }

      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          {err.message ?? err._tag ?? "Something went wrong, please try again."}
          {err.url && (
            <Button asChild>
              <Link prefetch={false} href={err.url}>
                Go back
              </Link>
            </Button>
          )}
        </div>
      ) as A;
    });
}
