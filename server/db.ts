import { eq, desc, and, gt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  generatedImages, 
  InsertGeneratedImage, 
  GeneratedImage,
  generationSessions,
  InsertGenerationSession,
  GenerationSession,
  trendingTopicsCache,
  InsertTrendingTopic,
  TrendingTopic,
  promptHistory,
  InsertPromptHistory,
  PromptHistory
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Generated Images ============

export async function createGeneratedImage(image: InsertGeneratedImage): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(generatedImages).values(image);
  return result[0].insertId;
}

export async function updateGeneratedImage(id: number, updates: Partial<GeneratedImage>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(generatedImages).set(updates).where(eq(generatedImages.id, id));
}

export async function getGeneratedImagesByUser(userId: number, limit = 50, offset = 0): Promise<GeneratedImage[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(generatedImages)
    .where(and(eq(generatedImages.userId, userId), eq(generatedImages.status, "completed")))
    .orderBy(desc(generatedImages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getFavoriteImages(userId: number): Promise<GeneratedImage[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(generatedImages)
    .where(and(eq(generatedImages.userId, userId), eq(generatedImages.isFavorite, true)))
    .orderBy(desc(generatedImages.createdAt));
}

export async function toggleFavorite(id: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [image] = await db.select().from(generatedImages)
    .where(and(eq(generatedImages.id, id), eq(generatedImages.userId, userId)))
    .limit(1);
  
  if (!image) throw new Error("Image not found");
  
  const newValue = !image.isFavorite;
  await db.update(generatedImages)
    .set({ isFavorite: newValue })
    .where(eq(generatedImages.id, id));
  
  return newValue;
}

export async function getImageById(id: number, userId: number): Promise<GeneratedImage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [image] = await db.select().from(generatedImages)
    .where(and(eq(generatedImages.id, id), eq(generatedImages.userId, userId)))
    .limit(1);
  
  return image;
}

export async function getImageByTaskId(taskId: string): Promise<GeneratedImage | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [image] = await db.select().from(generatedImages)
    .where(eq(generatedImages.taskId, taskId))
    .limit(1);
  
  return image;
}

export async function deleteImage(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(generatedImages)
    .where(and(eq(generatedImages.id, id), eq(generatedImages.userId, userId)));
}

// ============ Generation Sessions ============

export async function createGenerationSession(session: InsertGenerationSession): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(generationSessions).values(session);
  return result[0].insertId;
}

export async function updateGenerationSession(id: number, updates: Partial<GenerationSession>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(generationSessions).set(updates).where(eq(generationSessions.id, id));
}

export async function getSessionById(id: number, userId: number): Promise<GenerationSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [session] = await db.select().from(generationSessions)
    .where(and(eq(generationSessions.id, id), eq(generationSessions.userId, userId)))
    .limit(1);
  
  return session;
}

export async function getSessionImages(sessionId: number): Promise<GeneratedImage[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get session first to get the prompt
  const [session] = await db.select().from(generationSessions)
    .where(eq(generationSessions.id, sessionId))
    .limit(1);
  
  if (!session) return [];
  
  // Get images with matching prompt and user
  return db.select()
    .from(generatedImages)
    .where(and(
      eq(generatedImages.userId, session.userId),
      eq(generatedImages.prompt, session.basePrompt)
    ))
    .orderBy(desc(generatedImages.createdAt));
}

// ============ Trending Topics Cache ============

export async function cacheTrendingTopics(topics: InsertTrendingTopic[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (topics.length === 0) return;
  
  await db.insert(trendingTopicsCache).values(topics);
}

export async function getValidTrendingTopics(): Promise<TrendingTopic[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return db.select()
    .from(trendingTopicsCache)
    .where(gt(trendingTopicsCache.expiresAt, now))
    .orderBy(desc(trendingTopicsCache.score));
}

export async function clearExpiredTopics(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const now = new Date();
  await db.delete(trendingTopicsCache)
    .where(sql`${trendingTopicsCache.expiresAt} < ${now}`);
}

export async function getUserImageCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(generatedImages)
    .where(and(eq(generatedImages.userId, userId), eq(generatedImages.status, "completed")));
  
  return result[0]?.count ?? 0;
}

// ============ User API Key Management ============

export async function saveUserApiKey(userId: number, apiKey: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ kieApiKey: apiKey })
    .where(eq(users.id, userId));
}

export async function getUserApiKey(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [user] = await db.select({ kieApiKey: users.kieApiKey })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user?.kieApiKey ?? null;
}

export async function deleteUserApiKey(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ kieApiKey: null })
    .where(eq(users.id, userId));
}


// ============ User Onboarding ============

export async function isOnboardingComplete(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const [user] = await db.select({ onboardingComplete: users.onboardingComplete })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user?.onboardingComplete ?? false;
}

export async function completeOnboarding(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users)
    .set({ onboardingComplete: true })
    .where(eq(users.id, userId));
}

// ============ Prompt History ============

