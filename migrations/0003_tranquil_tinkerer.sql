ALTER TABLE "transcriptions" ADD COLUMN "detected_language" text;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "language_confidence" real;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "word_count" integer;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "speaker_count" integer;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "average_confidence" real;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "low_confidence_segments" jsonb;