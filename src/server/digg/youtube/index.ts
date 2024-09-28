import { Effect } from "effect";
import { google } from "googleapis";
import { env } from "~/env";
import { cookies } from "next/headers";

const oauth2Client = new google.auth.OAuth2(
  env.YOUTUBE_CLIENT_ID,
  env.YOUTUBE_CLIENT_SECRET,
  env.YOUTUBE_REDIRECT_URI,
);

class NoYoutubeCredentialsError {
  readonly _tag = "NoYoutubeCredentialsError";
}

export const setYoutubeCredentials = (tokens?: {
  access_token: string;
  refresh_token: string;
}) =>
  Effect.gen(function* () {
    const accessToken =
      tokens?.access_token ?? cookies().get("youtube_access_token")?.value;
    const refreshToken =
      tokens?.refresh_token ?? cookies().get("youtube_refresh_token")?.value;

    if (!accessToken || !refreshToken) {
      yield* Effect.fail(new NoYoutubeCredentialsError());
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  });

export const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});
