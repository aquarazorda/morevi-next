import { Effect } from "effect";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import {
  getAuthUrl,
  getTokens,
  getYoutubeChannelId,
} from "~/server/auth/youtube-oauth";

const setCookie = (
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number,
) =>
  Effect.sync(() => {
    response.cookies.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge,
    });
  });

// Main handler function
const handleRequest = (request: NextRequest) =>
  Effect.gen(function* () {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      const authUrl = yield* Effect.promise(() => getAuthUrl());
      return NextResponse.redirect(authUrl);
    }

    const tokens = yield* Effect.promise(() => getTokens(code));
    const access_token = yield* Effect.fromNullable(tokens.access_token);
    const refresh_token = yield* Effect.fromNullable(tokens.refresh_token);

    const response = NextResponse.redirect(new URL("/admin/digg", request.url));

    yield* setCookie(
      response,
      "youtube_access_token",
      tokens.access_token!,
      3600,
    );

    yield* setCookie(
      response,
      "youtube_refresh_token",
      tokens.refresh_token!,
      30 * 24 * 60 * 60,
    );

    const channelId = yield* getYoutubeChannelId({
      access_token,
      refresh_token,
    });

    yield* setCookie(
      response,
      "youtube_channel_id",
      channelId,
      30 * 24 * 60 * 60,
    );

    return response;
  });

// Export the GET function
export async function GET(request: NextRequest) {
  return Effect.runPromise(
    handleRequest(request).pipe(
      Effect.catchAll(() => Effect.succeed(redirect("/admin/digg"))),
    ),
  );
}
