import "server-only";
import { createDeepSeek } from "@ai-sdk/deepseek";

const deepseekProvider = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || undefined,
});

// Adjust via DEEPSEEK_MODEL if DeepSeek renames/retires this model id.
const MODEL_ID = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

export const deepseekModel = deepseekProvider(MODEL_ID);

export const MAX_OUTPUT_TOKENS = 400;
export const MAX_HISTORY_MESSAGES = 12;
export const REQUEST_TIMEOUT_MS = 20_000;
