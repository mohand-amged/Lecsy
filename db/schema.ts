import { pgTable, text, timestamp, boolean, real, jsonb, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const audioFiles = pgTable("audio_files", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  originalName: text("original_name").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  duration: integer("duration"), // in seconds
  uploadStatus: text("upload_status", { 
    enum: ["pending", "completed", "error"] 
  }).default("pending").notNull(),
  transcriptionStatus: text("transcription_status", { 
    enum: ["pending", "processing", "completed", "error"] 
  }).default("pending").notNull(),
  assemblyaiId: text("assemblyai_id").unique(), // AssemblyAI transcript ID
  assemblyaiUploadUrl: text("assemblyai_upload_url"), // URL returned by AssemblyAI upload
  errorMessage: text("error_message"), // Store any error messages
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const transcriptions = pgTable("transcriptions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  audioFileId: text("audio_file_id")
    .notNull()
    .unique() // One transcription per audio file
    .references(() => audioFiles.id, { onDelete: "cascade" }),
  text: text("text"),
  confidence: real("confidence"),
  
  // Speaker diarization
  speakers: jsonb("speakers"), // Array of speaker segments
  
  // Sentiment analysis
  sentiment: jsonb("sentiment"), // Overall and per-sentence sentiment
  
  // Entity detection & key phrases
  entities: jsonb("entities"), // Detected entities (names, places, etc)
  keyPhrases: jsonb("key_phrases"), // Important phrases/topics
  
  // Summarization
  summary: text("summary"), // Auto-generated summary
  chapters: jsonb("chapters"), // Auto chapters with timestamps
  
  // Word-level data
  words: jsonb("words"), // Word-level timestamps and confidence
  
  // Content safety
  contentSafetyLabels: jsonb("content_safety_labels"), // Content moderation results
  
  // Language detection
  languageCode: text("language_code"), // Detected language
  
  // Raw AssemblyAI response (for debugging/future features)
  rawResponse: jsonb("raw_response"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  audioFiles: many(audioFiles),
  sessions: many(session),
  accounts: many(account),
}));

export const audioFilesRelations = relations(audioFiles, ({ one }) => ({
  user: one(user, {
    fields: [audioFiles.userId],
    references: [user.id],
  }),
  transcription: one(transcriptions, {
    fields: [audioFiles.id],
    references: [transcriptions.audioFileId],
  }),
}));

export const transcriptionsRelations = relations(transcriptions, ({ one }) => ({
  audioFile: one(audioFiles, {
    fields: [transcriptions.audioFileId],
    references: [audioFiles.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// Type exports
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type AudioFile = typeof audioFiles.$inferSelect;
export type NewAudioFile = typeof audioFiles.$inferInsert;
export type Transcription = typeof transcriptions.$inferSelect;
export type NewTranscription = typeof transcriptions.$inferInsert;

export const schema = {
  user,
  session,
  account,
  verification,
  audioFiles,
  transcriptions,
  userRelations,
  audioFilesRelations,
  transcriptionsRelations,
  sessionRelations,
  accountRelations,
};