import { type Config } from "drizzle-kit";
import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  breakpoints: true,
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
