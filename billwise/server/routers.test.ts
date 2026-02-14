import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createUnauthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

// Mock the db module
vi.mock("./db", () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, name: "Utilities", color: "#3b82f6", icon: "receipt", createdAt: new Date() },
    { id: 2, userId: 1, name: "Rent", color: "#ef4444", icon: "receipt", createdAt: new Date() },
  ]),
  createCategory: vi.fn().mockResolvedValue({ id: 3, name: "Subscriptions", color: "#10b981", icon: "receipt" }),
  updateCategory: vi.fn().mockResolvedValue(undefined),
  deleteCategory: vi.fn().mockResolvedValue(undefined),
  getBills: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, name: "Electric Bill", amount: "150.00", dueDate: new Date("2026-03-15"), status: "pending", isRecurring: true, recurringInterval: "monthly", categoryId: 1, autopay: false, description: null, notes: null, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, userId: 1, name: "Rent", amount: "1200.00", dueDate: new Date("2026-03-01"), status: "paid", isRecurring: true, recurringInterval: "monthly", categoryId: 2, autopay: false, description: null, notes: null, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getBillById: vi.fn().mockResolvedValue({ id: 1, userId: 1, name: "Electric Bill", amount: "150.00", dueDate: new Date("2026-03-15"), status: "pending" }),
  createBill: vi.fn().mockResolvedValue({ id: 3, name: "Internet", amount: "79.99" }),
  updateBill: vi.fn().mockResolvedValue(undefined),
  deleteBill: vi.fn().mockResolvedValue(undefined),
  markBillOverdue: vi.fn().mockResolvedValue(undefined),
  processRecurringBills: vi.fn().mockResolvedValue([]),
  getPayments: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, billId: 2, amount: "1200.00", paidAt: new Date(), method: "bank_transfer", notes: null, createdAt: new Date() },
  ]),
  createPayment: vi.fn().mockResolvedValue({ id: 2, billId: 1, amount: "150.00" }),
  deletePayment: vi.fn().mockResolvedValue(undefined),
  getDashboardStats: vi.fn().mockResolvedValue({
    totalBills: 5,
    pendingBills: 3,
    overdueBills: 1,
    paidThisMonth: "1350.00",
    totalDue: "429.99",
    monthlyIncome: "5000.00",
  }),
  getSpendingByCategory: vi.fn().mockResolvedValue([
    { categoryId: 1, categoryName: "Utilities", categoryColor: "#3b82f6", total: "450.00", count: 3 },
    { categoryId: 2, categoryName: "Rent", categoryColor: "#ef4444", total: "2400.00", count: 2 },
  ]),
  getMonthlySpending: vi.fn().mockResolvedValue([
    { month: "2026-01", total: "1500.00", count: 5 },
    { month: "2026-02", total: "1350.00", count: 4 },
  ]),
  getChatMessages: vi.fn().mockResolvedValue([]),
  saveChatMessage: vi.fn().mockResolvedValue({ id: 1 }),
  clearChatMessages: vi.fn().mockResolvedValue(undefined),
  // Attachment mocks
  getBillAttachments: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, billId: 1, fileName: "receipt.pdf", fileKey: "attachments/1/1/abc.pdf", url: "https://s3.example.com/receipt.pdf", mimeType: "application/pdf", fileSize: 102400, createdAt: new Date() },
  ]),
  createBillAttachment: vi.fn().mockResolvedValue({ id: 2, fileName: "invoice.png", url: "https://s3.example.com/invoice.png" }),
  deleteBillAttachment: vi.fn().mockResolvedValue(undefined),
  // Notification mocks
  getNotificationPrefs: vi.fn().mockResolvedValue({ enableReminders: true, reminderDaysBefore: 3, enableOverdueAlerts: true }),
  upsertNotificationPrefs: vi.fn().mockResolvedValue(undefined),
  getUpcomingBillsForNotification: vi.fn().mockResolvedValue([
    { name: "Electric Bill", amount: "150.00", dueDate: new Date(Date.now() + 2 * 86400000) },
  ]),
  getOverdueBillsForNotification: vi.fn().mockResolvedValue([
    { name: "Water Bill", amount: "45.00", dueDate: new Date(Date.now() - 3 * 86400000) },
  ]),
  // Income mocks
  getIncomes: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, name: "Salary", amount: "5000.00", frequency: "monthly", source: "Work", isActive: true, notes: null, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, userId: 1, name: "Freelance", amount: "1500.00", frequency: "monthly", source: "Side gig", isActive: true, notes: null, createdAt: new Date(), updatedAt: new Date() },
  ]),
  createIncome: vi.fn().mockResolvedValue({ id: 3, name: "Dividends", amount: "200.00", frequency: "quarterly" }),
  updateIncome: vi.fn().mockResolvedValue(undefined),
  deleteIncome: vi.fn().mockResolvedValue(undefined),
  getMonthlyIncomeTotal: vi.fn().mockResolvedValue({ total: "6500.00" }),
  // Budget mocks
  getBudgets: vi.fn().mockResolvedValue([
    { id: 1, userId: 1, name: "February Budget", totalIncome: "5000.00", totalBills: "1350.00", totalSavings: "1000.00", suggestions: "[]", breakdown: "[]", createdAt: new Date() },
  ]),
  createBudget: vi.fn().mockResolvedValue({ id: 2, name: "AI Budget Plan", totalIncome: "5000.00", totalBills: "1350.00", totalSavings: "800.00" }),
  deleteBudget: vi.fn().mockResolvedValue(undefined),
  // Vault mocks
  getVaultPasscode: vi.fn().mockResolvedValue("1234"),
  setVaultPasscode: vi.fn().mockResolvedValue(undefined),
}));

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "attachments/1/1/abc.pdf", url: "https://s3.example.com/uploaded.pdf" }),
}));

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          name: "Smart Budget Plan",
          totalSavings: 1000,
          breakdown: [{ category: "Housing", allocated: 1200, percentage: 24, notes: "Rent" }],
          suggestions: ["Cut subscriptions", "Cook at home more"],
          summary: "Great budget plan!",
        }),
      },
    }],
  }),
}));

