import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM module - returns different responses based on call
let llmCallCount = 0;
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockImplementation(() => {
    llmCallCount++;
    // Return different mock data based on what's being called
    return Promise.resolve({
      choices: [
        {
          message: {
            content: JSON.stringify({
              topics: [
                { topic: "Test Topic", category: "gaming", description: "Test description", score: 90 },
              ],
              prompt: "A detailed test prompt for trading card artwork",
              shortDescription: "Test description",
              enhancedPrompt: "An enhanced test prompt with more details",
              improvements: ["Added details", "Improved lighting"],
            }),
          },
        },
      ],
    });
  }),
}));

// Mock the kieApi module
vi.mock("./services/kieApi", () => ({
  createImageTask: vi.fn().mockResolvedValue({
    code: 200,
    data: { taskId: "test-task-123" },
  }),
  getTaskStatus: vi.fn().mockResolvedValue({
    code: 200,
    data: {
      taskId: "test-task-123",
      state: "success",
      resultJson: JSON.stringify({ resultUrls: ["https://example.com/image.png"] }),
    },
  }),
  parseTaskResult: vi.fn().mockReturnValue({
    resultUrls: ["https://example.com/image.png"],
  }),
}));

// Mock the db module
vi.mock("./db", () => ({
  createGeneratedImage: vi.fn().mockResolvedValue(1),
  updateGeneratedImage: vi.fn().mockResolvedValue(undefined),
  getGeneratedImagesByUser: vi.fn().mockResolvedValue([]),
  getFavoriteImages: vi.fn().mockResolvedValue([]),
  toggleFavorite: vi.fn().mockResolvedValue(true),
  getImageById: vi.fn().mockResolvedValue(null),
  getImageByTaskId: vi.fn().mockResolvedValue(null),
  deleteImage: vi.fn().mockResolvedValue(undefined),
  createGenerationSession: vi.fn().mockResolvedValue(1),
  updateGenerationSession: vi.fn().mockResolvedValue(undefined),
  getUserImageCount: vi.fn().mockResolvedValue(5),
  getUserApiKey: vi.fn().mockResolvedValue(null),
  saveUserApiKey: vi.fn().mockResolvedValue(undefined),
  deleteUserApiKey: vi.fn().mockResolvedValue(undefined),
  isOnboardingComplete: vi.fn().mockResolvedValue(false),
  completeOnboarding: vi.fn().mockResolvedValue(undefined),
  getPromptHistory: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  savePromptToHistory: vi.fn().mockResolvedValue(1),
  deletePromptFromHistory: vi.fn().mockResolvedValue(undefined),
  clearPromptHistory: vi.fn().mockResolvedValue(undefined),
  getWatermarkPresets: vi.fn().mockResolvedValue([]),
  saveWatermarkPreset: vi.fn().mockResolvedValue(1),
  deleteWatermarkPreset: vi.fn().mockResolvedValue(undefined),
  createWatermarkPreset: vi.fn().mockResolvedValue(1),
  getWatermarkPresetById: vi.fn().mockResolvedValue(null),
  getDefaultWatermarkPreset: vi.fn().mockResolvedValue(null),
  updateWatermarkPreset: vi.fn().mockResolvedValue(undefined),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://s3.example.com/image.png", key: "test-key" }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
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

describe("auth router", () => {
  it("returns user when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result?.email).toBe("test@example.com");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeNull();
  });
});

describe("trending router", () => {
  it("discovers trending topics for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.trending.discover({});

    expect(result).toBeDefined();
    expect(result.topics).toBeDefined();
    expect(Array.isArray(result.topics)).toBe(true);
  });

  it("throws error for unauthenticated users", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.trending.discover({})).rejects.toThrow();
  });
});

describe("prompts router", () => {
  it("generates prompt for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // The mock is already set up at the top level
    const result = await caller.prompts.generate({ topic: "Test Topic" });

    expect(result).toBeDefined();
    expect(result.prompt).toBeDefined();
    expect(result.topic).toBe("Test Topic");
  });

  it("enhances prompt for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.prompts.enhance({ prompt: "Original prompt" });

    expect(result).toBeDefined();
    expect(result.enhancedPrompt).toBeDefined();
    expect(result.originalPrompt).toBe("Original prompt");
  });
});