export async function savePromptToHistory(prompt: InsertPromptHistory): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if similar prompt already exists for this user
  const [existing] = await db.select()
    .from(promptHistory)
    .where(and(
      eq(promptHistory.userId, prompt.userId),
      eq(promptHistory.prompt, prompt.prompt)
    ))
    .limit(1);
  
  if (existing) {
    // Update usage count and last used timestamp
    await db.update(promptHistory)
      .set({ 
        usageCount: sql`${promptHistory.usageCount} + 1`,
        lastUsedAt: new Date()
      })
      .where(eq(promptHistory.id, existing.id));
    return existing.id;
  }
  
  // Insert new prompt history entry
  const result = await db.insert(promptHistory).values(prompt);
  return result[0].insertId;
}

export async function getPromptHistory(userId: number, limit = 20): Promise<PromptHistory[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(promptHistory)
    .where(eq(promptHistory.userId, userId))
    .orderBy(desc(promptHistory.lastUsedAt))
    .limit(limit);
}

export async function deletePromptFromHistory(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(promptHistory)
    .where(and(eq(promptHistory.id, id), eq(promptHistory.userId, userId)));
}

export async function clearPromptHistory(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(promptHistory)
    .where(eq(promptHistory.userId, userId));
}


// ============ Watermark Presets ============

import { 
  watermarkPresets, InsertWatermarkPreset, WatermarkPreset,
  cardCollections, InsertCardCollection, CardCollection,
  cardDecks, InsertCardDeck, CardDeck,
  deckCards, InsertDeckCard, DeckCard,
  cardBacks, InsertCardBack, CardBack,
  cardSignatures, InsertCardSignature, CardSignature
} from "../drizzle/schema";

export async function createWatermarkPreset(preset: InsertWatermarkPreset): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(watermarkPresets).values(preset);
  return result[0].insertId;
}

export async function getWatermarkPresets(userId: number): Promise<WatermarkPreset[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(watermarkPresets)
    .where(eq(watermarkPresets.userId, userId))
    .orderBy(desc(watermarkPresets.createdAt));
}

export async function getWatermarkPresetById(id: number, userId: number): Promise<WatermarkPreset | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [preset] = await db.select()
    .from(watermarkPresets)
    .where(and(eq(watermarkPresets.id, id), eq(watermarkPresets.userId, userId)))
    .limit(1);
  
  return preset;
}

export async function updateWatermarkPreset(id: number, userId: number, updates: Partial<WatermarkPreset>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(watermarkPresets)
    .set(updates)
    .where(and(eq(watermarkPresets.id, id), eq(watermarkPresets.userId, userId)));
}

export async function deleteWatermarkPreset(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(watermarkPresets)
    .where(and(eq(watermarkPresets.id, id), eq(watermarkPresets.userId, userId)));
}

export async function setDefaultWatermarkPreset(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First, unset any existing default
  await db.update(watermarkPresets)
    .set({ isDefault: false })
    .where(eq(watermarkPresets.userId, userId));
  
  // Then set the new default
  await db.update(watermarkPresets)
    .set({ isDefault: true })
    .where(and(eq(watermarkPresets.id, id), eq(watermarkPresets.userId, userId)));
}

export async function getDefaultWatermarkPreset(userId: number): Promise<WatermarkPreset | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [preset] = await db.select()
    .from(watermarkPresets)
    .where(and(eq(watermarkPresets.userId, userId), eq(watermarkPresets.isDefault, true)))
    .limit(1);
  
  return preset;
}


// ============ Card Collections ============

export async function createCollection(collection: InsertCardCollection): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(cardCollections).values(collection);
  return result[0].insertId;
}

export async function getCollections(userId: number): Promise<CardCollection[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(cardCollections)
    .where(eq(cardCollections.userId, userId))
    .orderBy(desc(cardCollections.createdAt));
}

export async function getCollectionById(id: number, userId: number): Promise<CardCollection | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [collection] = await db.select()
    .from(cardCollections)
    .where(and(eq(cardCollections.id, id), eq(cardCollections.userId, userId)))
    .limit(1);
  
  return collection;
}

export async function updateCollection(id: number, userId: number, updates: Partial<CardCollection>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(cardCollections)
    .set(updates)
    .where(and(eq(cardCollections.id, id), eq(cardCollections.userId, userId)));
}

export async function deleteCollection(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // First remove collection reference from all cards
  await db.update(generatedImages)
    .set({ collectionId: null, cardNumber: null })
    .where(eq(generatedImages.collectionId, id));
  
  // Then delete the collection
  await db.delete(cardCollections)
    .where(and(eq(cardCollections.id, id), eq(cardCollections.userId, userId)));
}

