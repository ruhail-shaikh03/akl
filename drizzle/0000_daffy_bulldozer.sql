CREATE TYPE "public"."role" AS ENUM('partner', 'admin');--> statement-breakpoint
CREATE TYPE "public"."coupon_status" AS ENUM('locked', 'revealed', 'redeemed');--> statement-breakpoint
CREATE TYPE "public"."usage_type" AS ENUM('single', 'multi');--> statement-breakpoint
CREATE TYPE "public"."chat_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."notif_status" AS ENUM('sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('normal', 'high');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role" NOT NULL,
	"display_name" text NOT NULL,
	"passcode_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_role_unique" UNIQUE("role")
);
--> statement-breakpoint
CREATE TABLE "personal_context" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"partner_name" text NOT NULL,
	"nicknames" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"inside_jokes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cheer_up_list" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"favorites" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"avoid_topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tone" text DEFAULT 'warm, playful' NOT NULL,
	"language" text DEFAULT 'English + casual Urdu mix' NOT NULL,
	"relationship_start_date" date NOT NULL,
	"partner_birthday" date NOT NULL,
	"admin_name" text DEFAULT 'Ruhail' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"caption" text,
	"taken_at" date,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"body_markdown" text NOT NULL,
	"image_blob_url" text,
	"unlock_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "letters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reason_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"cycle_number" integer NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reason_cycles_user_id_cycle_number_unique" UNIQUE("user_id","cycle_number")
);
--> statement-breakpoint
CREATE TABLE "reason_favorites" (
	"user_id" uuid NOT NULL,
	"reason_id" uuid NOT NULL,
	"favorited_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reason_favorites_user_id_reason_id_pk" PRIMARY KEY("user_id","reason_id")
);
--> statement-breakpoint
CREATE TABLE "reason_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cycle_id" uuid NOT NULL,
	"reason_id" uuid NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reason_views_cycle_id_reason_id_unique" UNIQUE("cycle_id","reason_id")
);
--> statement-breakpoint
CREATE TABLE "reasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"emoji" text DEFAULT '🎁' NOT NULL,
	"usage_type" "usage_type" DEFAULT 'single' NOT NULL,
	"max_uses" integer,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"expiry_at" timestamp with time zone,
	"status" "coupon_status" DEFAULT 'locked' NOT NULL,
	"revealed_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"redeemed_by" uuid NOT NULL,
	"redeemed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"note" text,
	"fulfilled_at" timestamp with time zone,
	"admin_response_note" text
);
--> statement-breakpoint
CREATE TABLE "mood_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mood_level" smallint NOT NULL,
	"note" text,
	"checkin_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mood_checkins_user_id_checkin_date_unique" UNIQUE("user_id","checkin_date")
);
--> statement-breakpoint
CREATE TABLE "bucket_list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"target_date" date,
	"completion_photo_blob_url" text,
	"added_by" uuid NOT NULL,
	"completed_by" uuid,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "playlist_songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spotify_track_id" text NOT NULL,
	"title_cache" text,
	"artist_cache" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"note" text,
	"added_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "playlist_songs_spotify_track_id_unique" UNIQUE("spotify_track_id")
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "chat_role" NOT NULL,
	"content" text NOT NULL,
	"tokens_used" integer,
	"flagged_distress" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"event_type" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"quiet_hours_exempt" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"priority" "priority" DEFAULT 'normal' NOT NULL,
	"channel" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "notif_status" NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "letters" ADD CONSTRAINT "letters_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reason_cycles" ADD CONSTRAINT "reason_cycles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reason_favorites" ADD CONSTRAINT "reason_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reason_favorites" ADD CONSTRAINT "reason_favorites_reason_id_reasons_id_fk" FOREIGN KEY ("reason_id") REFERENCES "public"."reasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reason_views" ADD CONSTRAINT "reason_views_cycle_id_reason_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."reason_cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reason_views" ADD CONSTRAINT "reason_views_reason_id_reasons_id_fk" FOREIGN KEY ("reason_id") REFERENCES "public"."reasons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_redeemed_by_users_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_checkins" ADD CONSTRAINT "mood_checkins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bucket_list_items" ADD CONSTRAINT "bucket_list_items_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bucket_list_items" ADD CONSTRAINT "bucket_list_items_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_songs" ADD CONSTRAINT "playlist_songs_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gallery_sort_idx" ON "gallery_photos" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "gallery_deleted_idx" ON "gallery_photos" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "redemption_coupon_idx" ON "redemptions" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "chat_msg_conv_idx" ON "chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "notif_event_idx" ON "notifications_log" USING btree ("event_type");