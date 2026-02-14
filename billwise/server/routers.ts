import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

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

  // ==================== CATEGORIES ====================
  categories: router({
    list: protectedProcedure.query(({ ctx }) => db.getCategories(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        color: z.string().max(7).default("#6366f1"),
        icon: z.string().max(50).default("receipt"),
      }))
      .mutation(({ ctx, input }) => db.createCategory({ ...input, userId: ctx.user.id })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        color: z.string().max(7).optional(),
        icon: z.string().max(50).optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateCategory(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteCategory(input.id, ctx.user.id)),
  }),

  // ==================== BILLS ====================
  bills: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        categoryId: z.number().optional(),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        // Auto-mark overdue bills
        await db.markBillOverdue(ctx.user.id);
        // Process recurring bills
        await db.processRecurringBills(ctx.user.id);
        return db.getBills(ctx.user.id, input);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => db.getBillById(input.id, ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        amount: z.string(),
        dueDate: z.date(),
        categoryId: z.number().nullable().optional(),
        isRecurring: z.boolean().default(false),
        recurringInterval: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly"]).nullable().optional(),
        autopay: z.boolean().default(false),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createBill({
        ...input,
        userId: ctx.user.id,
        status: "pending",
        categoryId: input.categoryId ?? null,
        recurringInterval: input.recurringInterval ?? null,
      })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        amount: z.string().optional(),
        dueDate: z.date().optional(),
        categoryId: z.number().nullable().optional(),
        status: z.enum(["pending", "paid", "overdue"]).optional(),
        isRecurring: z.boolean().optional(),
        recurringInterval: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly"]).nullable().optional(),
        autopay: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return db.updateBill(id, ctx.user.id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deleteBill(input.id, ctx.user.id)),
  }),

  // ==================== PAYMENTS ====================
  payments: router({
    list: protectedProcedure
      .input(z.object({
        billId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(({ ctx, input }) => db.getPayments(ctx.user.id, input)),
    create: protectedProcedure
      .input(z.object({
        billId: z.number(),
        amount: z.string(),
        paidAt: z.date().optional(),
        method: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createPayment({
        ...input,
        userId: ctx.user.id,
        paidAt: input.paidAt ?? new Date(),
      })),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => db.deletePayment(input.id, ctx.user.id)),
  }),

  // ==================== ANALYTICS ====================
  analytics: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      await db.markBillOverdue(ctx.user.id);
      return db.getDashboardStats(ctx.user.id);
    }),
    spendingByCategory: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(({ ctx, input }) => db.getSpendingByCategory(ctx.user.id, input.startDate, input.endDate)),
    monthlySpending: protectedProcedure
      .input(z.object({ months: z.number().default(6) }).optional())
      .query(({ ctx, input }) => db.getMonthlySpending(ctx.user.id, input?.months ?? 6)),
  }),

  // ==================== AI CHAT ====================
  chat: router({
    messages: protectedProcedure.query(({ ctx }) => db.getChatMessages(ctx.user.id)),
    clear: protectedProcedure.mutation(({ ctx }) => db.clearChatMessages(ctx.user.id)),
    send: protectedProcedure
      .input(z.object({ message: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;

        // Save user message
        await db.saveChatMessage({ userId, role: "user", content: input.message });

        // Get user's bills and categories for context
        const [userBills, userCategories, stats, recentPayments] = await Promise.all([
          db.getBills(userId),
          db.getCategories(userId),
          db.getDashboardStats(userId),
          db.getPayments(userId),
        ]);

        const billsSummary = userBills.map(b => `- ${b.name}: $${b.amount}, due ${new Date(b.dueDate).toLocaleDateString()}, status: ${b.status}, id: ${b.id}${b.categoryId ? `, categoryId: ${b.categoryId}` : ''}`).join("\n");
        const categoriesSummary = userCategories.map(c => `- ${c.name} (id: ${c.id}, color: ${c.color})`).join("\n");
        const paymentsSummary = recentPayments.slice(0, 20).map(p => `- Bill #${p.billId}: $${p.amount} paid on ${new Date(p.paidAt).toLocaleDateString()}`).join("\n");

        const systemPrompt = `You are BillWise AI, a personal billing and budget assistant. You help users manage their bills, track payments, and optimize their budget.

Current user's financial data:
- Total bills: ${stats.totalBills}
- Pending bills: ${stats.pendingBills}
- Overdue bills: ${stats.overdueBills}
- Paid this month: $${stats.paidThisMonth}
- Total amount due: $${stats.totalDue}

Bills:
${billsSummary || "No bills yet."}

Categories:
${categoriesSummary || "No categories yet."}

Recent Payments:
${paymentsSummary || "No payments yet."}

Today's date: ${new Date().toLocaleDateString()}

You can help users with:
1. Adding new bills (respond with action JSON)
2. Marking bills as paid (respond with action JSON)
3. Deleting bills (respond with action JSON)
4. Creating categories (respond with action JSON)
5. Answering questions about their spending
6. Providing budget insights and optimization tips
7. Generating spending reports
8. Finding specific bills

When the user wants to perform an action, include a JSON action block in your response using this format:
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
{"type": "create_category", "data": {"name": "...", "color": "#hexcolor", "icon": "icon-name"}}
\`\`\`

\`\`\`action
{"type": "update_bill", "data": {"billId": <number>, "name": "...", "amount": "...", "dueDate": "YYYY-MM-DD"}}
\`\`\`

Always be friendly, helpful, and proactive. If you notice overdue bills, mention them. Provide actionable financial advice. Format currency with $ and two decimal places. Use markdown for formatting responses.`;

        // Get recent chat history for context
        const chatHistory = await db.getChatMessages(userId, 20);
        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: systemPrompt },
          ...chatHistory.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        try {
          const response = await invokeLLM({ messages });
          const assistantContent = typeof response.choices[0]?.message?.content === 'string'
            ? response.choices[0].message.content
            : Array.isArray(response.choices[0]?.message?.content)
              ? response.choices[0].message.content.map((c: any) => c.type === 'text' ? c.text : '').join('')
              : "I'm sorry, I couldn't process that request.";

          // Parse and execute any actions
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
                    await db.createBill({
                      userId,
                      name: d.name,
                      amount: d.amount,
                      dueDate: new Date(d.dueDate),
                      categoryId: d.categoryId || null,
                      isRecurring: d.isRecurring || false,
                      recurringInterval: d.recurringInterval || null,
                      autopay: false,
                      status: "pending",
                    });
                    executedActions.push(`Created bill: ${d.name}`);
                    break;
                  }
                  case "pay_bill": {
                    const d = action.data;
                    await db.createPayment({
                      userId,
                      billId: d.billId,
                      amount: d.amount,
                      method: d.method || null,
                    });
                    executedActions.push(`Paid bill #${d.billId}`);
                    break;
                  }
                  case "delete_bill": {
                    await db.deleteBill(action.data.billId, userId);
                    executedActions.push(`Deleted bill #${action.data.billId}`);
                    break;
                  }
                  case "create_category": {
                    const d = action.data;
                    await db.createCategory({
                      userId,
                      name: d.name,
                      color: d.color || "#6366f1",
                      icon: d.icon || "receipt",
                    });
                    executedActions.push(`Created category: ${d.name}`);
                    break;
                  }
                  case "update_bill": {
                    const d = action.data;
                    const updateData: any = {};
                    if (d.name) updateData.name = d.name;
                    if (d.amount) updateData.amount = d.amount;
                    if (d.dueDate) updateData.dueDate = new Date(d.dueDate);
                    await db.updateBill(d.billId, userId, updateData);
                    executedActions.push(`Updated bill #${d.billId}`);
                    break;
                  }
                }
              } catch (e) {
                console.error("Failed to execute action:", e);
              }
            }
          }

          // Clean the response - remove action blocks for display
          const cleanContent = assistantContent.replace(/```action\n[\s\S]*?```/g, '').trim();

          // Save assistant message
          await db.saveChatMessage({ userId, role: "assistant", content: cleanContent });

          return {
            content: cleanContent,
            actions: executedActions,
          };
        } catch (error) {
          console.error("AI chat error:", error);
          const errorMsg = "I'm sorry, I encountered an error processing your request. Please try again.";
          await db.saveChatMessage({ userId, role: "assistant", content: errorMsg });
          return { content: errorMsg, actions: [] };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
