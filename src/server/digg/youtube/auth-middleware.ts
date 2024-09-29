import { Effect } from "effect";
import { cookies } from "next/headers";
import { getAuthUrl } from "~/server/auth/youtube-oauth";
import { setYoutubeCredentials } from "./index";

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
) =>
  Effect.gen(function* () {
    const accessToken = cookies().get("youtube_access_token")?.value;
    const refreshToken = cookies().get("youtube_refresh_token")?.value;

    if (!accessToken || !refreshToken) {
      const authUrl = yield* Effect.tryPromise(() => getAuthUrl());
      return yield* Effect.fail(
        new YoutubeAuthError("Authentication required", authUrl),
      );
    }

    yield* setYoutubeCredentials();

    return yield* operation.pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          return yield* error instanceof Error &&
          error.message.includes("invalid_grant")
            ? Effect.fail(new YoutubeAuthError("Invalid grant", error.message))
            : Effect.fail(new YoutubeAuthError("Unknown error", ""));
        }),
      ),
    );
  }).pipe(
    Effect.catchTag("YoutubeAuthError", (cause) =>
      Effect.fail(new RedirectError(cause.authUrl)),
    ),
  );
