import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  InsertProject, projects,
  InsertAdCreative, adCreatives,
  InsertCampaign, campaigns,
  InsertGalleryItem, gallery,
  InsertUsageLogEntry, usageLog,
  adTemplates, InsertAdTemplate,
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

/* ─── Users ─── */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
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
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserCredits(userId: number, creditsUsed: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({
    creditsRemaining: sql`GREATEST(${users.creditsRemaining} - ${creditsUsed}, 0)`,
  }).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

/* ─── Projects ─── */
export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(projects).values(data);
  return { id: result[0].insertId };
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projects).where(eq(projects.id, id));
}

/* ─── Ad Creatives ─── */
export async function createAdCreative(data: InsertAdCreative) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(adCreatives).values(data);
  return { id: result[0].insertId };
}

export async function getUserCreatives(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adCreatives).where(eq(adCreatives.userId, userId)).orderBy(desc(adCreatives.createdAt)).limit(limit);
}

export async function getCreativeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adCreatives).where(eq(adCreatives.id, id)).limit(1);
  return result[0];
}

export async function updateCreative(id: number, data: Partial<InsertAdCreative>) {
  const db = await getDb();
  if (!db) return;
  await db.update(adCreatives).set(data).where(eq(adCreatives.id, id));
}

export async function deleteCreative(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(adCreatives).where(eq(adCreatives.id, id));
}

/* ─── Templates ─── */
export async function getPublicTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adTemplates).where(eq(adTemplates.isPublic, true)).orderBy(desc(adTemplates.createdAt));
}

export async function createTemplate(data: InsertAdTemplate) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(adTemplates).values(data);
  return { id: result[0].insertId };
}

/* ─── Campaigns ─── */
export async function createCampaign(data: InsertCampaign) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(campaigns).values(data);
  return { id: result[0].insertId };
}

export async function getUserCampaigns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result[0];
}

export async function updateCampaign(id: number, data: Partial<InsertCampaign>) {
  const db = await getDb();
  if (!db) return;
  await db.update(campaigns).set(data).where(eq(campaigns.id, id));
}

export async function deleteCampaign(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(campaigns).where(eq(campaigns.id, id));
}

/* ─── Gallery ─── */
export async function addToGallery(data: InsertGalleryItem) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(gallery).values(data);
  return { id: result[0].insertId };
}

export async function getUserGallery(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gallery).where(eq(gallery.userId, userId)).orderBy(desc(gallery.createdAt)).limit(limit);
}

export async function deleteGalleryItem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(gallery).where(eq(gallery.id, id));
}

/* ─── Usage Log ─── */
export async function logUsage(data: InsertUsageLogEntry) {
  const db = await getDb();
  if (!db) return;
  await db.insert(usageLog).values(data);
}

export async function getUserUsage(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(usageLog).where(eq(usageLog.userId, userId)).orderBy(desc(usageLog.createdAt)).limit(limit);
}
