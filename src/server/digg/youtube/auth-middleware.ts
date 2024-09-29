import { Effect } from "effect";
import { cookies } from "next/headers";
import { getAuthUrl } from "~/server/auth/youtube-oauth";
import { setYoutubeCredentials } from "./index";
import { env } from "~/env";

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

export const withYoutubeAuth = <T, E extends { _tag: string }>(
  operation: Effect.Effect<T, YoutubeAuthError | RedirectError | E, never>,
  redirect_uri?: string,
) =>
  Effect.gen(function* () {
    const accessToken = cookies().get("youtube_access_token")?.value;
    const refreshToken = cookies().get("youtube_refresh_token")?.value;

    if (!accessToken || !refreshToken) {
      const authUrl = yield* Effect.tryPromise(() =>
        getAuthUrl(
          redirect_uri
            ? `${env.NEXT_PUBLIC_APP_URL}${redirect_uri}`
            : undefined,
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
          if (
            error instanceof Error &&
            error.message.includes("invalid_grant")
          ) {
            return yield* Effect.fail(
              new YoutubeAuthError("Invalid grant", ""),
            );
          }
          return yield* Effect.fail(new YoutubeAuthError("Unknown error", ""));
        }),
      ),
    );
  }).pipe(
    Effect.catchTag("YoutubeAuthError", (cause) =>
      Effect.fail(new RedirectError(cause.authUrl)),
    ),
  );
