import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  vaultPasscode: varchar("vaultPasscode", { length: 6 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categories for organizing bills
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#6366f1"),
  icon: varchar("icon", { length: 50 }).notNull().default("receipt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Bills table
export const bills = mysqlTable("bills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).default("pending").notNull(),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurringInterval: mysqlEnum("recurringInterval", ["weekly", "biweekly", "monthly", "quarterly", "yearly"]),
  autopay: boolean("autopay").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bill = typeof bills.$inferSelect;
export type InsertBill = typeof bills.$inferInsert;

// Bill attachments (receipts, invoices stored in S3)
export const billAttachments = mysqlTable("billAttachments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  billId: int("billId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BillAttachment = typeof billAttachments.$inferSelect;
export type InsertBillAttachment = typeof billAttachments.$inferInsert;

// Income sources table
export const incomes = mysqlTable("incomes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  frequency: mysqlEnum("frequency", ["weekly", "biweekly", "monthly", "quarterly", "yearly"]).default("monthly").notNull(),
  source: varchar("source", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Income = typeof incomes.$inferSelect;
export type InsertIncome = typeof incomes.$inferInsert;

// AI-generated budgets
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  totalIncome: decimal("totalIncome", { precision: 12, scale: 2 }).notNull(),
  totalBills: decimal("totalBills", { precision: 12, scale: 2 }).notNull(),
  totalSavings: decimal("totalSavings", { precision: 12, scale: 2 }).notNull(),
  suggestions: text("suggestions"),
  breakdown: text("breakdown"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

// Payments table
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  billId: int("billId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAt: timestamp("paidAt").defaultNow().notNull(),
  method: varchar("method", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Chat messages for AI assistant
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Notification preferences
export const notificationPrefs = mysqlTable("notificationPrefs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  enableReminders: boolean("enableReminders").default(true).notNull(),
  reminderDaysBefore: int("reminderDaysBefore").default(3).notNull(),
  enableOverdueAlerts: boolean("enableOverdueAlerts").default(true).notNull(),
  lastNotifiedAt: timestamp("lastNotifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPref = typeof notificationPrefs.$inferSelect;
export type InsertNotificationPref = typeof notificationPrefs.$inferInsert;
