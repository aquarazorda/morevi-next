import { db } from "../db";
import { lucia } from "./lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import { type Session } from "lucia";
import { Effect, Either, flow, pipe } from "effect";

export const testUsername = (
  username?: string,
): Either.Either<string, string> => {
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return Either.left("Invalid username");
  }

  return Either.right(username);
};

export const testPassword = (
  password?: string,
): Either.Either<string, string> => {
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return Either.left("Invalid password");
  }

  return Either.right(password);
};

export const getExistingUser = (username: string) =>
  pipe(
    Effect.tryPromise(() =>
      db.query.user.findFirst({
        where: (user, { eq }) => eq(user.username, username.toLowerCase()),
      }),
    ),
    Effect.flatMap(Effect.fromNullable),
    Effect.mapError(() => "User doesn't exist"),
  );

export const createSessionCookie = (session?: Session | null) =>
  Effect.sync(() => {
    try {
      const sessionCookie = session
        ? lucia.createSessionCookie(session.id)
        : lucia.createBlankSessionCookie();

      return cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    } catch {}
  });

export const createSession = (userId: string) =>
  pipe(
    Effect.tryPromise({
      try: () => lucia.createSession(userId, {}),
      catch: () => "Error creating session",
    }),
    Effect.tap((session) => createSessionCookie(session)),
  );

export const validateRequest = cache((isAdmin?: boolean) =>
  pipe(
    cookies().get(lucia.sessionCookieName)?.value ?? undefined,
    Effect.fromNullable,
    Effect.flatMap((sessionId) =>
      Effect.tryPromise(() => lucia.validateSession(sessionId)),
    ),
    Effect.flatMap((res) =>
      !res.user || !res.session || (isAdmin && !res.user.isAdmin)
        ? Effect.fail("Invalid session")
        : Effect.succeed(res),
    ),
    Effect.tap(({ session }) => createSessionCookie(session)),
  ),
);

export const validateRequestClient = flow(
  validateRequest,
  Effect.either,
  Effect.runPromise,
);
