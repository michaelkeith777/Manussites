import { eq, and, desc, asc, gte, lte, like, sql, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, bills, payments, categories, chatMessages, type InsertBill, type InsertPayment, type InsertCategory, type InsertChatMessage } from "../drizzle/schema";
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
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== CATEGORIES ====================

export async function getCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId)).orderBy(asc(categories.name));
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateCategory(id: number, userId: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(data).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

export async function deleteCategory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Set bills in this category to null
  await db.update(bills).set({ categoryId: null }).where(and(eq(bills.categoryId, id), eq(bills.userId, userId)));
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

// ==================== BILLS ====================

export async function getBills(userId: number, filters?: {
  status?: string;
  categoryId?: number;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(bills.userId, userId)];

  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(bills.status, filters.status as "pending" | "paid" | "overdue"));
  }
  if (filters?.categoryId) {
    conditions.push(eq(bills.categoryId, filters.categoryId));
  }
  if (filters?.search) {
    conditions.push(like(bills.name, `%${filters.search}%`));
  }
  if (filters?.startDate) {
    conditions.push(gte(bills.dueDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(bills.dueDate, filters.endDate));
  }

  return db.select().from(bills).where(and(...conditions)).orderBy(asc(bills.dueDate));
}

export async function getBillById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bills).where(and(eq(bills.id, id), eq(bills.userId, userId))).limit(1);
  return result[0];
}

export async function createBill(data: InsertBill) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bills).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateBill(id: number, userId: number, data: Partial<InsertBill>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bills).set(data).where(and(eq(bills.id, id), eq(bills.userId, userId)));
}

export async function deleteBill(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(payments).where(and(eq(payments.billId, id), eq(payments.userId, userId)));
  await db.delete(bills).where(and(eq(bills.id, id), eq(bills.userId, userId)));
}

export async function markBillOverdue(userId: number) {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  await db.update(bills).set({ status: "overdue" }).where(
    and(eq(bills.userId, userId), eq(bills.status, "pending"), lte(bills.dueDate, now))
  );
}

// ==================== PAYMENTS ====================

export async function getPayments(userId: number, filters?: { billId?: number; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(payments.userId, userId)];
  if (filters?.billId) conditions.push(eq(payments.billId, filters.billId));
  if (filters?.startDate) conditions.push(gte(payments.paidAt, filters.startDate));
  if (filters?.endDate) conditions.push(lte(payments.paidAt, filters.endDate));

  return db.select().from(payments).where(and(...conditions)).orderBy(desc(payments.paidAt));
}

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data);
  // Mark bill as paid
  await db.update(bills).set({ status: "paid" }).where(eq(bills.id, data.billId));
  return { id: result[0].insertId, ...data };
}

export async function deletePayment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Get the payment to find the bill
  const payment = await db.select().from(payments).where(and(eq(payments.id, id), eq(payments.userId, userId))).limit(1);
  if (payment[0]) {
    await db.delete(payments).where(eq(payments.id, id));
    // Check if there are remaining payments for this bill
    const remaining = await db.select().from(payments).where(eq(payments.billId, payment[0].billId));
    if (remaining.length === 0) {
      await db.update(bills).set({ status: "pending" }).where(eq(bills.id, payment[0].billId));
    }
  }
}

// ==================== ANALYTICS ====================

export async function getSpendingByCategory(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      categoryId: bills.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      total: sql<string>`SUM(${payments.amount})`,
      count: sql<number>`COUNT(${payments.id})`,
    })
    .from(payments)
    .innerJoin(bills, eq(payments.billId, bills.id))
    .leftJoin(categories, eq(bills.categoryId, categories.id))
    .where(
      and(
        eq(payments.userId, userId),
        gte(payments.paidAt, startDate),
        lte(payments.paidAt, endDate)
      )
    )
    .groupBy(bills.categoryId, categories.name, categories.color);
  return result;
}

export async function getMonthlySpending(userId: number, months: number = 6) {
  const db = await getDb();
  if (!db) return [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  const result = await db
    .select({
      month: sql<string>`DATE_FORMAT(${payments.paidAt}, '%Y-%m')`,
      total: sql<string>`SUM(${payments.amount})`,
      count: sql<number>`COUNT(${payments.id})`,
    })
    .from(payments)
    .where(and(eq(payments.userId, userId), gte(payments.paidAt, startDate)))
    .groupBy(sql`DATE_FORMAT(${payments.paidAt}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${payments.paidAt}, '%Y-%m')`);
  return result;
}

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalBills: 0, pendingBills: 0, overdueBills: 0, paidThisMonth: "0", totalDue: "0" };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [totalResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(bills).where(eq(bills.userId, userId));
  const [pendingResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(bills).where(and(eq(bills.userId, userId), eq(bills.status, "pending")));
  const [overdueResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(bills).where(and(eq(bills.userId, userId), eq(bills.status, "overdue")));
  const [paidResult] = await db.select({ total: sql<string>`COALESCE(SUM(${payments.amount}), 0)` }).from(payments).where(and(eq(payments.userId, userId), gte(payments.paidAt, monthStart), lte(payments.paidAt, monthEnd)));
  const [dueResult] = await db.select({ total: sql<string>`COALESCE(SUM(${bills.amount}), 0)` }).from(bills).where(and(eq(bills.userId, userId), or(eq(bills.status, "pending"), eq(bills.status, "overdue"))));

  return {
    totalBills: totalResult?.count ?? 0,
    pendingBills: pendingResult?.count ?? 0,
    overdueBills: overdueResult?.count ?? 0,
    paidThisMonth: paidResult?.total ?? "0",
    totalDue: dueResult?.total ?? "0",
  };
}

// ==================== CHAT MESSAGES ====================

export async function getChatMessages(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(asc(chatMessages.createdAt)).limit(limit);
}

export async function saveChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatMessages).values(data);
  return { id: result[0].insertId, ...data };
}

export async function clearChatMessages(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
}

// ==================== RECURRING BILLS ====================

export async function processRecurringBills(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  // Find paid recurring bills whose due date has passed
  const recurringBills = await db.select().from(bills).where(
    and(
      eq(bills.userId, userId),
      eq(bills.isRecurring, true),
      eq(bills.status, "paid"),
      lte(bills.dueDate, now)
    )
  );

  const newBills = [];
  for (const bill of recurringBills) {
    const nextDue = new Date(bill.dueDate);
    switch (bill.recurringInterval) {
      case "weekly": nextDue.setDate(nextDue.getDate() + 7); break;
      case "biweekly": nextDue.setDate(nextDue.getDate() + 14); break;
      case "monthly": nextDue.setMonth(nextDue.getMonth() + 1); break;
      case "quarterly": nextDue.setMonth(nextDue.getMonth() + 3); break;
      case "yearly": nextDue.setFullYear(nextDue.getFullYear() + 1); break;
    }
    // Only create if next due is in the future
    if (nextDue > now) {
      const newBill = await createBill({
        userId: bill.userId,
        categoryId: bill.categoryId,
        name: bill.name,
        description: bill.description,
        amount: bill.amount,
        dueDate: nextDue,
        status: "pending",
        isRecurring: true,
        recurringInterval: bill.recurringInterval,
        autopay: bill.autopay,
        notes: bill.notes,
      });
      newBills.push(newBill);
    }
  }
  return newBills;
}
