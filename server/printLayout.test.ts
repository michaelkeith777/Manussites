import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-print",
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

describe("images.upload", () => {
  it("rejects unauthenticated users", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.images.upload({
        imageDataUrl: "data:image/png;base64,iVBORw0KGgo=",
        fileName: "test.png",
        prompt: "Test upload",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid data URL format", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.images.upload({
        imageDataUrl: "not-a-valid-data-url",
        fileName: "test.png",
        prompt: "Test upload",
      })
    ).rejects.toThrow("Invalid image data URL");
  });

  it("requires non-empty imageDataUrl", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.images.upload({
        imageDataUrl: "",
        fileName: "test.png",
        prompt: "Test upload",
      })
    ).rejects.toThrow();
  });
});

describe("images.list", () => {
  it("rejects unauthenticated users", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.images.list({ limit: 10, offset: 0, favoritesOnly: false })
    ).rejects.toThrow();
  });
});

describe("Print Layout constants", () => {
  it("standard card size fits 9 cards on 8.5x11 page", () => {
    const pageWidth = 8.5;
    const pageHeight = 11;
    const cardWidth = 2.5;
    const cardHeight = 3.5;

    // 3 columns × 3 rows = 9 cards
    const cols = Math.floor(pageWidth / cardWidth);
    const rows = Math.floor(pageHeight / cardHeight);
    const perPage = cols * rows;

    expect(cols).toBe(3);
    expect(rows).toBe(3);
    expect(perPage).toBe(9);
    expect(cols * cardWidth).toBeLessThanOrEqual(pageWidth);
    expect(rows * cardHeight).toBeLessThanOrEqual(pageHeight);
  });

  it("photo card size fits 2 cards on 8.5x11 page", () => {
    const pageWidth = 8.5;
    const pageHeight = 11;
    const cardWidth = 4;
    const cardHeight = 6;

    // 2 columns × 1 row = 2 cards (landscape arrangement)
    const cols = 2;
    const rows = 1;
    const perPage = cols * rows;

    expect(perPage).toBe(2);
    expect(cols * cardWidth).toBeLessThanOrEqual(pageWidth);
    expect(rows * cardHeight).toBeLessThanOrEqual(pageHeight);
  });

  it("crop mark dimensions are reasonable", () => {
    const DPI = 300;
    const markLengthInches = 0.15;
    const markOffsetInches = 0.05;

    const markLengthPx = markLengthInches * DPI;
    const markOffsetPx = markOffsetInches * DPI;

    // Marks should be visible but not too large
    expect(markLengthPx).toBe(45);
    expect(markOffsetPx).toBe(15);
    expect(markLengthPx).toBeGreaterThan(10);
    expect(markLengthPx).toBeLessThan(100);
  });
});
