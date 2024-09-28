import { google } from "googleapis";
import { env } from "~/env";
import { Effect } from "effect";
import { setYoutubeCredentials } from "~/server/digg/youtube";

const oauth2Client = new google.auth.OAuth2(
  env.YOUTUBE_CLIENT_ID,
  env.YOUTUBE_CLIENT_SECRET,
  env.YOUTUBE_REDIRECT_URI,
);

const scopes = ["https://www.googleapis.com/auth/youtube.readonly"];

export async function getAuthUrl(redirect_uri?: string) {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    redirect_uri,
  });
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export const getYoutubeChannelId = (tokens?: {
  access_token: string;
  refresh_token: string;
}) =>
  Effect.gen(function* () {
    yield* setYoutubeCredentials(tokens);

    const response = yield* Effect.tryPromise(() =>
      google
        .youtube({
          version: "v3",
          auth: oauth2Client,
        })
        .channels.list({
          part: ["id"],
          mine: true,
        }),
    );

    return yield* Effect.fromNullable(response.data.items?.[0]?.id ?? null);
  });

export const isYoutubeConnected = Effect.gen(function* () {
  const channelId = yield* getYoutubeChannelId();
  return !!channelId;
});
