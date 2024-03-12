"use server";

import { Argon2id } from "oslo/password";
import { redirect } from "next/navigation";
import { pipe } from "fp-ts/lib/function";
import {
  createSession,
  createSessionCookie,
  isExistingUser,
  testPassword,
  testUsername,
  validateRequest,
} from "./utils";
import * as TE from "fp-ts/lib/TaskEither";
import { lucia } from "./lucia";

const validatePassword = (password: string, hashed_password: string) =>
  pipe(
    TE.tryCatch(
      () => new Argon2id().verify(hashed_password, password),
      () => "Error validating password",
    ),
    TE.chain((isValid) =>
      isValid ? TE.right(true) : TE.left("Invalid password"),
    ),
  );

export async function login(_: any, formData: FormData) {
  return await pipe(
    testUsername(formData.get("username") as string),
    TE.fromEither,
    TE.bindTo("username"),
    TE.bind("password", () =>
      TE.fromEither(testPassword(formData.get("password") as string)),
    ),
    TE.bind("existingUser", ({ username }) => isExistingUser(username)),
    TE.tap(({ password, existingUser }) =>
      validatePassword(password, existingUser.hashed_password),
    ),
    TE.chain(({ existingUser }) => createSession(existingUser.id)),
    TE.tap(() => TE.fromIO(() => redirect("/"))),
  )();
}

export async function logout() {
  return await pipe(
    validateRequest,
    TE.chain(({ session }) =>
      session ? TE.right(session) : TE.left("Unauthorized"),
    ),
    TE.tap((session) =>
      TE.tryCatch(
        () => lucia.invalidateSession(session.id),
        () => "Error invalidating session",
      ),
    ),
    TE.tap(() => TE.fromIO(createSessionCookie)),
    TE.tap(() => TE.fromIO(() => redirect("/"))),
  )();
}
