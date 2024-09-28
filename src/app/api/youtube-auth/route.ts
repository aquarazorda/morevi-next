import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import {
  getAuthUrl,
  getTokens,
  getYoutubeChannelId,
} from "~/server/auth/youtube-oauth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    const authUrl = await getAuthUrl();
    return NextResponse.redirect(authUrl);
  } else {
    try {
      const tokens = await getTokens(code);
      const response = NextResponse.redirect(
        new URL("/admin/digg", request.url),
      );

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error("Failed to get tokens");
      }

      response.cookies.set("youtube_access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600, // 1 hour
      });

      response.cookies.set("youtube_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      const channelId = await getYoutubeChannelId({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      if (channelId) {
        response.cookies.set("youtube_channel_id", channelId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });
      }

      return response;
    } catch {
      return redirect("/admin/digg");
    }
  }
}