describe("images router", () => {
  it("generates images for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.images.generate({
      prompt: "Test prompt",
      model: "nano-banana",
      count: 2,
    });

    expect(result).toBeDefined();
    expect(result.sessionId).toBeDefined();
    expect(result.tasks).toBeDefined();
  });

  it("lists images for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.images.list({ limit: 10, offset: 0, favoritesOnly: false });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns image count for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.images.count();

    expect(result).toBe(5);
  });

  it("toggles favorite for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.images.toggleFavorite({ imageId: 1 });

    expect(result).toBeDefined();
    expect(result.isFavorite).toBe(true);
  });

  it("deletes image for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.images.delete({ imageId: 1 });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});


describe("settings router", () => {
  it("returns API key status for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.getApiKeyStatus();

    expect(result).toBeDefined();
    expect(result.hasApiKey).toBe(false);
    expect(result.maskedKey).toBeNull();
  });

  it("saves API key for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.saveApiKey({ apiKey: "test-api-key-12345" });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("deletes API key for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.deleteApiKey();

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});


describe("onboarding", () => {
  it("returns onboarding status for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.getOnboardingStatus();

    expect(result).toBeDefined();
    expect(result.isComplete).toBe(false);
    expect(result.hasApiKey).toBe(false);
  });

  it("completes onboarding for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.completeOnboarding();

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});

// Player Search Tests
describe("trending.searchPlayer", () => {
  it("searches for players by name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.trending.searchPlayer({
      query: "LeBron",
      sport: "basketball",
    });
    
    expect(result).toHaveProperty("players");
    expect(Array.isArray(result.players)).toBe(true);
  });
});

// Team List Tests
describe("trending.getTeams", () => {
  it("returns all teams when sport is all", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.trending.getTeams({ sport: "all" });
    
    expect(result).toHaveProperty("teams");
    expect(Array.isArray(result.teams)).toBe(true);
    expect(result.teams.length).toBeGreaterThan(50); // Should have NBA + NFL + NCAA teams
  });

  it("returns only NBA teams when sport is basketball", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.trending.getTeams({ sport: "basketball" });
    
    expect(result).toHaveProperty("teams");
    expect(result.teams.every((t: { league: string }) => t.league === "NBA")).toBe(true);
    expect(result.teams.length).toBe(30); // 30 NBA teams
  });

  it("returns only NFL teams when sport is football", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.trending.getTeams({ sport: "football" });
    
    expect(result).toHaveProperty("teams");
    expect(result.teams.every((t: { league: string }) => t.league === "NFL")).toBe(true);
    expect(result.teams.length).toBe(32); // 32 NFL teams
  });

  it("returns NCAA basketball teams", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.trending.getTeams({ sport: "ncaa-basketball" });
    
    expect(result).toHaveProperty("teams");
    expect(result.teams.every((t: { league: string }) => t.league === "NCAA Basketball")).toBe(true);
    expect(result.teams.length).toBe(20); // 20 top NCAA basketball teams
  });

  it("returns NCAA football teams", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.trending.getTeams({ sport: "ncaa-football" });
    
    expect(result).toHaveProperty("teams");
    expect(result.teams.every((t: { league: string }) => t.league === "NCAA Football")).toBe(true);
    expect(result.teams.length).toBe(20); // 20 top NCAA football teams
  });
});

// Prompt History Tests
describe("promptHistory router", () => {
  it("should list prompt history for user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.promptHistory.list({ limit: 10 });

    expect(result).toHaveProperty("items");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("should save a prompt to history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.promptHistory.save({
      topic: "LeBron James slam dunk",
      sport: "basketball",
      playerName: "LeBron James",
      team: "Lakers",
      prompt: "A dynamic action shot of LeBron James performing a powerful slam dunk",
      artStyle: "dynamic",
      model: "nano-banana-pro",
      aspectRatio: "2:3",
    });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);
  });

  it("should delete a prompt from history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.promptHistory.delete({ id: 1 });
    expect(result).toHaveProperty("success", true);
  });

  it("should clear all prompt history", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.promptHistory.clear();
    expect(result).toHaveProperty("success", true);
  });
});

// Watermark Presets Tests
describe("watermarkPresets router", () => {
  it("should list watermark presets for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.watermarkPresets.list();
    
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new watermark preset", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.watermarkPresets.create({
      name: "My Test Preset",
      type: "text",
      text: "Test Watermark",
      fontFamily: "Arial",
      fontSize: 24,
      color: "#ffffff",
      opacity: 80,
      rotation: 0,
      position: "bottom-right",
      customX: 50,
      customY: 50,
    });
    
    expect(result.id).toBeDefined();
  });
});
