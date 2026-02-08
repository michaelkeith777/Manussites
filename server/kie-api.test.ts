import { describe, expect, it } from "vitest";

const KIE_API_KEY = process.env.KIE_API_KEY;
const KIE_API_URL = "https://api.kie.ai/api/v1/jobs/recordInfo";

describe("kie.ai API Key Validation", () => {
  it("should have KIE_API_KEY environment variable set", () => {
    expect(KIE_API_KEY).toBeDefined();
    expect(KIE_API_KEY).not.toBe("");
  });

  it("should authenticate successfully with kie.ai API", async () => {
    // Test with a dummy task ID - we expect 404 (not found) which confirms auth works
    // If auth fails, we'd get 401 (unauthorized)
    const response = await fetch(`${KIE_API_URL}?taskId=test_validation_123`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${KIE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    // 200 with empty/null data or 404 means auth worked but task not found (expected)
    // 401 means invalid API key
    expect(data.code).not.toBe(401);
    
    // Log the response for debugging
    console.log("kie.ai API response:", data);
  });
});
