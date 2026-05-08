import type { LanguageModel } from 'ai';
/**
 * Instantiates the requested language model using Vercel AI SDK.
 */
export declare function getLanguageModel(
    provider: string,
    modelName: string,
    apiKey: string,
): LanguageModel;
