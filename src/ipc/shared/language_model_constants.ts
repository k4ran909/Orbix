import { LanguageModel } from "../ipc_types";

export const PROVIDERS_THAT_SUPPORT_THINKING: (keyof typeof MODEL_OPTIONS)[] = [
  "google",
  "vertex",

];

export interface ModelOption {
  name: string;
  displayName: string;
  description: string;
  dollarSigns?: number;
  temperature?: number;
  tag?: string;
  tagColor?: string;
  maxOutputTokens?: number;
  contextWindow?: number;
}

export const MODEL_OPTIONS: Record<string, ModelOption[]> = {

  google: [
    // https://ai.google.dev/gemini-api/docs/models#gemini-3-pro
    {
      name: "gemini-3-flash-preview",
      displayName: "Gemini 3 Flash (Preview)",
      description: "Powerful coding model at a good price",
      // See Flash 2.5 comment below (go 1 below just to be safe, even though it seems OK now).
      maxOutputTokens: 65_536 - 1,
      // Gemini context window = input token + output token
      contextWindow: 1_048_576,
      // Recommended by Google: https://ai.google.dev/gemini-api/docs/gemini-3?thinking=high#temperature
      temperature: 1.0,
      dollarSigns: 2,
    },
    // https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro-preview-03-25
    {
      name: "gemini-2.5-pro",
      displayName: "Gemini 2.5 Pro",
      description: "Google's Gemini 2.5 Pro model",
      // See Flash 2.5 comment below (go 1 below just to be safe, even though it seems OK now).
      maxOutputTokens: 65_536 - 1,
      // Gemini context window = input token + output token
      contextWindow: 1_048_576,
      temperature: 0,
      dollarSigns: 3,
    },
    // https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash-preview
    {
      name: "gemini-flash-latest",
      displayName: "Gemini 2.5 Flash",
      description: "Google's Gemini 2.5 Flash model (free tier available)",
      // Weirdly for Vertex AI, the output token limit is *exclusive* of the stated limit.
      maxOutputTokens: 65_536 - 1,
      // Gemini context window = input token + output token
      contextWindow: 1_048_576,
      temperature: 0,
      dollarSigns: 2,
    },
  ],
  vertex: [
    // Vertex Gemini 2.5 Pro
    {
      name: "gemini-2.5-pro",
      displayName: "Gemini 2.5 Pro",
      description: "Vertex Gemini 2.5 Pro",
      maxOutputTokens: 65_536 - 1,
      contextWindow: 1_048_576,
      temperature: 0,
    },
    // Vertex Gemini 2.5 Flash
    {
      name: "gemini-flash-latest",
      displayName: "Gemini 2.5 Flash",
      description: "Vertex Gemini 2.5 Flash",
      maxOutputTokens: 65_536 - 1,
      contextWindow: 1_048_576,
      temperature: 0,
    },
  ],
  openrouter: [
    {
      name: "qwen/qwen3-coder:free",
      displayName: "Qwen3 Coder (free)",
      description: "Use for free (data may be used for training)",
      maxOutputTokens: 32_000,
      contextWindow: 262_000,
      temperature: 0,
      dollarSigns: 0,
    },
    {
      name: "mistralai/devstral-2512:free",
      displayName: "Devstral 2 (free)",
      description: "Use for free (data may be used for training)",
      maxOutputTokens: 32_000,
      contextWindow: 200_000,
      temperature: 0,
      dollarSigns: 0,
    },
    {
      name: "z-ai/glm-4.7",
      displayName: "GLM 4.7",
      description: "Z-AI's best coding model",
      maxOutputTokens: 32_000,
      contextWindow: 200_000,
      temperature: 0.7,
      dollarSigns: 2,
    },
    {
      name: "qwen/qwen3-coder",
      displayName: "Qwen3 Coder",
      description: "Qwen's best coding model",
      maxOutputTokens: 32_000,
      contextWindow: 262_000,
      temperature: 0,
      dollarSigns: 2,
    },
    {
      name: "deepseek/deepseek-chat-v3.1",
      displayName: "DeepSeek v3.1",
      description: "Strong cost-effective model with optional thinking",
      maxOutputTokens: 32_000,
      contextWindow: 128_000,
      temperature: 0,
      dollarSigns: 2,
    },
    // https://openrouter.ai/moonshotai/kimi-k2
    {
      name: "moonshotai/kimi-k2-0905",
      displayName: "Kimi K2",
      description: "Powerful cost-effective model (updated to 0905)",
      maxOutputTokens: 32_000,
      contextWindow: 256_000,
      temperature: 0,
      dollarSigns: 2,
    },
  ],
  xai: [
    // https://docs.x.ai/docs/models
    {
      name: "grok-code-fast-1",
      displayName: "Grok Code Fast",
      description: "Fast coding model",
      maxOutputTokens: 32_000,
      contextWindow: 256_000,
      temperature: 0,
      dollarSigns: 1,
    },
    {
      name: "grok-4",
      displayName: "Grok 4",
      description: "Most capable coding model",
      maxOutputTokens: 32_000,
      contextWindow: 256_000,
      temperature: 0,
      dollarSigns: 4,
    },
    {
      name: "grok-3",
      displayName: "Grok 3",
      description: "Powerful coding model",
      maxOutputTokens: 32_000,
      contextWindow: 131_072,
      temperature: 0,
      dollarSigns: 4,
    },
  ],
  bedrock: [
    {
      name: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
      displayName: "Claude 4.5 Sonnet",
      description:
        "Anthropic's best model for coding (note: >200k tokens is very expensive!)",
      maxOutputTokens: 32_000,
      contextWindow: 1_000_000,
      temperature: 0,
    },
    {
      name: "us.anthropic.claude-sonnet-4-20250514-v1:0",
      displayName: "Claude 4 Sonnet",
      description: "Excellent coder (note: >200k tokens is very expensive!)",
      maxOutputTokens: 32_000,
      contextWindow: 1_000_000,
      temperature: 0,
    },
  ],
};

