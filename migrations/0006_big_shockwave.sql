CREATE TABLE "transcription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"transcript_id" text NOT NULL,
	"name" text NOT NULL,
	"audio_url" text,
	"text" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"language" text,
	"confidence" text,
	"duration" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transcription_transcript_id_unique" UNIQUE("transcript_id")
);
--> statement-breakpoint
ALTER TABLE "transcription" ADD CONSTRAINT "transcription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;