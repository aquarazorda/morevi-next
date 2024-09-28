import { Effect } from "effect";
import { cookies } from "next/headers";
import { getAuthUrl } from "~/server/auth/youtube-oauth";
import { setYoutubeCredentials } from "./index";
import { redirect } from "next/navigation";

export class YoutubeAuthError {
  readonly _tag = "YoutubeAuthError";
  constructor(
    readonly message: string,
    readonly authUrl: string,
  ) {}
}

export const withYoutubeAuth = <T, E>(
  operation: Effect.Effect<T, E | YoutubeAuthError, never>,
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
        error instanceof Error && error.message.includes("invalid_grant")
          ? Effect.fail(new YoutubeAuthError("Invalid grant", error.message))
          : Effect.fail(error),
      ),
    );
  });

export const runYoutubeAuthEffect = async <T, E>(
  effect: Effect.Effect<T, E, never>,
) => {
  const result = await withYoutubeAuth(effect).pipe(
    Effect.either,
    Effect.runPromise,
  );

  if (result._tag === "Left" && result.left instanceof YoutubeAuthError) {
    redirect(result.left.authUrl);
  }

  return result;
};
