import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { notifyOwner } from "./_core/notification";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== VAULT ====================
  vault: router({
    hasPasscode: protectedProcedure.query(async ({ ctx }) => {
      const passcode = await db.getVaultPasscode(ctx.user.id);
      return { hasPasscode: !!passcode };
    }),
    setPasscode: protectedProcedure
      .input(z.object({ passcode: z.string().length(4) }))
      .mutation(({ ctx, input }) => db.setVaultPasscode(ctx.user.id, input.passcode)),
    verify: protectedProcedure
      .input(z.object({ passcode: z.string().length(4) }))
      .mutation(async ({ ctx, input }) => {
        const stored = await db.getVaultPasscode(ctx.user.id);
        return { valid: stored === input.passcode };
      }),
  }),

  // ==================== CATEGORIES ====================
  categories: router({
    list: protectedProcedure.query(({ ctx }) => db.getCategories(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(100), color: z.string().max(7).default("#6366f1"), icon: z.string().max(50).default("receipt") }))
      .mutation(({ ctx, input }) => db.createCategory({ ...input, userId: ctx.user.id })),
    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1).max(100).optional(), color: z.string().max(7).optional(), icon: z.string().max(50).optional() }))
      .mutation(({ ctx, input }) => { const { id, ...data } = input; return db.updateCategory(id, ctx.user.id, data); }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteCategory(input.id, ctx.user.id)),
  }),

  // ==================== BILLS ====================
  bills: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional(), categoryId: z.number().optional(), search: z.string().optional(), startDate: z.date().optional(), endDate: z.date().optional() }).optional())
      .query(async ({ ctx, input }) => {
        await db.markBillOverdue(ctx.user.id);
        await db.processRecurringBills(ctx.user.id);
        return db.getBills(ctx.user.id, input);
      }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ ctx, input }) => db.getBillById(input.id, ctx.user.id)),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(200), description: z.string().optional(), amount: z.string(), dueDate: z.date(), categoryId: z.number().nullable().optional(), isRecurring: z.boolean().default(false), recurringInterval: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly"]).nullable().optional(), autopay: z.boolean().default(false), notes: z.string().optional() }))
      .mutation(({ ctx, input }) => db.createBill({ ...input, userId: ctx.user.id, status: "pending", categoryId: input.categoryId ?? null, recurringInterval: input.recurringInterval ?? null })),
    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1).max(200).optional(), description: z.string().optional(), amount: z.string().optional(), dueDate: z.date().optional(), categoryId: z.number().nullable().optional(), status: z.enum(["pending", "paid", "overdue"]).optional(), isRecurring: z.boolean().optional(), recurringInterval: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly"]).nullable().optional(), autopay: z.boolean().optional(), notes: z.string().optional() }))
      .mutation(({ ctx, input }) => { const { id, ...data } = input; return db.updateBill(id, ctx.user.id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => db.deleteBill(input.id, ctx.user.id)),
  }),

  // ==================== BILL ATTACHMENTS ====================
  attachments: router({
    list: protectedProcedure
      .input(z.object({ billId: z.number() }))
      .query(({ ctx, input }) => db.getBillAttachments(input.billId, ctx.user.id)),
    upload: protectedProcedure
      .input(z.object({
        billId: z.number(),
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(100),
        fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
        fileData: z.string(), // base64 encoded
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        // Verify bill belongs to user
        const bill = await db.getBillById(input.billId, userId);
        if (!bill) throw new Error("Bill not found");

        const buffer = Buffer.from(input.fileData, "base64");
        const ext = input.fileName.split(".").pop() || "bin";
        const fileKey = `attachments/${userId}/${input.billId}/${nanoid()}.${ext}`;

        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        return db.createBillAttachment({
          userId,
          billId: input.billId,
          fileName: input.fileName,
          fileKey,
          url,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteBillAttachment(input.id, ctx.user.id)),
  }),

  // ==================== INCOME ====================
  income: router({
    list: protectedProcedure.query(({ ctx }) => db.getIncomes(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(200), amount: z.string(), frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly"]).default("monthly"), source: z.string().optional(), isActive: z.boolean().default(true), notes: z.string().optional() }))
      .mutation(({ ctx, input }) => db.createIncome({ ...input, userId: ctx.user.id })),
    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1).max(200).optional(), amount: z.string().optional(), frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly"]).optional(), source: z.string().optional(), isActive: z.boolean().optional(), notes: z.string().optional() }))
      .mutation(({ ctx, input }) => { const { id, ...data } = input; return db.updateIncome(id, ctx.user.id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => db.deleteIncome(input.id, ctx.user.id)),
    monthlyTotal: protectedProcedure.query(({ ctx }) => db.getMonthlyIncomeTotal(ctx.user.id)),
  }),

  // ==================== BUDGETS ====================
  budget: router({
    list: protectedProcedure.query(({ ctx }) => db.getBudgets(ctx.user.id)),
    generate: protectedProcedure.mutation(async ({ ctx }) => {
      const userId = ctx.user.id;
      const [userBills, userIncomes, userCategories, stats] = await Promise.all([
        db.getBills(userId), db.getIncomes(userId), db.getCategories(userId), db.getDashboardStats(userId),
      ]);
      const monthlyIncome = parseFloat(stats.monthlyIncome);
      const billsSummary = userBills.map(b => `- ${b.name}: $${b.amount}/month, status: ${b.status}, recurring: ${b.isRecurring}`).join("\n");
      const incomeSummary = userIncomes.map(i => `- ${i.name}: $${i.amount}/${i.frequency}, active: ${i.isActive}`).join("\n");
      const categoriesSummary = userCategories.map(c => `- ${c.name}`).join("\n");

      const prompt = `You are ZelvariWise AI, an expert financial advisor. Generate a detailed monthly budget plan based on the user's income and bills.

Monthly Income: $${monthlyIncome.toFixed(2)}
Total Due: $${stats.totalDue}

Income Sources:
${incomeSummary || "No income sources added yet."}

Current Bills:
${billsSummary || "No bills yet."}

Categories:
${categoriesSummary || "No categories yet."}

Generate a comprehensive budget with:
1. A clear breakdown of how to allocate the monthly income
2. Recommended savings amount (aim for 20% if possible)
3. Emergency fund recommendation
4. Specific suggestions to reduce spending
5. Priority ranking of bills
6. Fun financial tips and encouragement

Return your response as JSON with this exact structure:
{
  "name": "Budget plan name (creative and fun)",
  "totalSavings": <number>,
  "breakdown": [
    {"category": "category name", "allocated": <number>, "percentage": <number>, "notes": "brief note"}
  ],
  "suggestions": [
    "suggestion 1",
    "suggestion 2"
  ],
  "summary": "A brief encouraging summary paragraph"
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a financial advisor AI. Always respond with valid JSON only, no markdown." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "budget_plan",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  totalSavings: { type: "number" },
                  breakdown: { type: "array", items: { type: "object", properties: { category: { type: "string" }, allocated: { type: "number" }, percentage: { type: "number" }, notes: { type: "string" } }, required: ["category", "allocated", "percentage", "notes"], additionalProperties: false } },
                  suggestions: { type: "array", items: { type: "string" } },
                  summary: { type: "string" },
                },
                required: ["name", "totalSavings", "breakdown", "suggestions", "summary"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        const parsed = JSON.parse(typeof content === 'string' ? content : '{}');
        const totalBillsAmt = userBills.filter(b => b.status !== "paid").reduce((sum, b) => sum + parseFloat(b.amount), 0);

        const budget = await db.createBudget({
          userId,
          name: parsed.name || "Monthly Budget",
          totalIncome: monthlyIncome.toFixed(2),
          totalBills: totalBillsAmt.toFixed(2),
          totalSavings: (parsed.totalSavings || 0).toFixed(2),
          suggestions: JSON.stringify(parsed.suggestions || []),
          breakdown: JSON.stringify(parsed.breakdown || []),
        });

        return { ...budget, parsed };
      } catch (error) {
        console.error("Budget generation error:", error);
        throw new Error("Failed to generate budget. Please try again.");
      }
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => db.deleteBudget(input.id, ctx.user.id)),
  }),

  // ==================== PAYMENTS ====================
  payments: router({
    list: protectedProcedure
      .input(z.object({ billId: z.number().optional(), startDate: z.date().optional(), endDate: z.date().optional() }).optional())
      .query(({ ctx, input }) => db.getPayments(ctx.user.id, input)),
    create: protectedProcedure
      .input(z.object({ billId: z.number(), amount: z.string(), paidAt: z.date().optional(), method: z.string().optional(), notes: z.string().optional() }))
      .mutation(({ ctx, input }) => db.createPayment({ ...input, userId: ctx.user.id, paidAt: input.paidAt ?? new Date() })),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => db.deletePayment(input.id, ctx.user.id)),
  }),

  // ==================== ANALYTICS ====================
  analytics: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      await db.markBillOverdue(ctx.user.id);
      return db.getDashboardStats(ctx.user.id);
    }),
    spendingByCategory: protectedProcedure
      .input(z.object({ startDate: z.date(), endDate: z.date() }))
      .query(({ ctx, input }) => db.getSpendingByCategory(ctx.user.id, input.startDate, input.endDate)),
    monthlySpending: protectedProcedure
      .input(z.object({ months: z.number().default(6) }).optional())
      .query(({ ctx, input }) => db.getMonthlySpending(ctx.user.id, input?.months ?? 6)),
  }),

  // ==================== NOTIFICATIONS ====================
  notifications: router({
    getPrefs: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await db.getNotificationPrefs(ctx.user.id);
      return prefs || { enableReminders: true, reminderDaysBefore: 3, enableOverdueAlerts: true };
    }),
    updatePrefs: protectedProcedure
      .input(z.object({
        enableReminders: z.boolean().optional(),
        reminderDaysBefore: z.number().min(1).max(14).optional(),
        enableOverdueAlerts: z.boolean().optional(),
      }))
      .mutation(({ ctx, input }) => db.upsertNotificationPrefs(ctx.user.id, input)),
    checkAndNotify: protectedProcedure.mutation(async ({ ctx }) => {
      const userId = ctx.user.id;
      const prefs = await db.getNotificationPrefs(userId);
      const settings = prefs || { enableReminders: true, reminderDaysBefore: 3, enableOverdueAlerts: true };
      const notifications: string[] = [];

      if (settings.enableReminders) {
        const upcomingBills = await db.getUpcomingBillsForNotification(userId, settings.reminderDaysBefore);
        if (upcomingBills.length > 0) {
          const billList = upcomingBills.map(b => {
            const daysUntil = Math.ceil((new Date(b.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return `• ${b.name}: $${b.amount} due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
          }).join("\n");
          const title = `📅 ${upcomingBills.length} Bill${upcomingBills.length > 1 ? 's' : ''} Due Soon`;
          const content = `You have upcoming bills:\n${billList}`;
          try {
            await notifyOwner({ title, content });
            notifications.push(title);
          } catch (e) {
            console.warn("Failed to send upcoming bill notification:", e);
          }
        }
      }

      if (settings.enableOverdueAlerts) {
        const overdueBills = await db.getOverdueBillsForNotification(userId);
        if (overdueBills.length > 0) {
          const billList = overdueBills.map(b => {
            const daysOverdue = Math.ceil((Date.now() - new Date(b.dueDate).getTime()) / (1000 * 60 * 60 * 24));
            return `• ${b.name}: $${b.amount} (${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue)`;
          }).join("\n");
          const title = `🚨 ${overdueBills.length} Overdue Bill${overdueBills.length > 1 ? 's' : ''}!`;
          const content = `These bills are overdue:\n${billList}\n\nPlease make payments as soon as possible.`;
          try {
            await notifyOwner({ title, content });
            notifications.push(title);
          } catch (e) {
            console.warn("Failed to send overdue bill notification:", e);
          }
        }
      }

      await db.upsertNotificationPrefs(userId, { lastNotifiedAt: new Date() });
      return { sent: notifications.length, notifications };
    }),
  }),

  // ==================== AI CHAT ====================
  chat: router({
    messages: protectedProcedure.query(({ ctx }) => db.getChatMessages(ctx.user.id)),
    clear: protectedProcedure.mutation(({ ctx }) => db.clearChatMessages(ctx.user.id)),
    send: protectedProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        await db.saveChatMessage({ userId, role: "user", content: input.message });

        const [userBills, userCategories, stats, recentPayments, userIncomes] = await Promise.all([
          db.getBills(userId), db.getCategories(userId), db.getDashboardStats(userId), db.getPayments(userId), db.getIncomes(userId),
        ]);

        const billsSummary = userBills.map(b => `- ${b.name}: $${b.amount}, due ${new Date(b.dueDate).toLocaleDateString()}, status: ${b.status}, id: ${b.id}${b.categoryId ? `, categoryId: ${b.categoryId}` : ''}`).join("\n");
        const categoriesSummary = userCategories.map(c => `- ${c.name} (id: ${c.id}, color: ${c.color})`).join("\n");
        const paymentsSummary = recentPayments.slice(0, 20).map(p => `- Bill #${p.billId}: $${p.amount} paid on ${new Date(p.paidAt).toLocaleDateString()}`).join("\n");
        const incomeSummary = userIncomes.map(i => `- ${i.name}: $${i.amount}/${i.frequency}, active: ${i.isActive}, id: ${i.id}`).join("\n");

        const systemPrompt = `You are ZelvariWise AI 🧠✨, the ultimate personal billing and budget assistant! You're smart, fun, encouraging, and always ready to help. You use emojis tastefully and keep things upbeat.

Current user's financial snapshot:
- Monthly Income: $${stats.monthlyIncome}
- Total bills: ${stats.totalBills}
- Pending bills: ${stats.pendingBills}
- Overdue bills: ${stats.overdueBills}
- Paid this month: $${stats.paidThisMonth}
- Total amount due: $${stats.totalDue}

Income Sources:
${incomeSummary || "No income sources yet."}

Bills:
${billsSummary || "No bills yet."}

Categories:
${categoriesSummary || "No categories yet."}

Recent Payments:
${paymentsSummary || "No payments yet."}

Today's date: ${new Date().toLocaleDateString()}

You are the CENTRAL hub of ZelvariWise. You can do EVERYTHING:

🎯 BILL MANAGEMENT:
- Add new bills (with smart defaults)
- Edit existing bills
- Delete bills
- Mark bills as paid
- Set up recurring bills

💰 INCOME MANAGEMENT:
- Add income sources
- Edit income details
- Track multiple income streams

📊 BUDGET & ANALYTICS:
- Generate AI-powered budgets
- Analyze spending patterns
- Compare income vs expenses
- Suggest savings strategies
- Provide financial health scores

🏷️ ORGANIZATION:
- Create and manage categories
- Organize bills by type
- Search and filter

💡 SMART INSIGHTS:
- Proactive overdue alerts
- Spending trend analysis
- Bill optimization suggestions
- Financial tips and encouragement

When performing actions, include JSON action blocks:
\`\`\`action
{"type": "create_bill", "data": {"name": "...", "amount": "...", "dueDate": "YYYY-MM-DD", "categoryId": null, "isRecurring": false, "recurringInterval": null}}
\`\`\`
\`\`\`action
{"type": "pay_bill", "data": {"billId": <number>, "amount": "...", "method": "..."}}
\`\`\`
\`\`\`action
{"type": "delete_bill", "data": {"billId": <number>}}
\`\`\`
\`\`\`action
{"type": "update_bill", "data": {"billId": <number>, "name": "...", "amount": "...", "dueDate": "YYYY-MM-DD"}}
\`\`\`
\`\`\`action
{"type": "create_category", "data": {"name": "...", "color": "#hexcolor", "icon": "icon-name"}}
\`\`\`
\`\`\`action
{"type": "create_income", "data": {"name": "...", "amount": "...", "frequency": "monthly", "source": "..."}}
\`\`\`
\`\`\`action
{"type": "update_income", "data": {"incomeId": <number>, "name": "...", "amount": "...", "frequency": "..."}}
\`\`\`
\`\`\`action
{"type": "delete_income", "data": {"incomeId": <number>}}
\`\`\`

Be proactive! If you notice issues (overdue bills, no income tracked, no budget), mention them helpfully. Use markdown formatting with headers, bold, and lists. Keep responses concise but thorough.`;

        const chatHistory = await db.getChatMessages(userId, 20);
        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: systemPrompt },
          ...chatHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        ];

        try {
          const response = await invokeLLM({ messages });
          const assistantContent = typeof response.choices[0]?.message?.content === 'string'
            ? response.choices[0].message.content
            : Array.isArray(response.choices[0]?.message?.content)
              ? response.choices[0].message.content.map((c: any) => c.type === 'text' ? c.text : '').join('')
              : "I'm sorry, I couldn't process that request.";

          const actionMatches = assistantContent.match(/```action\n([\s\S]*?)```/g);
          const executedActions: string[] = [];

          if (actionMatches) {
            for (const match of actionMatches) {
              try {
                const jsonStr = match.replace(/```action\n/, '').replace(/```/, '').trim();
                const action = JSON.parse(jsonStr);
                switch (action.type) {
                  case "create_bill": {
                    const d = action.data;
                    await db.createBill({ userId, name: d.name, amount: d.amount, dueDate: new Date(d.dueDate), categoryId: d.categoryId || null, isRecurring: d.isRecurring || false, recurringInterval: d.recurringInterval || null, autopay: false, status: "pending" });
                    executedActions.push(`✅ Created bill: ${d.name}`);
                    break;
                  }
                  case "pay_bill": {
                    const d = action.data;
                    await db.createPayment({ userId, billId: d.billId, amount: d.amount, method: d.method || null });
                    executedActions.push(`💰 Paid bill #${d.billId}`);
                    break;
                  }
                  case "delete_bill": {
                    await db.deleteBill(action.data.billId, userId);
                    executedActions.push(`🗑️ Deleted bill #${action.data.billId}`);
                    break;
                  }
                  case "create_category": {
                    const d = action.data;
                    await db.createCategory({ userId, name: d.name, color: d.color || "#6366f1", icon: d.icon || "receipt" });
                    executedActions.push(`🏷️ Created category: ${d.name}`);
                    break;
                  }
                  case "update_bill": {
                    const d = action.data;
                    const updateData: any = {};
                    if (d.name) updateData.name = d.name;
                    if (d.amount) updateData.amount = d.amount;
                    if (d.dueDate) updateData.dueDate = new Date(d.dueDate);
                    await db.updateBill(d.billId, userId, updateData);
                    executedActions.push(`✏️ Updated bill #${d.billId}`);
                    break;
                  }
                  case "create_income": {
                    const d = action.data;
                    await db.createIncome({ userId, name: d.name, amount: d.amount, frequency: d.frequency || "monthly", source: d.source || null });
                    executedActions.push(`💵 Added income: ${d.name}`);
                    break;
                  }
                  case "update_income": {
                    const d = action.data;
                    const updateData: any = {};
                    if (d.name) updateData.name = d.name;
                    if (d.amount) updateData.amount = d.amount;
                    if (d.frequency) updateData.frequency = d.frequency;
                    await db.updateIncome(d.incomeId, userId, updateData);
                    executedActions.push(`✏️ Updated income #${d.incomeId}`);
                    break;
                  }
                  case "delete_income": {
                    await db.deleteIncome(action.data.incomeId, userId);
                    executedActions.push(`🗑️ Deleted income #${action.data.incomeId}`);
                    break;
                  }
                }
              } catch (e) {
                console.error("Failed to execute action:", e);
              }
            }
          }

          const cleanContent = assistantContent.replace(/```action\n[\s\S]*?```/g, '').trim();
          await db.saveChatMessage({ userId, role: "assistant", content: cleanContent });
          return { content: cleanContent, actions: executedActions };
        } catch (error) {
          console.error("AI chat error:", error);
          const errorMsg = "I'm sorry, I encountered an error processing your request. Please try again! 🔄";
          await db.saveChatMessage({ userId, role: "assistant", content: errorMsg });
          return { content: errorMsg, actions: [] };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
