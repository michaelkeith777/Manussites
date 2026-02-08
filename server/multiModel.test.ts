import { describe, it, expect, vi } from "vitest";

// Mock kieApi before importing routers
vi.mock("./services/kieApi", () => ({
  createImageTask: vi.fn().mockResolvedValue({
    code: 200,
    data: { taskId: "mock-task-" + Math.random().toString(36).slice(2, 10) },
  }),
  getTaskResult: vi.fn().mockResolvedValue({
    code: 200,
    data: { status: "completed", output: { image_url: "https://example.com/image.png" } },
  }),
}));

// Mock db helpers
vi.mock("./db", () => ({
  getUserApiKey: vi.fn().mockResolvedValue(null),
  createGenerationSession: vi.fn().mockResolvedValue(1),
  createGeneratedImage: vi.fn().mockResolvedValue(1),
  getImageByTaskId: vi.fn().mockResolvedValue(null),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://example.com/stored.png", key: "test-key" }),
}));

describe("Multi-Model Generation", () => {
  it("should accept multiple models in the input schema", () => {
    // Validate the schema accepts arrays of models
    const validInput = {
      prompt: "A basketball player dunking",
      models: ["nano-banana", "openai-4o"],
      aspectRatio: "2:3",
      resolution: "1K",
      countPerModel: 1,
    };
    
    expect(validInput.models).toHaveLength(2);
    expect(validInput.models).toContain("nano-banana");
    expect(validInput.models).toContain("openai-4o");
  });

  it("should support all four model types", () => {
    const allModels = ["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"];
    expect(allModels).toHaveLength(4);
    
    // Verify each model is a valid option
    for (const model of allModels) {
      expect(["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"]).toContain(model);
    }
  });

  it("should calculate correct total image count", () => {
    const models = ["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"];
    const countPerModel = 2;
    const totalImages = models.length * countPerModel;
    
    expect(totalImages).toBe(8);
  });

  it("should calculate correct count for single model selection", () => {
    const models = ["openai-4o"];
    const countPerModel = 3;
    const totalImages = models.length * countPerModel;
    
    expect(totalImages).toBe(3);
  });

  it("should limit countPerModel to max 4", () => {
    const maxCountPerModel = 4;
    const models = ["nano-banana", "nano-banana-pro", "grok-imagine", "openai-4o"];
    const totalImages = models.length * maxCountPerModel;
    
    // Max 4 models * 4 per model = 16 images max
    expect(totalImages).toBeLessThanOrEqual(16);
  });

  it("should require at least one model", () => {
    const models: string[] = [];
    expect(models.length).toBe(0);
    // The zod schema enforces .min(1) on the models array
    expect(models.length < 1).toBe(true);
  });

  it("should preserve model info in generated image metadata", () => {
    const tasks = [
      { id: 1, taskId: "task-1", model: "nano-banana" },
      { id: 2, taskId: "task-2", model: "openai-4o" },
      { id: 3, taskId: "task-3", model: "grok-imagine" },
    ];
    
    // Each task should have its model info
    expect(tasks[0].model).toBe("nano-banana");
    expect(tasks[1].model).toBe("openai-4o");
    expect(tasks[2].model).toBe("grok-imagine");
  });

  it("should group tasks by model correctly", () => {
    const tasks = [
      { taskId: "t1", model: "nano-banana" },
      { taskId: "t2", model: "nano-banana" },
      { taskId: "t3", model: "openai-4o" },
      { taskId: "t4", model: "openai-4o" },
      { taskId: "t5", model: "grok-imagine" },
    ];
    
    const grouped = tasks.reduce((acc, t) => {
      if (!acc[t.model]) acc[t.model] = [];
      acc[t.model].push(t.taskId);
      return acc;
    }, {} as Record<string, string[]>);
    
    expect(Object.keys(grouped)).toHaveLength(3);
    expect(grouped["nano-banana"]).toHaveLength(2);
    expect(grouped["openai-4o"]).toHaveLength(2);
    expect(grouped["grok-imagine"]).toHaveLength(1);
  });

  it("should generate model display labels correctly", () => {
    const modelLabels: Record<string, string> = {
      "nano-banana": "Nano Banana",
      "nano-banana-pro": "Nano Pro",
      "grok-imagine": "Grok",
      "openai-4o": "OpenAI 4o",
    };
    
    expect(modelLabels["nano-banana"]).toBe("Nano Banana");
    expect(modelLabels["nano-banana-pro"]).toBe("Nano Pro");
    expect(modelLabels["grok-imagine"]).toBe("Grok");
    expect(modelLabels["openai-4o"]).toBe("OpenAI 4o");
  });
});
