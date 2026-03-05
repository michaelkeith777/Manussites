import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

/* ─── Users ─── */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  plan: mysqlEnum("plan", ["free", "pro", "agency", "enterprise"]).default("free").notNull(),
  creditsRemaining: int("creditsRemaining").default(10).notNull(),
  creditsMonthly: int("creditsMonthly").default(10).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ─── Projects (workspaces) ─── */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  brandName: varchar("brandName", { length: 255 }),
  brandUrl: text("brandUrl"),
  brandLogoUrl: text("brandLogoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/* ─── Ad Creatives (AI-generated ads) ─── */
export const adCreatives = mysqlTable("ad_creatives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  /** The original product image URL uploaded by user */
  productImageUrl: text("productImageUrl"),
  /** The AI-generated ad image URL */
  generatedImageUrl: text("generatedImageUrl"),
  /** The prompt used for generation */
  prompt: text("prompt"),
  /** AI-generated ad headline */
  headline: text("headline"),
  /** AI-generated primary text / body copy */
  primaryText: text("primaryText"),
  /** AI-generated call to action */
  callToAction: varchar("callToAction", { length: 100 }),
  /** Ad format: single, carousel, story, video_thumbnail */
  format: mysqlEnum("format", ["single", "carousel", "story", "video_thumbnail", "banner"]).default("single").notNull(),
  /** Aspect ratio: 1:1, 4:5, 9:16, 16:9 */
  aspectRatio: varchar("aspectRatio", { length: 10 }).default("1:1"),
  /** Platform target */
  platform: mysqlEnum("platform", ["meta", "tiktok", "google", "snapchat", "pinterest", "all"]).default("all"),
  /** Generation status */
  status: mysqlEnum("status", ["pending", "generating", "completed", "failed"]).default("pending").notNull(),
  /** Additional metadata (colors, style, tone, etc.) */
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdCreative = typeof adCreatives.$inferSelect;
export type InsertAdCreative = typeof adCreatives.$inferInsert;

/* ─── Ad Templates ─── */
export const adTemplates = mysqlTable("ad_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["ecommerce", "saas", "local", "fashion", "food", "tech", "general"]).default("general").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  promptTemplate: text("promptTemplate").notNull(),
  defaultHeadline: text("defaultHeadline"),
  defaultPrimaryText: text("defaultPrimaryText"),
  defaultCta: varchar("defaultCta", { length: 100 }),
  aspectRatio: varchar("aspectRatio", { length: 10 }).default("1:1"),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdTemplate = typeof adTemplates.$inferSelect;
export type InsertAdTemplate = typeof adTemplates.$inferInsert;

/* ─── Campaigns ─── */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  name: varchar("name", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["meta", "tiktok", "google", "snapchat", "pinterest"]).notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed", "archived"]).default("draft").notNull(),
  objective: varchar("objective", { length: 100 }),
  budget: bigint("budget", { mode: "number" }),
  spent: bigint("spent", { mode: "number" }).default(0),
  impressions: bigint("impressions", { mode: "number" }).default(0),
  clicks: bigint("clicks", { mode: "number" }).default(0),
  conversions: int("conversions").default(0),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/* ─── Gallery (saved/exported creatives) ─── */
export const gallery = mysqlTable("gallery", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  creativeId: int("creativeId"),
  title: varchar("title", { length: 255 }),
  imageUrl: text("imageUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  format: varchar("format", { length: 20 }),
  width: int("width"),
  height: int("height"),
  fileSize: int("fileSize"),
  tags: json("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GalleryItem = typeof gallery.$inferSelect;
export type InsertGalleryItem = typeof gallery.$inferInsert;

/* ─── Usage / Credits Log ─── */
export const usageLog = mysqlTable("usage_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  creditsUsed: int("creditsUsed").default(1).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsageLogEntry = typeof usageLog.$inferSelect;
export type InsertUsageLogEntry = typeof usageLog.$inferInsert;
