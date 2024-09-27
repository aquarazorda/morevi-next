"use server";

import { Effect } from "effect";
import { google } from "googleapis";
import { env } from "~/env";
import { cookies } from "next/headers";

const oauth2Client = new google.auth.OAuth2(
  env.YOUTUBE_CLIENT_ID,
  env.YOUTUBE_CLIENT_SECRET,
  env.YOUTUBE_REDIRECT_URI,
);

export const setYoutubeCredentials = Effect.gen(function* () {
  const accessToken = cookies().get("youtube_access_token")?.value;
  const refreshToken = cookies().get("youtube_refresh_token")?.value;

  if (!accessToken || !refreshToken) {
    yield* Effect.fail(new Error("YouTube tokens not found in cookies"));
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
