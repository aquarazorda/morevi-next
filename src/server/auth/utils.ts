import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { db } from "../db";
import { lucia } from "./lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import { type Session } from "lucia";

export const testUsername = (username?: string) => {
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return E.left("Invalid username");
  }

  return E.right(username);
};

export const testPassword = (password?: string) => {
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return E.left("Invalid password");
  }

  return E.right(password);
};

export const isExistingUser = (username: string) =>
  pipe(
    TE.tryCatch(
      () =>
        db.query.user.findFirst({
          where: (user, { eq }) => eq(user.username, username.toLowerCase()),
        }),
      () => "Error checking if user exists",
    ),
    TE.chain((existingUser) =>
      !existingUser
        ? TE.left("Username already taken")
        : TE.right(existingUser),
    ),
  );

export const createSessionCookie = (session?: Session | null) => {
  const sessionCookie = session
    ? lucia.createSessionCookie(session.id)
    : lucia.createBlankSessionCookie();

  try {
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } catch {}
};

export const createSession = (userId: string) =>
  pipe(
    TE.tryCatch(
      () => lucia.createSession(userId, {}),
      () => "Error creating session",
    ),
    TE.chainFirst((session) =>
      TE.fromIO(() => {
        createSessionCookie(session);
      }),
    ),
  );

export const validateRequest = cache(
  pipe(
    cookies().get(lucia.sessionCookieName)?.value ?? null,
    (sessionId) =>
      sessionId ? E.right(sessionId) : E.left("No session found"),
    TE.fromEither,
    TE.chain((sessionId) =>
      TE.tryCatch(
        () => lucia.validateSession(sessionId),
        () => "Error validating session",
      ),
    ),
    TE.chainFirst(({ session }) =>
      TE.fromIO(() => {
        createSessionCookie(session);
      }),
    ),
  ),
);
