import type { LanguageModel } from 'ai';
/**
 * Instantiates the requested language model using Vercel AI SDK.
 * Supported providers: openai, claude, gemini, litellm
 */
export declare function getLanguageModel(provider: string, modelName: string, apiKey: string, baseUrl?: string): LanguageModel;
