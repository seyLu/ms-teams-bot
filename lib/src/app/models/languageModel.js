Object.defineProperty(exports, '__esModule', { value: true });
exports.getLanguageModel = getLanguageModel;
const openai_1 = require('@ai-sdk/openai');
const anthropic_1 = require('@ai-sdk/anthropic');
const google_1 = require('@ai-sdk/google');
/**
 * Instantiates the requested language model using Vercel AI SDK.
 */
function getLanguageModel(provider, modelName, apiKey) {
    if (!apiKey) {
        throw new Error(`Missing API key for provider: ${provider}`);
    }
    if (!modelName) {
        throw new Error(`Missing model name for provider: ${provider}`);
    }
    switch (provider.toLowerCase()) {
        case 'openai': {
            const openai = (0, openai_1.createOpenAI)({ apiKey });
            return openai(modelName);
        }
        case 'claude':
        case 'anthropic': {
            const anthropic = (0, anthropic_1.createAnthropic)({ apiKey });
            return anthropic(modelName);
        }
        case 'gemini':
        case 'google': {
            const google = (0, google_1.createGoogleGenerativeAI)({ apiKey });
            return google(modelName);
        }
        default:
            throw new Error(`Unsupported AI Provider: ${provider}`);
    }
}
//# sourceMappingURL=languageModel.js.map
