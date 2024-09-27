import { type NextRequest, NextResponse } from "next/server";
import { getAuthUrl, getTokens } from "~/server/auth/youtube-oauth";

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

      // Set tokens in cookies
      if (tokens.access_token) {
        response.cookies.set("youtube_access_token", tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 3600, // 1 hour
        });
      }

      if (tokens.refresh_token) {
        response.cookies.set("youtube_refresh_token", tokens.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });
      }

      return response;
    } catch (error) {
      console.error("Error getting tokens:", error);
      return NextResponse.json(
        { error: "Failed to get tokens" },
        { status: 500 },
      );
    }
  }
}
