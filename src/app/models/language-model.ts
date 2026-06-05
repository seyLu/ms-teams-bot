import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModel } from 'ai';

/**
 * Instantiates the requested language model using Vercel AI SDK.
 * Supported providers: openai, claude, gemini, litellm
 */
export function getLanguageModel(
    provider: string,
    modelName: string,
    apiKey: string,
    baseUrl?: string,
): LanguageModel {
    if (!apiKey) {
        throw new Error(`Missing API key for provider: ${provider}`);
    }
    if (!modelName) {
        throw new Error(`Missing model name for provider: ${provider}`);
    }

    switch (provider.toLowerCase()) {
        case 'openai': {
            const openai = createOpenAI({ apiKey, baseURL: baseUrl });
            return openai(modelName);
        }
        case 'claude':
        case 'anthropic': {
            const anthropic = createAnthropic({ apiKey, baseURL: baseUrl });
            return anthropic(modelName);
        }
        case 'gemini':
        case 'google': {
            const google = createGoogleGenerativeAI({
                apiKey,
                baseURL: baseUrl,
            });
            return google(modelName);
        }
        case 'litellm': {
            if (!baseUrl) {
                throw new Error(
                    `Missing LLM_BASE_URL for provider: ${provider}`,
                );
            }
            const litellm = createOpenAICompatible({
                name: 'litellm',
                apiKey,
                baseURL: baseUrl,
            });
            return litellm(modelName);
        }
        default:
            throw new Error(`Unsupported AI Provider: ${provider}`);
    }
}
