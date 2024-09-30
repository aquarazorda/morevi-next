import { Schema } from "@effect/schema"
import { Effect } from "effect"

// Define schemas for server-side environment variables
const ServerSchema = Schema.Struct({
  DATABASE_URL: Schema.String.pipe(Schema.nonEmptyString()),
  DISCOGS_TOKEN: Schema.String,
  WP_HOST: Schema.String.pipe(Schema.nonEmptyString()),
  WP_KEY: Schema.String,
  WP_SECRET: Schema.String,
  SLSK_USER: Schema.String,
  SLSK_PASS: Schema.String,
  YOUTUBE_API_KEY: Schema.String,
  YOUTUBE_CLIENT_ID: Schema.String,
  YOUTUBE_CLIENT_SECRET: Schema.String,
  YOUTUBE_REDIRECT_URI: Schema.String,
  NODE_ENV: Schema.Union(
    Schema.Literal("development"),
    Schema.Literal("test"),
    Schema.Literal("production")
  )
})

// Define schema for client-side environment variables
const ClientSchema = Schema.Struct({
  NEXT_PUBLIC_APP_URL: Schema.String
})

// Combine server and client schemas
const EnvSchema = Schema.extend(ServerSchema, ClientSchema)

// Export the validated environment
export const env = Effect.runSync(Schema.decodeUnknown(EnvSchema)(process.env))