export async function addCardToCollection(collectionId: number, imageId: number, userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get collection to check ownership and get next card number
  const [collection] = await db.select()
    .from(cardCollections)
    .where(and(eq(cardCollections.id, collectionId), eq(cardCollections.userId, userId)))
    .limit(1);
  
  if (!collection) throw new Error("Collection not found");
  if (collection.cardCount >= (collection.maxCards || 100)) throw new Error("Collection is full");
  
  const nextCardNumber = collection.cardCount + 1;
  
  // Update the image with collection info
  await db.update(generatedImages)
    .set({ collectionId, cardNumber: nextCardNumber })
    .where(and(eq(generatedImages.id, imageId), eq(generatedImages.userId, userId)));
  
  // Increment collection card count
  await db.update(cardCollections)
    .set({ cardCount: nextCardNumber })
    .where(eq(cardCollections.id, collectionId));
  
  return nextCardNumber;
}

export async function removeCardFromCollection(collectionId: number, imageId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Remove collection reference from the image
  await db.update(generatedImages)
    .set({ collectionId: null, cardNumber: null })
    .where(and(eq(generatedImages.id, imageId), eq(generatedImages.userId, userId)));
  
  // Decrement collection card count
  await db.update(cardCollections)
    .set({ cardCount: sql`${cardCollections.cardCount} - 1` })
    .where(and(eq(cardCollections.id, collectionId), eq(cardCollections.userId, userId)));
}

// ============ Card Decks ============

export async function createDeck(deck: InsertCardDeck): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(cardDecks).values(deck);
  return result[0].insertId;
}

export async function getDecks(userId: number): Promise<CardDeck[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(cardDecks)
    .where(eq(cardDecks.userId, userId))
    .orderBy(desc(cardDecks.createdAt));
}

export async function getDeckById(id: number, userId: number): Promise<CardDeck | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const [deck] = await db.select()
    .from(cardDecks)
    .where(and(eq(cardDecks.id, id), eq(cardDecks.userId, userId)))
    .limit(1);
  
  return deck;
}

export async function deleteDeck(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete all deck cards first
  await db.delete(deckCards).where(eq(deckCards.deckId, id));
  
  // Then delete the deck
  await db.delete(cardDecks)
    .where(and(eq(cardDecks.id, id), eq(cardDecks.userId, userId)));
}

export async function addCardToDeck(deckId: number, imageId: number, quantity: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify deck ownership
  const [deck] = await db.select()
    .from(cardDecks)
    .where(and(eq(cardDecks.id, deckId), eq(cardDecks.userId, userId)))
    .limit(1);
  
  if (!deck) throw new Error("Deck not found");
  
  // Check if card already in deck
  const [existing] = await db.select()
    .from(deckCards)
    .where(and(eq(deckCards.deckId, deckId), eq(deckCards.imageId, imageId)))
    .limit(1);
  
  if (existing) {
    // Update quantity
    await db.update(deckCards)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(deckCards.id, existing.id));
  } else {
    // Get next position
    const [maxPos] = await db.select({ maxPos: sql<number>`MAX(${deckCards.position})` })
      .from(deckCards)
      .where(eq(deckCards.deckId, deckId));
    
    const nextPosition = (maxPos?.maxPos || 0) + 1;
    
    await db.insert(deckCards).values({
      deckId,
      imageId,
      position: nextPosition,
      quantity,
    });
  }
  
  // Update deck card count
  await db.update(cardDecks)
    .set({ cardCount: sql`${cardDecks.cardCount} + ${quantity}` })
    .where(eq(cardDecks.id, deckId));
}

export async function removeCardFromDeck(deckId: number, imageId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the card to know quantity
  const [card] = await db.select()
    .from(deckCards)
    .where(and(eq(deckCards.deckId, deckId), eq(deckCards.imageId, imageId)))
    .limit(1);
  
  if (!card) return;
  
  // Delete the card from deck
  await db.delete(deckCards)
    .where(and(eq(deckCards.deckId, deckId), eq(deckCards.imageId, imageId)));
  
  // Update deck card count
  await db.update(cardDecks)
    .set({ cardCount: sql`${cardDecks.cardCount} - ${card.quantity}` })
    .where(and(eq(cardDecks.id, deckId), eq(cardDecks.userId, userId)));
}

export async function getDeckCards(deckId: number, userId: number): Promise<(DeckCard & { image: GeneratedImage })[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Verify deck ownership
  const [deck] = await db.select()
    .from(cardDecks)
    .where(and(eq(cardDecks.id, deckId), eq(cardDecks.userId, userId)))
    .limit(1);
  
  if (!deck) return [];
  
  const cards = await db.select()
    .from(deckCards)
    .innerJoin(generatedImages, eq(deckCards.imageId, generatedImages.id))
    .where(eq(deckCards.deckId, deckId))
    .orderBy(deckCards.position);
  
  return cards.map(c => ({
    ...c.deck_cards,
    image: c.generated_images,
  }));
}

// ============ Card Backs ============

export async function createCardBack(back: InsertCardBack): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(cardBacks).values(back);
  return result[0].insertId;
}

export async function getCardBacks(userId: number): Promise<CardBack[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(cardBacks)
    .where(eq(cardBacks.userId, userId))
    .orderBy(desc(cardBacks.createdAt));
}

export async function deleteCardBack(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(cardBacks)
    .where(and(eq(cardBacks.id, id), eq(cardBacks.userId, userId)));
}
