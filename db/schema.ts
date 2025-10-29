import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
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
    .$onUpdate(() => new Date())
    .notNull(),
});


export const transcription = pgTable("transcription", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  transcriptId: text("transcript_id").notNull().unique(),
  name: text("name").notNull(),
  audioUrl: text("audio_url"),
  text: text("text"),
  status: text("status").notNull().default('queued'),
  language: text("language"),
  confidence: text("confidence"),
  duration: text("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notification = pgTable("notification", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body"),
  type: text("type"),
  resourceId: text("resource_id"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  transcriptions: many(transcription),
  notifications: many(notification),
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

export const transcriptionRelations = relations(transcription, ({ one }) => ({
  user: one(user, {
    fields: [transcription.userId],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

// Type exports
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Transcription = typeof transcription.$inferSelect;
export type NewTranscription = typeof transcription.$inferInsert;
export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;

export const schema = {
  user,
  session,
  account,
  verification,
  transcription,
  notification,
  userRelations,
  sessionRelations,
  accountRelations,
  transcriptionRelations,
  notificationRelations,
};
