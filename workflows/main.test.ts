import { describe, expect } from "bun:test";
import { vi } from "bun:test";
import { newTestRuntime, test } from "@chainlink/cre-sdk/test";
import { onCronTrigger, initWorkflow } from "./main";
import type { Config } from "./main";

vi.mock('@chainlink/cre-sdk', async () => {
  const actual = await vi.importActual('@chainlink/cre-sdk');
  return {
    ...actual,
    HTTPCapability: vi.fn().mockImplementation(() => ({
      get: vi.fn((runtime, url) => runtime.httpGet(url)),
      post: vi.fn((runtime, url, body, headers) => runtime.httpPost(url, body)),
      put: vi.fn((runtime, url, body, headers) => runtime.httpPut(url, body)),
    })),
  };
});

describe("onCronTrigger", () => {
  test("logs message and returns risk level", async () => {
    const config: Config = {
      schedule: "*/5 * * * *",
      openaiApiKey: "test_key",
      jsonbinApiKey: "test_key",
      jsonbinBinId: "test_id"
    };
    const runtime = newTestRuntime();
    runtime.config = () => config;

    // Mock the http responses
    runtime.httpGet = (url: string) => {
      if (url.includes("coingecko")) {
        return {
          body: JSON.stringify({
            bitcoin: { usd: 50000, usd_24h_change: 2.5 },
            ethereum: { usd: 3000, usd_24h_change: -1.2 }
          })
        };
      }
      return { body: "{}" };
    };
    runtime.httpPost = (url: string, body: string) => {
      return {
        body: JSON.stringify({
          choices: [{ message: { content: '{"riskLevel": "LOW", "summary": "Market is stable."}' } }]
        })
      };
    };
    runtime.httpPut = (url: string, body: string) => {
      // Mock successful put
    };

    const result = onCronTrigger(runtime);

    expect(result).toBe("LOW");
    const logs = runtime.getLogs();
    expect(logs.some(log => log.includes("Fetching market data"))).toBe(true);
    expect(logs.some(log => log.includes("AI Verdict"))).toBe(true);
  });
});

describe("initWorkflow", () => {
  test("returns one handler with correct cron schedule", async () => {
    const testSchedule = "0 0 * * *";
    const config: Config = {
      schedule: testSchedule,
      openaiApiKey: "test",
      jsonbinApiKey: "test",
      jsonbinBinId: "test"
    };

    const handlers = initWorkflow(config);

    expect(handlers).toBeArray();
    expect(handlers).toHaveLength(1);
    expect(handlers[0].trigger.config.schedule).toBe(testSchedule);
  });

  test("handler executes onCronTrigger and returns result", async () => {
    const config: Config = {
      schedule: "*/5 * * * *",
      openaiApiKey: "test",
      jsonbinApiKey: "test",
      jsonbinBinId: "test"
    };
    const runtime = newTestRuntime();
    runtime.config = () => config;
    // Add mocks as above
    runtime.httpGet = (url: string) => {
      if (url.includes("coingecko")) {
        return {
          body: JSON.stringify({
            bitcoin: { usd: 50000, usd_24h_change: 2.5 },
            ethereum: { usd: 3000, usd_24h_change: -1.2 }
          })
        };
      }
      return { body: "{}" };
    };
    runtime.httpPost = (url: string, body: string) => {
      return {
        body: JSON.stringify({
          choices: [{ message: { content: '{"riskLevel": "MEDIUM", "summary": "Some volatility."}' } }]
        })
      };
    };
    runtime.httpPut = (url: string, body: string) => {
      // Mock
    };
    const handlers = initWorkflow(config);

    const result = handlers[0].fn(runtime, {});

    expect(result).toBe("MEDIUM");
  });
});
