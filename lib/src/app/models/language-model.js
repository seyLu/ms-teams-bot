"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguageModel = getLanguageModel;
const anthropic_1 = require("@ai-sdk/anthropic");
const google_1 = require("@ai-sdk/google");
const openai_1 = require("@ai-sdk/openai");
const openai_compatible_1 = require("@ai-sdk/openai-compatible");
/**
 * Instantiates the requested language model using Vercel AI SDK.
 * Supported providers: openai, claude, gemini, litellm
 */
function getLanguageModel(provider, modelName, apiKey, baseUrl) {
    if (!apiKey) {
        throw new Error(`Missing API key for provider: ${provider}`);
    }
    if (!modelName) {
        throw new Error(`Missing model name for provider: ${provider}`);
    }
    switch (provider.toLowerCase()) {
        case 'openai': {
            const openai = (0, openai_1.createOpenAI)({ apiKey, baseURL: baseUrl });
            return openai(modelName);
        }
        case 'claude':
        case 'anthropic': {
            const anthropic = (0, anthropic_1.createAnthropic)({ apiKey, baseURL: baseUrl });
            return anthropic(modelName);
        }
        case 'gemini':
        case 'google': {
            const google = (0, google_1.createGoogleGenerativeAI)({
                apiKey,
                baseURL: baseUrl,
            });
            return google(modelName);
        }
        case 'litellm': {
            if (!baseUrl) {
                throw new Error(`Missing LLM_BASE_URL for provider: ${provider}`);
            }
            const litellm = (0, openai_compatible_1.createOpenAICompatible)({
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
//# sourceMappingURL=language-model.js.map