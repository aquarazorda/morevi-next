import { Effect } from "effect";
import { cookies } from "next/headers";
import { oauth2Client } from "~/server/auth/youtube-oauth";

export class NoYoutubeCredentialsError {
  readonly _tag = "NoYoutubeCredentialsError";
}

export const setYoutubeCredentials = (tokens?: {
  access_token: string;
  refresh_token: string;
}) =>
  Effect.gen(function* () {
    const accessToken = yield* Effect.tryPromise(
      async () =>
        tokens?.access_token ??
        (await cookies()).get("youtube_access_token")?.value,
    );

    const refreshToken = yield* Effect.tryPromise(
      async () =>
        tokens?.refresh_token ??
        (await cookies()).get("youtube_refresh_token")?.value,
    );

    if (!refreshToken) {
      yield* Effect.fail(new NoYoutubeCredentialsError());
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  });
