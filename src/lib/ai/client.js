import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { env } from "@/env";

const providers = {
  anthropic: createAnthropic({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_BASE_URL }),
  openai: createOpenAI({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_BASE_URL }),
  deepseek: createDeepSeek({ apiKey: env.LLM_API_KEY, baseURL: env.LLM_BASE_URL }),
};

const provider = providers[env.LLM_PROVIDER];

if (!provider) {
  throw new Error(`Unsupported LLM_PROVIDER: ${env.LLM_PROVIDER}`);
}

export const llm = provider(env.LLM_MODEL);
