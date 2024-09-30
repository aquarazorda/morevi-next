import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "~/env";
import * as schema from "./schema";
import { Client } from "pg";

const client = new Client({
  connectionString: env.DATABASE_URL,
});

await client.connect();
export const db = drizzle(client, {
  schema,
});
