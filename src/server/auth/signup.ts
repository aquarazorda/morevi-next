import { Argon2id } from "oslo/password";

import { redirect } from "next/navigation";
import { generateId } from "lucia";
import { db } from "../db";
import { user } from "../db/schema";
import {
  createSession,
  isExistingUser,
  testPassword,
  testUsername,
} from "./utils";
import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

const getHashedPassword = flow(
  testPassword,
  TE.fromEither,
  TE.bindTo("password"),
  TE.chain(({ password }) =>
    TE.tryCatch(
      () => new Argon2id().hash(password),
      () => "Error hashing password",
    ),
  ),
);

export async function signup(_: any, formData: FormData) {
  "use server";

  return pipe(
    testUsername(formData.get("username") as string),
    TE.fromEither,
    TE.bindTo("username"),
    TE.bind("password", () =>
      getHashedPassword(formData.get("password") as string),
    ),
    TE.chainFirst(({ username }) => isExistingUser(username)),
    TE.bind("id", () => TE.right(generateId(15))),
    TE.chainFirst(({ username, password, id }) =>
      TE.tryCatch(
        () =>
          db.insert(user).values({
            id,
            username,
            hashed_password: password,
          }),
        () => "Error creating user",
      ),
    ),
    TE.chain(({ id }) => createSession(id)),
    TE.tap(() => TE.fromIO(() => redirect("/"))),
  );
}