describe("categories router", () => {
  it("lists categories for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.list();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Utilities");
    expect(result[1].name).toBe("Rent");
  });

  it("creates a new category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.categories.create({
      name: "Subscriptions",
      color: "#10b981",
      icon: "receipt",
    });
    expect(result).toBeDefined();
    expect(result.name).toBe("Subscriptions");
  });

  it("updates a category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.categories.update({ id: 1, name: "Updated Utilities" })
    ).resolves.not.toThrow();
  });

  it("deletes a category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.categories.delete({ id: 1 })
    ).resolves.not.toThrow();
  });

  it("rejects unauthenticated access to categories", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.categories.list()).rejects.toThrow();
  });
});

describe("bills router", () => {
  it("lists bills for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bills.list({});
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Electric Bill");
  });

  it("gets a bill by id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bills.getById({ id: 1 });
    expect(result).toBeDefined();
    expect(result?.name).toBe("Electric Bill");
  });

  it("creates a new bill", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bills.create({
      name: "Internet",
      amount: "79.99",
      dueDate: new Date("2026-03-20"),
      isRecurring: true,
      recurringInterval: "monthly",
      autopay: false,
    });
    expect(result).toBeDefined();
    expect(result.name).toBe("Internet");
  });

  it("creates a bill with minimal fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bills.create({
      name: "One-time bill",
      amount: "50.00",
      dueDate: new Date("2026-04-01"),
    });
    expect(result).toBeDefined();
  });

  it("updates a bill", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bills.update({ id: 1, amount: "175.00", status: "paid" })
    ).resolves.not.toThrow();
  });

  it("deletes a bill", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bills.delete({ id: 1 })
    ).resolves.not.toThrow();
  });

  it("rejects unauthenticated access to bills", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.bills.list({})).rejects.toThrow();
  });

  it("validates bill name is required", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bills.create({
        name: "",
        amount: "50.00",
        dueDate: new Date(),
      })
    ).rejects.toThrow();
  });
});

