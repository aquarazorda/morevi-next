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
import { fromPromiseFn } from "~/lib/utils";

const getHashedPassword = flow(
  testPassword,
  TE.fromEither,
  TE.chainTaskK(fromPromiseFn(new Argon2id().hash)),
);

export async function signup(_: any, formData: FormData) {
  "use server";

  return pipe(
    TE.fromEither(testUsername(formData.get("username") as string)),
    TE.bindTo("username"),
    TE.bind("hashed_password", () =>
      getHashedPassword(formData.get("password") as string),
    ),
    TE.chainFirst(({ username }) => isExistingUser(username)),
    TE.bind("id", () => TE.right(generateId(15))),
    TE.chainFirstTaskK(
      fromPromiseFn((values) => db.insert(user).values(values)),
    ),
    TE.chain(({ id }) => createSession(id)),
    TE.tap(() => TE.fromIO(() => redirect("/"))),
  );
}
