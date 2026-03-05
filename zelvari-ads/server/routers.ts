import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import * as db from "./db";

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

  /* ─── Projects ─── */
  project: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getUserProjects(ctx.user.id)
    ),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        brandName: z.string().optional(),
        brandUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createProject({ ...input, userId: ctx.user.id });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProject(input.id);
        return { success: true };
      }),
  }),

  /* ─── AI Ad Creative Generation ─── */
  creative: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getUserCreatives(ctx.user.id)
    ),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getCreativeById(input.id)),

    /** Generate ad copy using LLM */
    generateCopy: protectedProcedure
      .input(z.object({
        productName: z.string().min(1),
        productDescription: z.string().min(1),
        targetAudience: z.string().optional(),
        tone: z.string().optional(),
        platform: z.string().optional(),
        format: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check credits
        const user = await db.getUserById(ctx.user.id);
        if (!user || user.creditsRemaining <= 0) {
          throw new Error("No credits remaining. Please upgrade your plan.");
        }

        const systemPrompt = `You are an expert ad copywriter who creates high-converting ad copy for digital advertising platforms. Generate compelling ad copy based on the product details provided. Always return JSON.`;

        const userPrompt = `Create ad copy for the following product:
Product: ${input.productName}
Description: ${input.productDescription}
Target Audience: ${input.targetAudience || "General audience"}
Tone: ${input.tone || "Professional and persuasive"}
Platform: ${input.platform || "All platforms"}
Format: ${input.format || "single"}

Generate 3 variations with different angles. Each variation should have:
- headline (max 40 chars)
- primaryText (max 125 chars for Facebook, adapt for platform)
- callToAction (e.g., "Shop Now", "Learn More", "Sign Up")
- hook (the attention-grabbing first line)`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "ad_copy_variations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  variations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        headline: { type: "string" },
                        primaryText: { type: "string" },
                        callToAction: { type: "string" },
                        hook: { type: "string" },
                      },
                      required: ["headline", "primaryText", "callToAction", "hook"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["variations"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : "{}");

        // Deduct credit
        await db.updateUserCredits(ctx.user.id, 1);
        await db.logUsage({ userId: ctx.user.id, action: "generate_copy", creditsUsed: 1 });

        return parsed;
      }),

    /** Generate ad image using AI */
    generateImage: protectedProcedure
      .input(z.object({
        productImageUrl: z.string().optional(),
        prompt: z.string().min(1),
        aspectRatio: z.string().optional(),
        style: z.string().optional(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || user.creditsRemaining <= 0) {
          throw new Error("No credits remaining. Please upgrade your plan.");
        }

        // Create the creative record first
        const creative = await db.createAdCreative({
          userId: ctx.user.id,
          projectId: input.projectId ?? null,
          productImageUrl: input.productImageUrl ?? null,
          prompt: input.prompt,
          aspectRatio: input.aspectRatio || "1:1",
          status: "generating",
          format: "single",
          platform: "all",
        });

        try {
          const fullPrompt = `Create a professional, high-converting advertising image. ${input.prompt}. Style: ${input.style || "modern, clean, professional"}. The image should be eye-catching and suitable for digital advertising.`;

          const result = await generateImage({
            prompt: fullPrompt,
            originalImages: input.productImageUrl
              ? [{ url: input.productImageUrl, mimeType: "image/jpeg" }]
              : undefined,
          });

          // Update creative with generated image
          await db.updateCreative(creative.id, {
            generatedImageUrl: result.url ?? null,
            status: "completed",
          });

          // Deduct credits
          await db.updateUserCredits(ctx.user.id, 2);
          await db.logUsage({ userId: ctx.user.id, action: "generate_image", creditsUsed: 2 });

          return { id: creative.id, imageUrl: result.url };
        } catch (error) {
          await db.updateCreative(creative.id, { status: "failed" });
          throw error;
        }
      }),

    /** Full ad generation: image + copy from a product image */
    generateFullAd: protectedProcedure
      .input(z.object({
        productImageUrl: z.string().min(1),
        productName: z.string().min(1),
        productDescription: z.string().optional(),
        targetAudience: z.string().optional(),
        tone: z.string().optional(),
        platform: z.enum(["meta", "tiktok", "google", "snapchat", "pinterest", "all"]).optional(),
        aspectRatio: z.string().optional(),
        style: z.string().optional(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user || user.creditsRemaining < 3) {
          throw new Error("Not enough credits. Full ad generation requires 3 credits.");
        }

        // Step 1: Generate ad copy with LLM
        const copyPrompt = `Create a single high-converting ad for:
Product: ${input.productName}
Description: ${input.productDescription || "See product image"}
Target Audience: ${input.targetAudience || "General"}
Tone: ${input.tone || "Professional and persuasive"}
Platform: ${input.platform || "all"}

Return a single ad with headline, primaryText, callToAction, and a detailed image generation prompt that describes the perfect ad visual for this product.`;

        const copyResponse = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert ad creative director. Generate ad copy and image prompts. Always return JSON." },
            {
              role: "user",
              content: [
                { type: "text", text: copyPrompt },
                { type: "image_url", image_url: { url: input.productImageUrl, detail: "high" } },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "full_ad",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  primaryText: { type: "string" },
                  callToAction: { type: "string" },
                  imagePrompt: { type: "string" },
                },
                required: ["headline", "primaryText", "callToAction", "imagePrompt"],
                additionalProperties: false,
              },
            },
          },
        });

        const copyContent = copyResponse.choices[0]?.message?.content;
        const adCopy = JSON.parse(typeof copyContent === "string" ? copyContent : "{}");

        // Step 2: Generate ad image
        const imageResult = await generateImage({
          prompt: `${adCopy.imagePrompt}. Professional advertising image, ${input.style || "modern clean design"}, suitable for ${input.platform || "all"} ads.`,
          originalImages: [{ url: input.productImageUrl, mimeType: "image/jpeg" }],
        });

        // Step 3: Save to database
        const creative = await db.createAdCreative({
          userId: ctx.user.id,
          projectId: input.projectId ?? null,
          productImageUrl: input.productImageUrl,
          generatedImageUrl: imageResult.url ?? null,
          prompt: adCopy.imagePrompt,
          headline: adCopy.headline,
          primaryText: adCopy.primaryText,
          callToAction: adCopy.callToAction,
          format: "single",
          aspectRatio: input.aspectRatio || "1:1",
          platform: input.platform || "all",
          status: "completed",
        });

        // Deduct credits
        await db.updateUserCredits(ctx.user.id, 3);
        await db.logUsage({ userId: ctx.user.id, action: "generate_full_ad", creditsUsed: 3 });

        // Save to gallery
        await db.addToGallery({
          userId: ctx.user.id,
          creativeId: creative.id,
          title: adCopy.headline,
          imageUrl: imageResult.url ?? "",
        });

        return {
          id: creative.id,
          imageUrl: imageResult.url,
          headline: adCopy.headline,
          primaryText: adCopy.primaryText,
          callToAction: adCopy.callToAction,
        };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        headline: z.string().optional(),
        primaryText: z.string().optional(),
        callToAction: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCreative(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCreative(input.id);
        return { success: true };
      }),
  }),

  /* ─── Gallery ─── */
  gallery: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getUserGallery(ctx.user.id)
    ),
    add: protectedProcedure
      .input(z.object({
        title: z.string().optional(),
        imageUrl: z.string().min(1),
        format: z.string().optional(),
        creativeId: z.number().optional(),
      }))
      .mutation(({ ctx, input }) =>
        db.addToGallery({ ...input, userId: ctx.user.id })
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteGalleryItem(input.id);
        return { success: true };
      }),
  }),

  /* ─── Campaigns ─── */
  campaign: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getUserCampaigns(ctx.user.id)
    ),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getCampaignById(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        platform: z.enum(["meta", "tiktok", "google", "snapchat", "pinterest"]),
        objective: z.string().optional(),
        budget: z.number().optional(),
        projectId: z.number().optional(),
      }))
      .mutation(({ ctx, input }) =>
        db.createCampaign({ ...input, userId: ctx.user.id })
      ),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        status: z.enum(["draft", "active", "paused", "completed", "archived"]).optional(),
        budget: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCampaign(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCampaign(input.id);
        return { success: true };
      }),
  }),

  /* ─── Upload (product image) ─── */
  upload: router({
    productImage: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        contentType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const ext = input.fileName.split(".").pop() || "jpg";
        const key = `products/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { url } = await storagePut(key, buffer, input.contentType || "image/jpeg");
        return { url, key };
      }),
  }),

  /* ─── Usage & Credits ─── */
  usage: router({
    credits: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      return {
        remaining: user?.creditsRemaining ?? 0,
        monthly: user?.creditsMonthly ?? 10,
        plan: user?.plan ?? "free",
      };
    }),
    history: protectedProcedure.query(({ ctx }) =>
      db.getUserUsage(ctx.user.id)
    ),
  }),

  /* ─── Admin ─── */
  admin: router({
    users: adminProcedure.query(() => db.getAllUsers()),
    updateUserPlan: adminProcedure
      .input(z.object({
        userId: z.number(),
        plan: z.enum(["free", "pro", "agency", "enterprise"]),
        creditsMonthly: z.number(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("DB not available");
        const { users: usersTable } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await dbInstance.update(usersTable).set({
          plan: input.plan,
          creditsMonthly: input.creditsMonthly,
          creditsRemaining: input.creditsMonthly,
        }).where(eq(usersTable.id, input.userId));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
