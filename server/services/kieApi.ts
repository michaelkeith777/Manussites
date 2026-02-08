/**
 * kie.ai API Service
 * Handles image generation using multiple AI models:
 * - Nano Banana (Google)
 * - Nano Banana Pro (Google)
 * - Grok Imagine (xAI)
 * - OpenAI 4o (GPT-Image-1)
 */

const KIE_API_BASE = "https://api.kie.ai/api/v1";

export type KieModel = "nano-banana" | "nano-banana-pro" | "grok-imagine" | "openai-4o";
export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9";
export type Resolution = "1K" | "2K" | "4K";
export type OutputFormat = "png" | "jpg";

export interface CreateTaskInput {
  prompt: string;
  model: KieModel;
  aspectRatio?: AspectRatio;
  resolution?: Resolution;
  outputFormat?: OutputFormat;
  callbackUrl?: string;
}

export interface CreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  } | null;
}

export interface TaskStatusResponse {
  code: number;
  message?: string;
  msg?: string;
  data: {
    taskId: string;
    model: string;
    state: "waiting" | "queuing" | "generating" | "success" | "fail";
    param: string;
    resultJson: string;
    failCode: string | null;
    failMsg: string | null;
    completeTime: number;
    createTime: number;
    updateTime?: number;
    costTime?: number;
  } | null;
}

export interface TaskResult {
  resultUrls: string[];
}

// OpenAI 4o specific response - actual API format
export interface OpenAI4oStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    paramJson?: string;
    completeTime?: number;
    createTime?: number;
    progress?: string;
    successFlag?: number;
    status: "pending" | "processing" | "completed" | "failed" | "SUCCESS" | "FAILED";
    response?: {
      resultUrls: string[];
    };
    result?: {
      images: Array<{
        url: string;
      }>;
    };
    errorCode?: string | null;
    errorMessage?: string | null;
    error?: string;
  } | null;
}

function getDefaultApiKey(): string {
  const key = process.env.KIE_API_KEY;
  if (!key) {
    throw new Error("KIE_API_KEY environment variable is not set");
  }
  return key;
}

/**
 * Get the correct model identifier for the API
 */
function getModelIdentifier(model: KieModel): string {
  switch (model) {
    case "nano-banana":
      return "google/nano-banana";
    case "nano-banana-pro":
      return "nano-banana-pro";
    case "grok-imagine":
      return "grok-imagine/text-to-image";
    case "openai-4o":
      return "gpt4o-image";
    default:
      return "google/nano-banana";
  }
}

/**
 * Create an image generation task
 */
