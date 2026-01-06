import { OpenAICompatibleChatLanguageModel } from "@ai-sdk/openai-compatible";
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from "@ai-sdk/provider-utils";

import log from "electron-log";
import { getExtraProviderOptions } from "./thinking_utils";
import type { UserSettings } from "../../lib/schemas";
import { LanguageModelV2 } from "@ai-sdk/provider";

const logger = log.scope("llm_engine_provider");

export type ExampleChatModelId = string & {};
export interface ExampleChatSettings { }
export interface ExampleProviderSettings {
  /**
Example API key.
*/
  apiKey?: string;
  /**
Base URL for the API calls.
*/
  baseURL?: string;
  /**
Custom headers to include in the requests.
*/
  headers?: Record<string, string>;
  /**
Optional custom url query parameters to include in request urls.
*/
  queryParams?: Record<string, string>;
  /**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
*/
  fetch?: FetchFunction;

  originalProviderId: string;
  OrbixOptions: {
    enableLazyEdits?: boolean;
    enableSmartFilesContext?: boolean;
    enableWebSearch?: boolean;
  };
  settings: UserSettings;
}

export interface OrbixEngineProvider {
  /**
Creates a model for text generation.
*/
  (
    modelId: ExampleChatModelId,
    settings?: ExampleChatSettings,
  ): LanguageModelV2;

  /**
Creates a chat model for text generation.
*/
  chatModel(
    modelId: ExampleChatModelId,
    settings?: ExampleChatSettings,
  ): LanguageModelV2;
}

export function createOrbixEngine(
  options: ExampleProviderSettings,
): OrbixEngineProvider {
  const baseURL = withoutTrailingSlash(options.baseURL);
  logger.info("creating Orbix engine with baseURL", baseURL);

  // Track request ID attempts
  const requestIdAttempts = new Map<string, number>();

  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: "Orbix_PRO_API_KEY",
      description: "Example API key",
    })}`,
    ...options.headers,
  });

  interface CommonModelConfig {
    provider: string;
    url: ({ path }: { path: string }) => string;
    headers: () => Record<string, string>;
    fetch?: FetchFunction;
  }

  const getCommonModelConfig = (): CommonModelConfig => ({
    provider: `Orbix-engine`,
    url: ({ path }) => {
      const url = new URL(`${baseURL}${path}`);
      if (options.queryParams) {
        url.search = new URLSearchParams(options.queryParams).toString();
      }
      return url.toString();
    },
    headers: getHeaders,
    fetch: options.fetch,
  });

  const createChatModel = (modelId: ExampleChatModelId) => {
    // Create configuration with file handling
    const config = {
      ...getCommonModelConfig(),
      // defaultObjectGenerationMode:
      //   "tool" as LanguageModelV1ObjectGenerationMode,
      // Custom fetch implementation that adds files to the request
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        // Use default fetch if no init or body
        if (!init || !init.body || typeof init.body !== "string") {
          return (options.fetch || fetch)(input, init);
        }

        try {
          // Parse the request body to manipulate it
          const parsedBody = {
            ...JSON.parse(init.body),
            ...getExtraProviderOptions(
              options.originalProviderId,
              options.settings,
            ),
          };
          const orbixVersionedFiles = parsedBody.orbixVersionedFiles;
          if ("orbixVersionedFiles" in parsedBody) {
            delete parsedBody.orbixVersionedFiles;
          }
          const OrbixFiles = parsedBody.OrbixFiles;
          if ("OrbixFiles" in parsedBody) {
            delete parsedBody.OrbixFiles;
          }
          const requestId = parsedBody.OrbixRequestId;
          if ("OrbixRequestId" in parsedBody) {
            delete parsedBody.OrbixRequestId;
          }
          const OrbixAppId = parsedBody.OrbixAppId;
          if ("OrbixAppId" in parsedBody) {
            delete parsedBody.OrbixAppId;
          }
          const OrbixDisableFiles = parsedBody.OrbixDisableFiles;
          if ("OrbixDisableFiles" in parsedBody) {
            delete parsedBody.OrbixDisableFiles;
          }
          const OrbixMentionedApps = parsedBody.OrbixMentionedApps;
          if ("OrbixMentionedApps" in parsedBody) {
            delete parsedBody.OrbixMentionedApps;
          }
          const OrbixSmartContextMode = parsedBody.OrbixSmartContextMode;
          if ("OrbixSmartContextMode" in parsedBody) {
            delete parsedBody.OrbixSmartContextMode;
          }

          // Track and modify requestId with attempt number
          let modifiedRequestId = requestId;
          if (requestId) {
            const currentAttempt = (requestIdAttempts.get(requestId) || 0) + 1;
            requestIdAttempts.set(requestId, currentAttempt);
            modifiedRequestId = `${requestId}:attempt-${currentAttempt}`;
          }

          // Add files to the request if they exist
          if (!OrbixDisableFiles) {
            parsedBody.Orbix_options = {
              files: OrbixFiles,
              versioned_files: orbixVersionedFiles,
              enable_lazy_edits: options.OrbixOptions.enableLazyEdits,
              enable_smart_files_context:
                options.OrbixOptions.enableSmartFilesContext,
              smart_context_mode: OrbixSmartContextMode,
              enable_web_search: options.OrbixOptions.enableWebSearch,
              app_id: OrbixAppId,
            };
            if (OrbixMentionedApps?.length) {
              parsedBody.Orbix_options.mentioned_apps = OrbixMentionedApps;
            }
          }

          // Return modified request with files included and requestId in headers
          const modifiedInit = {
            ...init,
            headers: {
              ...init.headers,
              ...(modifiedRequestId && {
                "X-Orbix-Request-Id": modifiedRequestId,
              }),
            },
            body: JSON.stringify(parsedBody),
          };

          // Use the provided fetch or default fetch
          return (options.fetch || fetch)(input, modifiedInit);
        } catch (e) {
          logger.error("Error parsing request body", e);
          // If parsing fails, use original request
          return (options.fetch || fetch)(input, init);
        }
      },
    };

    return new OpenAICompatibleChatLanguageModel(modelId, config);
  };

  const provider = (modelId: ExampleChatModelId) => createChatModel(modelId);

  provider.chatModel = createChatModel;

  return provider;
}
