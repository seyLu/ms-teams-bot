import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { LanguageModel } from 'ai';

/**
 * Instantiates the requested language model using Vercel AI SDK.
 */
export function getLanguageModel(provider: string, modelName: string, apiKey: string): LanguageModel {
    if (!apiKey) {
        throw new Error(`Missing API key for provider: ${provider}`);
    }
    if (!modelName) {
        throw new Error(`Missing model name for provider: ${provider}`);
    }

    switch (provider.toLowerCase()) {
        case 'openai': {
            const openai = createOpenAI({ apiKey });
            return openai(modelName);
        }
        case 'claude':
        case 'anthropic': {
            const anthropic = createAnthropic({ apiKey });
            return anthropic(modelName);
        }
        case 'gemini':
        case 'google': {
            const google = createGoogleGenerativeAI({ apiKey });
            return google(modelName);
        }
        default:
            throw new Error(`Unsupported AI Provider: ${provider}`);
    }
}
