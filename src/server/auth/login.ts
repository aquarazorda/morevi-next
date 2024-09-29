"use server";

import { Argon2id } from "oslo/password";
import { redirect } from "next/navigation";
import {
  createSession,
  createSessionCookie,
  getExistingUser,
  testPassword,
  testUsername,
  validateRequest,
} from "./utils";
import { lucia } from "./lucia";
import { Effect, pipe } from "effect";

const validatePassword = (password: string, hashed_password: string) =>
  pipe(
    Effect.tryPromise({
      try: () => new Argon2id().verify(hashed_password, password),
      catch: () => "Error verifying password",
    }),
    Effect.flatMap(Effect.fromNullable),
    Effect.mapError(() => "Invalid password"),
  );

const login_ = (_: any, formData: FormData) =>
  pipe(
    testUsername(formData.get("username") as string),
    Effect.bindTo("username"),
    Effect.bind("password", () =>
      testPassword(formData.get("password") as string),
    ),
    Effect.bind("existingUser", ({ username }) =>
      pipe(
        getExistingUser(username),
        Effect.flatMap(Effect.fromNullable),
        Effect.mapError(() => "User doesn't exist"),
      ),
    ),
    Effect.tap(({ password, existingUser }) =>
      validatePassword(password, existingUser.hashed_password),
    ),
    Effect.flatMap(({ existingUser }) => createSession(existingUser.id)),
  );

export const login = (_: any, formData: FormData) =>
  pipe(
    login_(_, formData),
    Effect.catchAll(() => Effect.succeed(null)),
    Effect.runPromise,
  );

export async function logout() {
  return pipe(
    validateRequest(),
    Effect.tap(({ session }) =>
      Effect.tryPromise({
        try: () => lucia.invalidateSession(session.id),
        catch: () => "Error invalidating session",
      }),
    ),
    Effect.tap(() => createSessionCookie()),
    Effect.tap(() => Effect.sync(() => redirect("/"))),
  );
}
