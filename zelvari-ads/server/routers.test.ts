import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createBaseUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 1,
    openId: "test-user-001",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    avatarUrl: null,
    plan: "free",
    creditsRemaining: 10,
    creditsMonthly: 10,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function createAuthContext(userOverrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  return {
    user: createBaseUser(userOverrides),
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return createAuthContext({ role: "admin" });
}

/* ─── Auth Tests ─── */
describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.name).toBe("Test User");
    expect(result?.email).toBe("test@example.com");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalledWith(
      COOKIE_NAME,
      expect.objectContaining({ maxAge: -1 })
    );
  });
});

/* ─── Protected Procedure Access Tests ─── */
describe("protected procedures", () => {
  it("project.list throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.project.list()).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("creative.list throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.creative.list()).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("gallery.list throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.gallery.list()).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("campaign.list throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.campaign.list()).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("usage.credits throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.usage.credits()).rejects.toThrow(UNAUTHED_ERR_MSG);
  });
});

/* ─── Admin Procedure Access Tests ─── */
describe("admin procedures", () => {
  it("admin.users throws FORBIDDEN for regular users", async () => {
    const ctx = createAuthContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.users()).rejects.toThrow(NOT_ADMIN_ERR_MSG);
  });

  it("admin.users throws UNAUTHORIZED for unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.users()).rejects.toThrow();
  });

  it("admin.updateUserPlan throws FORBIDDEN for regular users", async () => {
    const ctx = createAuthContext({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.updateUserPlan({ userId: 2, plan: "pro", creditsMonthly: 100 })
    ).rejects.toThrow(NOT_ADMIN_ERR_MSG);
  });
});

/* ─── Input Validation Tests ─── */
describe("input validation", () => {
  it("project.create rejects empty name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.project.create({ name: "" })
    ).rejects.toThrow();
  });

  it("creative.generateCopy rejects empty product name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.creative.generateCopy({
        productName: "",
        productDescription: "A great product",
      })
    ).rejects.toThrow();
  });

  it("creative.generateImage rejects empty prompt", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.creative.generateImage({ prompt: "" })
    ).rejects.toThrow();
  });

  it("campaign.create rejects empty name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.campaign.create({ name: "", platform: "meta" })
    ).rejects.toThrow();
  });

  it("campaign.create rejects invalid platform", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.campaign.create({ name: "Test", platform: "invalid" as any })
    ).rejects.toThrow();
  });

  it("upload.productImage accepts valid input and returns url and key", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Empty fileName is technically valid (falls back to .jpg extension)
    const result = await caller.upload.productImage({ fileName: "test.png", fileBase64: "abc" });
    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("key");
    expect(result.key).toContain("products/1/");
  });

  it("gallery.add rejects empty imageUrl", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.gallery.add({ imageUrl: "" })
    ).rejects.toThrow();
  });

  it("creative.generateFullAd rejects empty productImageUrl", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.creative.generateFullAd({
        productImageUrl: "",
        productName: "Test Product",
      })
    ).rejects.toThrow();
  });

  it("creative.generateFullAd rejects empty productName", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.creative.generateFullAd({
        productImageUrl: "https://example.com/img.jpg",
        productName: "",
      })
    ).rejects.toThrow();
  });
});

/* ─── Router Structure Tests ─── */
describe("router structure", () => {
  it("has all expected top-level routers", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    // Flatten nested routers - check key procedures exist
    expect(procedures).toContain("auth.me");
    expect(procedures).toContain("auth.logout");
    expect(procedures).toContain("project.list");
    expect(procedures).toContain("project.create");
    expect(procedures).toContain("creative.list");
    expect(procedures).toContain("creative.generateCopy");
    expect(procedures).toContain("creative.generateImage");
    expect(procedures).toContain("creative.generateFullAd");
    expect(procedures).toContain("gallery.list");
    expect(procedures).toContain("campaign.list");
    expect(procedures).toContain("campaign.create");
    expect(procedures).toContain("upload.productImage");
    expect(procedures).toContain("usage.credits");
    expect(procedures).toContain("admin.users");
    expect(procedures).toContain("admin.updateUserPlan");
  });
});
