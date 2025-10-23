ALTER TABLE "audio_files" ADD COLUMN "assemblyai_upload_url" text;--> statement-breakpoint
ALTER TABLE "audio_files" ADD COLUMN "error_message" text;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "entities" jsonb;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "chapters" jsonb;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "content_safety_labels" jsonb;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "language_code" text;--> statement-breakpoint
ALTER TABLE "transcriptions" ADD COLUMN "raw_response" jsonb;--> statement-breakpoint
ALTER TABLE "audio_files" ADD CONSTRAINT "audio_files_assemblyai_id_unique" UNIQUE("assemblyai_id");--> statement-breakpoint
ALTER TABLE "transcriptions" ADD CONSTRAINT "transcriptions_audio_file_id_unique" UNIQUE("audio_file_id");