export const TURBO_MODELS: LanguageModel[] = [
  {
    apiName: "glm-4.6:turbo",
    displayName: "GLM 4.6",
    description: "Strong coding model (very fast)",
    maxOutputTokens: 32_000,
    contextWindow: 131_000,
    temperature: 0,
    dollarSigns: 3,
    type: "cloud",
  },
  {
    apiName: "kimi-k2:turbo",
    displayName: "Kimi K2",
    description: "Kimi 0905 update (fast)",
    maxOutputTokens: 16_000,
    contextWindow: 256_000,
    temperature: 0,
    dollarSigns: 2,
    type: "cloud",
  },
];

export const FREE_OPENROUTER_MODEL_NAMES = MODEL_OPTIONS.openrouter
  .filter((model) => model.name.endsWith(":free"))
  .map((model) => model.name);

export const PROVIDER_TO_ENV_VAR: Record<string, string> = {

  google: "GEMINI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  xai: "XAI_API_KEY",
  bedrock: "AWS_BEARER_TOKEN_BEDROCK",
};

export const CLOUD_PROVIDERS: Record<
  string,
  {
    displayName: string;
    hasFreeTier?: boolean;
    websiteUrl?: string;
    gatewayPrefix: string;
    secondary?: boolean;
  }
> = {

  google: {
    displayName: "Google",
    hasFreeTier: true,
    websiteUrl: "https://aistudio.google.com/app/apikey",
    gatewayPrefix: "gemini/",
  },
  vertex: {
    displayName: "Google Vertex AI",
    hasFreeTier: false,
    websiteUrl: "https://console.cloud.google.com/vertex-ai",
    // Use the same gateway prefix as Google Gemini for ORBIX Pro compatibility.
    gatewayPrefix: "gemini/",
    secondary: true,
  },
  openrouter: {
    displayName: "OpenRouter",
    hasFreeTier: true,
    websiteUrl: "https://openrouter.ai/settings/keys",
    gatewayPrefix: "openrouter/",
  },
  xai: {
    displayName: "xAI",
    hasFreeTier: false,
    websiteUrl: "https://console.x.ai/",
    gatewayPrefix: "xai/",
    secondary: true,
  },
  bedrock: {
    displayName: "AWS Bedrock",
    hasFreeTier: false,
    websiteUrl: "https://console.aws.amazon.com/bedrock/",
    gatewayPrefix: "bedrock/",
    secondary: true,
  },
};

export const LOCAL_PROVIDERS: Record<
  string,
  {
    displayName: string;
    hasFreeTier: boolean;
  }
> = {
  ollama: {
    displayName: "Ollama",
    hasFreeTier: true,
  },
  lmstudio: {
    displayName: "LM Studio",
    hasFreeTier: true,
  },
};
