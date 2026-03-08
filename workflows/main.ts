import {
  CronCapability,
  handler,
  HTTPCapability,
  Runner,
  type Runtime,
} from "@chainlink/cre-sdk";

export type Config = {
  schedule: string;
  openaiApiKey: string;
  jsonbinApiKey: string;
  jsonbinBinId: string;
};

export const onCronTrigger = (runtime: Runtime<Config>): string => {
  const config = runtime.config();
  const http = new HTTPCapability();

  runtime.log("Fetching market data from CoinGecko...");
  const marketResponse = http.get(
    runtime,
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true"
  );
  const market = JSON.parse(marketResponse.body);
  if (!market.bitcoin || !market.ethereum) {
    throw new Error("Invalid market data response");
  }
  const btcPrice = market.bitcoin.usd;
  const btcChange = market.bitcoin.usd_24h_change.toFixed(2);
  const ethPrice = market.ethereum.usd;
  const ethChange = market.ethereum.usd_24h_change.toFixed(2);
  runtime.log(`BTC: $${btcPrice} (${btcChange}%) | ETH: $${ethPrice} (${ethChange}%)`);

  runtime.log("Sending to OpenAI...");
  const prompt = `You are a DeFi risk analyst. Given this market data:
- Bitcoin: $${btcPrice} | 24h change: ${btcChange}%
- Ethereum: $${ethPrice} | 24h change: ${ethChange}%
Respond ONLY with valid JSON, no extra text:
{"riskLevel": "LOW" or "MEDIUM" or "HIGH", "summary": "one sentence explanation"}`;

  const aiResponse = http.post(
    runtime,
    "https://api.openai.com/v1/chat/completions",
    JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 100,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    }),
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openaiApiKey}`,
    }
  );
  const aiJson = JSON.parse(aiResponse.body);
  if (!aiJson.choices || !aiJson.choices[0] || !aiJson.choices[0].message) {
    throw new Error("Invalid AI response");
  }
  const raw = aiJson.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  let verdict;
  try {
    verdict = JSON.parse(cleaned);
  } catch (e) {
    runtime.log(`Failed to parse AI response: ${cleaned}`);
    throw e;
  }
  runtime.log(`AI Verdict: ${verdict.riskLevel} — ${verdict.summary}`);

  runtime.log("Writing verdict to JSONBin...");
  http.put(
    runtime,
    `https://api.jsonbin.io/v3/b/${config.jsonbinBinId}`,
    JSON.stringify({
      riskLevel: verdict.riskLevel,
      summary: verdict.summary,
      btcPrice,
      btcChange,
      ethPrice,
      ethChange,
      timestamp: new Date().toISOString(),
    }),
    {
      "Content-Type": "application/json",
      "X-Master-Key": config.jsonbinApiKey,
    }
  );

  runtime.log("✅ Done!");
  return verdict.riskLevel;
};

export const initWorkflow = (config: Config) => {
  const cron = new CronCapability();
  return [handler(cron.trigger({ schedule: config.schedule }), onCronTrigger)];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}