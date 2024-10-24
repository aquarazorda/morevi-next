"use server";

import { Argon2id } from "oslo/password";

import { generateId } from "lucia";
import { db } from "../db";
import { user } from "../db/schema";
import {
  createSession,
  getExistingUser,
  testPassword,
  testUsername,
} from "./utils";
import { Effect, flow, pipe } from "effect";

const getHashedPassword = flow(
  testPassword,
  Effect.flatMap((password) =>
    Effect.tryPromise({
      try: () => new Argon2id().hash(password),
      catch: () => "Error hashing password",
    }),
  ),
);

export const $signup = async (formData: FormData) =>
  pipe(
    testUsername(formData.get("username") as string),
    Effect.bindTo("username"),
    Effect.bind("hashed_password", () =>
      getHashedPassword(formData.get("password") as string),
    ),
    Effect.tap(({ username }) =>
      pipe(
        getExistingUser(username),
        Effect.catchAll(() => Effect.succeed(null)),
        Effect.flatMap((existingUser) =>
          existingUser
            ? Effect.fail("User already exists")
            : Effect.succeed(existingUser),
        ),
      ),
    ),
    Effect.bind("id", () => Effect.succeed(generateId(15))),
    Effect.tap((values) =>
      Effect.tryPromise({
        try: () => db.insert(user).values(values),
        catch: () => "Error inserting user",
      }),
    ),
    Effect.flatMap(({ id }) => createSession(id)),
    Effect.tapError(Effect.logError),
    Effect.catchAll(() => Effect.succeed(null)),
    Effect.runPromise,
  );
