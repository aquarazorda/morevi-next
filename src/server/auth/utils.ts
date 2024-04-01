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
    Effect.tryPromise({
      try: () =>
        db.query.user.findFirst({
          where: (user, { eq }) => eq(user.username, username.toLowerCase()),
        }),
      catch: () => "Error finding user",
    }),
    Effect.flatMap(Effect.fromNullable),
    Effect.mapError(() => "User doesn't exist"),
  );

export const createSessionCookie = (session?: Session | null) =>
  Effect.sync(() => {
    const sessionCookie = session
      ? lucia.createSessionCookie(session.id)
      : lucia.createBlankSessionCookie();

    Effect.try({
      try: () =>
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        ),
      catch: () => "Error setting session cookie",
    });
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
    Effect.mapError(() => "No session found"),
    Effect.flatMap((sessionId) =>
      Effect.tryPromise({
        try: () => lucia.validateSession(sessionId),
        catch: () => "Error validating session",
      }),
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
