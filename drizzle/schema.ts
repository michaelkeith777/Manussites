import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** User's personal kie.ai API key (encrypted) */
  kieApiKey: text("kieApiKey"),
  /** Whether user has completed onboarding */
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Generated images table - stores all images created by users
 */
export const generatedImages = mysqlTable("generated_images", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: varchar("taskId", { length: 128 }).notNull(),
  prompt: text("prompt").notNull(),
  enhancedPrompt: text("enhancedPrompt"),
  originalTopic: text("originalTopic"),
  model: mysqlEnum("model", ["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"]).default("nano-banana").notNull(),
  aspectRatio: varchar("aspectRatio", { length: 16 }).default("1:1").notNull(),
  resolution: varchar("resolution", { length: 8 }).default("1K").notNull(),
  imageUrl: text("imageUrl"),
  s3Key: varchar("s3Key", { length: 512 }),
  status: mysqlEnum("status", ["pending", "generating", "completed", "failed"]).default("pending").notNull(),
  failReason: text("failReason"),
  isFavorite: boolean("isFavorite").default(false).notNull(),
  /** Card rarity level */
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common"),
  /** AI-generated card stats as JSON */
  cardStats: json("cardStats"),
  /** Collection this card belongs to */
  collectionId: int("collectionId"),
  /** Card number within collection */
  cardNumber: int("cardNumber"),
  /** Style reference image URL */
  styleReferenceUrl: text("styleReferenceUrl"),
  /** Digital signature verification code */
  signatureCode: varchar("signatureCode", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;

/**
 * Generation sessions - tracks batch generation requests
 */
export const generationSessions = mysqlTable("generation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: text("topic").notNull(),
  basePrompt: text("basePrompt").notNull(),
  enhancedPrompt: text("enhancedPrompt"),
  model: mysqlEnum("model", ["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"]).default("nano-banana").notNull(),
  imageCount: int("imageCount").default(1).notNull(),
  completedCount: int("completedCount").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "generating", "completed", "failed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GenerationSession = typeof generationSessions.$inferSelect;
export type InsertGenerationSession = typeof generationSessions.$inferInsert;

/**
 * Trending topics cache - stores discovered trending topics
 */
export const trendingTopicsCache = mysqlTable("trending_topics_cache", {
  id: int("id").autoincrement().primaryKey(),
  topic: varchar("topic", { length: 256 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  score: int("score").default(0).notNull(),
  metadata: json("metadata"),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type TrendingTopic = typeof trendingTopicsCache.$inferSelect;
export type InsertTrendingTopic = typeof trendingTopicsCache.$inferInsert;

/**
 * Prompt history - stores user's previously used prompts for quick reuse
 */
export const promptHistory = mysqlTable("prompt_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: text("topic").notNull(),
  sport: varchar("sport", { length: 32 }),
  playerName: varchar("playerName", { length: 128 }),
  team: varchar("team", { length: 128 }),
  prompt: text("prompt").notNull(),
  enhancedPrompt: text("enhancedPrompt"),
  artStyle: varchar("artStyle", { length: 32 }),
  model: mysqlEnum("model", ["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"]).default("nano-banana").notNull(),
  aspectRatio: varchar("aspectRatio", { length: 16 }).default("2:3").notNull(),
  usageCount: int("usageCount").default(1).notNull(),
  lastUsedAt: timestamp("lastUsedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PromptHistory = typeof promptHistory.$inferSelect;
export type InsertPromptHistory = typeof promptHistory.$inferInsert;

/**
 * Watermark presets - stores user's saved watermark configurations
 */
export const watermarkPresets = mysqlTable("watermark_presets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["text", "image"]).default("text").notNull(),
  text: text("text"),
  fontSize: int("fontSize").default(24),
  fontFamily: varchar("fontFamily", { length: 64 }).default("Arial"),
  color: varchar("color", { length: 16 }).default("#ffffff"),
  opacity: int("opacity").default(50),
  position: varchar("position", { length: 32 }).default("bottom-right"),
  rotation: int("rotation").default(0),
  imageUrl: text("imageUrl"),
  imageSize: int("imageSize").default(100),
  customX: int("customX").default(50),
  customY: int("customY").default(50),
  sizePreset: varchar("sizePreset", { length: 16 }).default("medium"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WatermarkPreset = typeof watermarkPresets.$inferSelect;
export type InsertWatermarkPreset = typeof watermarkPresets.$inferInsert;

/**
 * Card collections - themed sets of cards
 */
export const cardCollections = mysqlTable("card_collections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  theme: varchar("theme", { length: 64 }),
  borderStyle: varchar("borderStyle", { length: 64 }).default("classic"),
  borderColor: varchar("borderColor", { length: 16 }).default("#gold"),
  maxCards: int("maxCards").default(100),
  cardCount: int("cardCount").default(0).notNull(),
  cardBackId: int("cardBackId"),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CardCollection = typeof cardCollections.$inferSelect;
export type InsertCardCollection = typeof cardCollections.$inferInsert;

/**
 * Card decks - organized groups of cards for gameplay or printing
 */
export const cardDecks = mysqlTable("card_decks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  cardBackId: int("cardBackId"),
  cardCount: int("cardCount").default(0).notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CardDeck = typeof cardDecks.$inferSelect;
export type InsertCardDeck = typeof cardDecks.$inferInsert;

/**
 * Deck cards - junction table for cards in decks
 */
export const deckCards = mysqlTable("deck_cards", {
  id: int("id").autoincrement().primaryKey(),
  deckId: int("deckId").notNull(),
  imageId: int("imageId").notNull(),
  position: int("position").default(0).notNull(),
  quantity: int("quantity").default(1).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type DeckCard = typeof deckCards.$inferSelect;
export type InsertDeckCard = typeof deckCards.$inferInsert;

/**
 * Custom card backs - user-designed card back images
 */
export const cardBacks = mysqlTable("card_backs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  imageUrl: text("imageUrl"),
  s3Key: varchar("s3Key", { length: 512 }),
  backgroundColor: varchar("backgroundColor", { length: 16 }).default("#1a1a2e"),
  pattern: varchar("pattern", { length: 32 }).default("solid"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CardBack = typeof cardBacks.$inferSelect;
export type InsertCardBack = typeof cardBacks.$inferInsert;

/**
 * Card signatures - digital signatures for authenticity
 */
export const cardSignatures = mysqlTable("card_signatures", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  imageId: int("imageId").notNull(),
  signatureText: varchar("signatureText", { length: 256 }),
  signatureImageUrl: text("signatureImageUrl"),
  verificationCode: varchar("verificationCode", { length: 64 }).notNull(),
  signedAt: timestamp("signedAt").defaultNow().notNull(),
});

export type CardSignature = typeof cardSignatures.$inferSelect;
export type InsertCardSignature = typeof cardSignatures.$inferInsert;
