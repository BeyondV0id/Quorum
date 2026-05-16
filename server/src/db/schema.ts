import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uuid,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Better Auth core tables ──────────────────────────────────────────────────

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
  // username plugin
  username: text("username").unique(),
  displayUsername: text("display_username"),
  // app-specific profile fields
  bio: text("bio").default("Wanderer"),
  avatar: text("avatar"),
  links: text("links"),
  posted: integer("posted").default(0).notNull(),
  answered: integer("answered").default(0).notNull(),
});

export const session = pgTable(
  "session",
  {
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
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
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
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// ─── App tables ───────────────────────────────────────────────────────────────

export const spaces = pgTable("spaces", {
  uid: uuid("uid").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  creatorUsername: text("creator_username").references(() => user.username, {
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  colorIndex: integer("color_index").default(0),
});

export const spaceMembers = pgTable("space_members", {
  spaceUid: uuid("space_uid")
    .notNull()
    .references(() => spaces.uid, { onDelete: "cascade" }),
  username: text("username")
    .notNull()
    .references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const questions = pgTable("questions", {
  uid: uuid("uid").primaryKey().defaultRandom(),
  timeCreated: timestamp("time_created").defaultNow(),
  content: text("content"),
  author: text("author")
    .notNull()
    .references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
  spaceUid: uuid("space_uid")
    .notNull()
    .references(() => spaces.uid, { onDelete: "cascade" }),
  upvotesCount: integer("upvotes_count").default(0),
  acceptedAnswerUid: uuid("accepted_answer_uid"),
  pinnedAt: timestamp("pinned_at"),
});

export const answers = pgTable("answers", {
  uid: uuid("uid").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  questionUid: uuid("question_uid")
    .notNull()
    .references(() => questions.uid, { onDelete: "cascade" }),
  timeCreated: timestamp("time_created").defaultNow(),
  author: text("author")
    .notNull()
    .references(() => user.username, { onUpdate: "cascade" }),
  upvotesCount: integer("upvotes_count").default(0),
});

export const questionUpvotes = pgTable("question_upvotes", {
  username: text("username")
    .notNull()
    .references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
  questionUid: uuid("question_uid")
    .notNull()
    .references(() => questions.uid, { onDelete: "cascade" }),
});

export const answerUpvotes = pgTable("answer_upvotes", {
  answerUid: uuid("answer_uid")
    .notNull()
    .references(() => answers.uid, { onDelete: "cascade" }),
  username: text("username")
    .notNull()
    .references(() => user.username, { onUpdate: "cascade" }),
});

export const notifications = pgTable("notifications", {
  uid: uuid("uid").primaryKey().defaultRandom(),
  userUsername: text("user_username")
    .notNull()
    .references(() => user.username, { onUpdate: "cascade", onDelete: "cascade" }),
  actorUsername: text("actor_username").notNull().references(() => user.username, {
    onUpdate: "cascade",
    onDelete: "cascade",
  }),
  type: text("type").notNull(),
  referenceUid: uuid("reference_uid").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  uniqueIndex("unique_notification_idx").on(t.userUsername, t.actorUsername, t.type, t.referenceUid)
]);

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  ownedSpaces: many(spaces),
  questions: many(questions),
  answers: many(answers),
  notifications: many(notifications),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const spacesRelations = relations(spaces, ({ one, many }) => ({
  members: many(spaceMembers),
  questions: many(questions),
  // named 'creatorUser' to avoid conflict with the text column 'creatorUsername'
  creatorUser: one(user, { fields: [spaces.creatorUsername], references: [user.username] }),
}));

export const spaceMembersRelations = relations(spaceMembers, ({ one }) => ({
  space: one(spaces, { fields: [spaceMembers.spaceUid], references: [spaces.uid] }),
  memberUser: one(user, { fields: [spaceMembers.username], references: [user.username] }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  space: one(spaces, { fields: [questions.spaceUid], references: [spaces.uid] }),
  // named 'authorUser' to avoid conflict with the text column 'author'
  authorUser: one(user, { fields: [questions.author], references: [user.username] }),
  answers: many(answers),
  upvotes: many(questionUpvotes),
}));

export const answersRelations = relations(answers, ({ one, many }) => ({
  question: one(questions, { fields: [answers.questionUid], references: [questions.uid] }),
  // named 'authorUser' to avoid conflict with the text column 'author'
  authorUser: one(user, { fields: [answers.author], references: [user.username] }),
  upvotes: many(answerUpvotes),
}));

export const questionUpvotesRelations = relations(questionUpvotes, ({ one }) => ({
  question: one(questions, { fields: [questionUpvotes.questionUid], references: [questions.uid] }),
  voter: one(user, { fields: [questionUpvotes.username], references: [user.username] }),
}));

export const answerUpvotesRelations = relations(answerUpvotes, ({ one }) => ({
  answer: one(answers, { fields: [answerUpvotes.answerUid], references: [answers.uid] }),
  voter: one(user, { fields: [answerUpvotes.username], references: [user.username] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  // named 'actorUser' to avoid conflict with the text column 'actorUsername'
  actorUser: one(user, { fields: [notifications.actorUsername], references: [user.username] }),
}));
