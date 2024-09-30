CREATE TABLE IF NOT EXISTS "artist" (
	"id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "artist_id_unique" UNIQUE("id"),
	CONSTRAINT "artist_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artist_to_records" (
	"record_slug" text NOT NULL,
	"artist_slug" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "category" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "label" (
	"id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "label_id_unique" UNIQUE("id"),
	CONSTRAINT "label_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "record" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"label_id" text,
	"year" integer,
	"cat_no" text,
	"videos" jsonb,
	"stock" integer DEFAULT 0 NOT NULL,
	"condition" text,
	"status" text DEFAULT 'active' NOT NULL,
	"price" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "record_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "records_to_categories" (
	"record_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "records_to_categories_record_id_category_id_pk" PRIMARY KEY("record_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favorite_youtube_playlist" (
	"id" serial PRIMARY KEY NOT NULL,
	"playlist_id" text NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "youtube_playlist" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"item_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "youtube_playlist_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "youtube_playlist_item" (
	"playlist_id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artist_to_records" ADD CONSTRAINT "artist_to_records_record_slug_record_slug_fk" FOREIGN KEY ("record_slug") REFERENCES "public"."record"("slug") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artist_to_records" ADD CONSTRAINT "artist_to_records_artist_slug_artist_slug_fk" FOREIGN KEY ("artist_slug") REFERENCES "public"."artist"("slug") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "record" ADD CONSTRAINT "record_label_id_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."label"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "records_to_categories" ADD CONSTRAINT "records_to_categories_record_id_record_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."record"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "records_to_categories" ADD CONSTRAINT "records_to_categories_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "youtube_playlist_item" ADD CONSTRAINT "youtube_playlist_item_playlist_id_youtube_playlist_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."youtube_playlist"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "artist_slug_idx" ON "artist" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "category_name_idx" ON "category" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "category_slug_idx" ON "category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "label_name_idx" ON "label" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "label_slug_idx" ON "label" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "record_name_idx" ON "record" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "record_slug_idx" ON "record" USING btree ("slug");