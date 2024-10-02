"use server";

import { redirect } from "next/navigation";
import { getAuthUrl } from "~/server/auth/youtube-oauth";

export const redirectToYoutubeAuth = async () => {
  const authUrl = await getAuthUrl();

  redirect(authUrl);
};
