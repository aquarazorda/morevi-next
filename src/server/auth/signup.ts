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

const signup_ = (_: any, formData: FormData) =>
  pipe(
    testUsername(formData.get("username") as string),
    Effect.bindTo("username"),
    Effect.bind("hashed_password", () =>
      getHashedPassword(formData.get("password") as string),
    ),
    Effect.tap(({ username }) =>
      pipe(
        getExistingUser(username),
        Effect.tap((existingUser) =>
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
  );

export const signup = flow(signup_, Effect.either, Effect.runPromise);