describe("payments router", () => {
  it("lists payments for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payments.list({});
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe("1200.00");
  });

  it("creates a payment", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payments.create({
      billId: 1,
      amount: "150.00",
      method: "credit_card",
    });
    expect(result).toBeDefined();
    expect(result.amount).toBe("150.00");
  });

  it("creates a payment with custom date", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.payments.create({
      billId: 1,
      amount: "150.00",
      paidAt: new Date("2026-02-10"),
    });
    expect(result).toBeDefined();
  });

  it("deletes a payment", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.payments.delete({ id: 1 })
    ).resolves.not.toThrow();
  });

  it("rejects unauthenticated access to payments", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.payments.list({})).rejects.toThrow();
  });
});

describe("analytics router", () => {
  it("returns dashboard stats", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.analytics.dashboard();
    expect(result.totalBills).toBe(5);
    expect(result.pendingBills).toBe(3);
    expect(result.overdueBills).toBe(1);
    expect(result.paidThisMonth).toBe("1350.00");
    expect(result.totalDue).toBe("429.99");
    expect(result.monthlyIncome).toBe("5000.00");
  });

  it("returns spending by category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.analytics.spendingByCategory({
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
    });
    expect(result).toHaveLength(2);
    expect(result[0].categoryName).toBe("Utilities");
  });

  it("returns monthly spending", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.analytics.monthlySpending({ months: 6 });
    expect(result).toHaveLength(2);
    expect(result[0].month).toBe("2026-01");
  });

  it("rejects unauthenticated access to analytics", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.analytics.dashboard()).rejects.toThrow();
  });
});

describe("income router", () => {
  it("lists income sources for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.income.list();
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Salary");
    expect(result[1].name).toBe("Freelance");
  });

  it("creates a new income source", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.income.create({
      name: "Dividends",
      amount: "200.00",
      frequency: "quarterly",
      source: "Investments",
    });
    expect(result).toBeDefined();
    expect(result.name).toBe("Dividends");
    expect(result.amount).toBe("200.00");
  });

  it("creates income with minimal fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.income.create({
      name: "Side gig",
      amount: "500.00",
    });
    expect(result).toBeDefined();
  });

  it("updates an income source", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.income.update({ id: 1, amount: "5500.00" })
    ).resolves.not.toThrow();
  });

  it("deletes an income source", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.income.delete({ id: 1 })
    ).resolves.not.toThrow();
  });

  it("returns monthly income total", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.income.monthlyTotal();
    expect(result.total).toBe("6500.00");
  });

  it("rejects unauthenticated access to income", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.income.list()).rejects.toThrow();
  });

  it("validates income name is required", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.income.create({ name: "", amount: "100.00" })
    ).rejects.toThrow();
  });
});

describe("budget router", () => {
  it("lists budgets for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.budget.list();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("February Budget");
  });

  it("generates an AI budget", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.budget.generate();
    expect(result).toBeDefined();
    expect(result.name).toBeTruthy();
  });

  it("deletes a budget", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.budget.delete({ id: 1 })
    ).resolves.not.toThrow();
  });

  it("rejects unauthenticated access to budgets", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.budget.list()).rejects.toThrow();
  });
});

describe("vault router", () => {
  it("checks if user has a passcode", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.vault.hasPasscode();
    expect(result.hasPasscode).toBe(true);
  });

  it("sets a vault passcode", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vault.setPasscode({ passcode: "5678" })
    ).resolves.not.toThrow();
  });

  it("verifies correct passcode", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.vault.verify({ passcode: "1234" });
    expect(result.valid).toBe(true);
  });

  it("rejects incorrect passcode", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.vault.verify({ passcode: "0000" });
    expect(result.valid).toBe(false);
  });

  it("validates passcode length", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vault.setPasscode({ passcode: "12" })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated access to vault", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.vault.hasPasscode()).rejects.toThrow();
  });
});

describe("chat router", () => {
  it("returns chat messages", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.chat.messages();
    expect(Array.isArray(result)).toBe(true);
  });

  it("sends a message and gets AI response", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.chat.send({
      message: "What bills do I have?",
    });
    expect(result).toBeDefined();
    expect(result.content).toBeTruthy();
    expect(typeof result.content).toBe("string");
    expect(Array.isArray(result.actions)).toBe(true);
  });

  it("clears chat messages", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.chat.clear()).resolves.not.toThrow();
  });

  it("rejects unauthenticated access to chat", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.chat.messages()).rejects.toThrow();
  });

  it("rejects empty messages", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.chat.send({ message: "" })
    ).rejects.toThrow();
  });
});

