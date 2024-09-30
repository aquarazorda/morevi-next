import { Effect } from "effect";
import { cookies, headers } from "next/headers";
import { getAuthUrl } from "~/server/auth/youtube-oauth";
import { type NoYoutubeCredentialsError, setYoutubeCredentials } from "./index";
import { env } from "~/env";
import { type UnknownException } from "effect/Cause";

export class YoutubeAuthError {
  readonly _tag = "YoutubeAuthError";
  constructor(
    readonly message: string,
    readonly authUrl: string,
  ) {}
}

class RedirectError {
  readonly _tag = "RedirectError";
  constructor(readonly url: string) {}
}

export const withYoutubeAuth = <T, E>(
  operation: Effect.Effect<T, E, never>,
  redirect_uri?: string,
): Effect.Effect<
  T,
  | YoutubeAuthError
  | RedirectError
  | NoYoutubeCredentialsError
  | UnknownException
  | E,
  never
> =>
  Effect.gen(function* () {
    const refreshToken = cookies().get("youtube_refresh_token")?.value;

    if (!refreshToken) {
      const h = headers();

      const authUrl = yield* Effect.tryPromise(() =>
        getAuthUrl(
          redirect_uri
            ? `${env.NEXT_PUBLIC_APP_URL}${redirect_uri}`
            : (h.get("referer") ?? ""),
        ),
      );

      return yield* Effect.fail(
        new YoutubeAuthError("Authentication required", authUrl),
      );
    }

    yield* setYoutubeCredentials();

    return yield* operation.pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          const h = headers();
          const authUrl = yield* Effect.tryPromise(() =>
            getAuthUrl(
              redirect_uri
                ? `${env.NEXT_PUBLIC_APP_URL}${redirect_uri}`
                : (h.get("referer") ?? ""),
            ),
          );
          if (
            error instanceof Error &&
            error.message.includes("invalid_grant")
          ) {
            return yield* Effect.fail(
              new YoutubeAuthError("Invalid grant", authUrl),
            );
          }
          return yield* Effect.fail(error);
        }),
      ),
    );
  }).pipe(
    // @ts-expect-error effect problem
    Effect.catchTag("YoutubeAuthError", (cause) =>
      // @ts-expect-error effect problem
      Effect.fail(new RedirectError(cause.authUrl as string)),
    ),
  );