export async function createImageTask(input: CreateTaskInput, customApiKey?: string): Promise<CreateTaskResponse> {
  const apiKey = customApiKey || getDefaultApiKey();
  const modelId = getModelIdentifier(input.model);
  
  // Different endpoints and body structures for different models
  if (input.model === "openai-4o") {
    // OpenAI 4o uses a different endpoint
    const body = {
      size: input.aspectRatio || "2:3",
      prompt: input.prompt,
    };

    const response = await fetch(`${KIE_API_BASE}/gpt4o-image/generate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return data as CreateTaskResponse;
  }
  
  // Standard kie.ai job creation for other models
  const body: Record<string, unknown> = {
    model: modelId,
    input: {
      prompt: input.prompt,
    },
  };

  // Add model-specific parameters
  if (input.model === "nano-banana-pro") {
    (body.input as Record<string, unknown>).aspect_ratio = input.aspectRatio || "2:3";
    (body.input as Record<string, unknown>).resolution = input.resolution || "1K";
    (body.input as Record<string, unknown>).output_format = input.outputFormat || "png";
  } else if (input.model === "grok-imagine") {
    (body.input as Record<string, unknown>).aspect_ratio = input.aspectRatio || "2:3";
  } else {
    // nano-banana
    (body.input as Record<string, unknown>).image_size = input.aspectRatio || "2:3";
    (body.input as Record<string, unknown>).output_format = input.outputFormat || "png";
  }

  if (input.callbackUrl) {
    body.callBackUrl = input.callbackUrl;
  }

  const response = await fetch(`${KIE_API_BASE}/jobs/createTask`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return data as CreateTaskResponse;
}

/**
 * Get task status and results
 */
export async function getTaskStatus(taskId: string, model?: KieModel, customApiKey?: string): Promise<TaskStatusResponse> {
  const apiKey = customApiKey || getDefaultApiKey();
  
  // OpenAI 4o uses a different status endpoint
  if (model === "openai-4o") {
    console.log(`[kieApi] Checking OpenAI 4o status for task ${taskId}`);
    const response = await fetch(`${KIE_API_BASE}/gpt4o-image/record-info?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json() as OpenAI4oStatusResponse;
    console.log(`[kieApi] OpenAI 4o raw response for ${taskId}:`, JSON.stringify(data, null, 2));
    
    // Convert to standard format
    if (data.code === 200 && data.data) {
      // Handle both uppercase (SUCCESS/FAILED) and lowercase (pending/processing/completed/failed) status values
      const statusMap: Record<string, "waiting" | "queuing" | "generating" | "success" | "fail"> = {
        "pending": "waiting",
        "processing": "generating",
        "completed": "success",
        "failed": "fail",
        "SUCCESS": "success",
        "FAILED": "fail",
      };
      
      let resultJson = "";
      // Check for response.resultUrls first (actual API format), then fall back to result.images
      if (data.data.response?.resultUrls && data.data.response.resultUrls.length > 0) {
        console.log(`[kieApi] Found resultUrls in response:`, data.data.response.resultUrls);
        resultJson = JSON.stringify({
          resultUrls: data.data.response.resultUrls
        });
      } else if (data.data.result?.images) {
        console.log(`[kieApi] Found images in result:`, data.data.result.images);
        resultJson = JSON.stringify({
          resultUrls: data.data.result.images.map(img => img.url)
        });
      }
      
      const mappedState = statusMap[data.data.status] || "waiting";
      console.log(`[kieApi] Mapped status ${data.data.status} to ${mappedState}, resultJson: ${resultJson ? 'present' : 'empty'}`);
      
      return {
        code: 200,
        msg: "success",
        data: {
          taskId: data.data.taskId,
          model: "gpt4o-image",
          state: mappedState,
          param: "",
          resultJson,
          failCode: null,
          failMsg: data.data.error || data.data.errorMessage || null,
          completeTime: data.data.completeTime || Date.now(),
          createTime: data.data.createTime || Date.now(),
        }
      };
    }
    
    return {
      code: data.code,
      msg: data.msg,
      data: null
    };
  }
  
  // Standard kie.ai status check
  const response = await fetch(`${KIE_API_BASE}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  console.log(`[kieApi] getTaskStatus for ${taskId}:`, JSON.stringify(data, null, 2));
  return data as TaskStatusResponse;
}

/**
 * Parse result JSON to get image URLs
 */
export function parseTaskResult(resultJson: string): TaskResult {
  try {
    const parsed = JSON.parse(resultJson);
    return {
      resultUrls: parsed.resultUrls || [],
    };
  } catch {
    return { resultUrls: [] };
  }
}

/**
 * Poll for task completion with exponential backoff
 */
export async function pollTaskUntilComplete(
  taskId: string,
  model?: KieModel,
  maxAttempts = 60,
  onProgress?: (state: string, attempt: number) => void,
  customApiKey?: string
): Promise<{ success: boolean; urls: string[]; error?: string }> {
  let attempt = 0;
  let interval = 2000; // Start with 2 seconds

  while (attempt < maxAttempts) {
    attempt++;
    
    const status = await getTaskStatus(taskId, model, customApiKey);
    
    if (status.code !== 200 || !status.data) {
      return { success: false, urls: [], error: status.msg || status.message || "Failed to get task status" };
    }

    if (!status.data) {
      return { success: false, urls: [], error: "No data in response" };
    }
    const { state, resultJson, failMsg } = status.data;
    
    if (onProgress) {
      onProgress(state, attempt);
    }

    if (state === "success") {
      const result = parseTaskResult(resultJson);
      return { success: true, urls: result.resultUrls };
    }

    if (state === "fail") {
      return { success: false, urls: [], error: failMsg || "Generation failed" };
    }

    // Wait before next poll with exponential backoff
    await new Promise(resolve => setTimeout(resolve, interval));
    
    // Increase interval: 2s -> 3s -> 5s -> 8s -> 10s (max)
    if (attempt > 15) {
      interval = 10000;
    } else if (attempt > 10) {
      interval = 8000;
    } else if (attempt > 5) {
      interval = 5000;
    } else if (attempt > 2) {
      interval = 3000;
    }
  }

  return { success: false, urls: [], error: "Task timed out" };
}

/**
 * Get model display info
 */
export function getModelInfo(model: KieModel): { name: string; description: string; pricing: string } {
  switch (model) {
    case "nano-banana":
      return {
        name: "Nano Banana",
        description: "Google's fast image generation model",
        pricing: "~$0.02 per image"
      };
    case "nano-banana-pro":
      return {
        name: "Nano Banana Pro",
        description: "Enhanced version with higher quality",
        pricing: "~$0.04 per image"
      };
    case "grok-imagine":
      return {
        name: "Grok Imagine",
        description: "xAI's multimodal image generation (6 images per request)",
        pricing: "~$0.02 for 6 images"
      };
    case "openai-4o":
      return {
        name: "OpenAI 4o",
        description: "GPT-Image-1 with precise text rendering",
        pricing: "~$0.03 per image"
      };
    default:
      return {
        name: "Unknown",
        description: "",
        pricing: ""
      };
  }
}