describe("attachments router", () => {
  it("lists attachments for a bill", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.attachments.list({ billId: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].fileName).toBe("receipt.pdf");
  });

  it("uploads an attachment", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.attachments.upload({
      billId: 1,
      fileName: "invoice.png",
      mimeType: "image/png",
      fileSize: 50000,
      fileData: "aGVsbG8=", // base64 for "hello"
    });
    expect(result).toBeDefined();
    expect(result.fileName).toBe("invoice.png");
  });

  it("deletes an attachment", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.attachments.delete({ id: 1 })
    ).resolves.not.toThrow();
  });

  it("rejects file over 10MB", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.attachments.upload({
        billId: 1,
        fileName: "huge.pdf",
        mimeType: "application/pdf",
        fileSize: 11 * 1024 * 1024,
        fileData: "aGVsbG8=",
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated access to attachments", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.attachments.list({ billId: 1 })).rejects.toThrow();
  });
});

describe("notifications router", () => {
  it("gets notification preferences", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.getPrefs();
    expect(result.enableReminders).toBe(true);
    expect(result.reminderDaysBefore).toBe(3);
    expect(result.enableOverdueAlerts).toBe(true);
  });

  it("updates notification preferences", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.notifications.updatePrefs({
        enableReminders: false,
        reminderDaysBefore: 7,
      })
    ).resolves.not.toThrow();
  });

  it("checks and sends notifications", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.checkAndNotify();
    expect(result.sent).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.notifications)).toBe(true);
  });

  it("validates reminderDaysBefore range", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.notifications.updatePrefs({ reminderDaysBefore: 0 })
    ).rejects.toThrow();
    await expect(
      caller.notifications.updatePrefs({ reminderDaysBefore: 15 })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated access to notifications", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.notifications.getPrefs()).rejects.toThrow();
  });
});

describe("vault.changePasscode", () => {
  it("changes passcode when current passcode is correct", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.vault.changePasscode({
      currentPasscode: "1234",
      newPasscode: "5678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects change when current passcode is wrong", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vault.changePasscode({
        currentPasscode: "9999",
        newPasscode: "5678",
      })
    ).rejects.toThrow("Current passcode is incorrect");
  });

  it("validates passcode length for change", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vault.changePasscode({
        currentPasscode: "12",
        newPasscode: "5678",
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated passcode change", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.vault.changePasscode({
        currentPasscode: "1234",
        newPasscode: "5678",
      })
    ).rejects.toThrow();
  });
});

describe("exports router", () => {
  it("exports payments as CSV", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.exports.paymentsCSV();
    expect(result.csv).toBeDefined();
    expect(result.csv).toContain("Date,Bill Name,Amount,Method,Notes");
    expect(result.filename).toContain("payments-export-");
    expect(result.filename).toContain(".csv");
  });

  it("exports bills as CSV", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.exports.billsCSV();
    expect(result.csv).toBeDefined();
    expect(result.csv).toContain("Name,Amount,Due Date,Status,Category,Recurring,Interval,Autopay");
    expect(result.filename).toContain("bills-export-");
    expect(result.filename).toContain(".csv");
  });

  it("exports budget as CSV", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.exports.budgetCSV({ budgetId: 1 });
    expect(result.csv).toBeDefined();
    expect(result.csv).toContain("Budget Report:");
    expect(result.filename).toContain(".csv");
  });

  it("throws error for non-existent budget export", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.exports.budgetCSV({ budgetId: 999 })
    ).rejects.toThrow("Budget not found");
  });

  it("rejects unauthenticated access to exports", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.exports.paymentsCSV()).rejects.toThrow();
    await expect(caller.exports.billsCSV()).rejects.toThrow();
  });
});

describe("auth router", () => {
  it("returns user for authenticated request", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test User");
    expect(result?.email).toBe("test@example.com");
  });

  it("returns null for unauthenticated request", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});
