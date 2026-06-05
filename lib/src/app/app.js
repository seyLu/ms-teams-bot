"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const identity_1 = require("@azure/identity");
const teams_ai_1 = require("@microsoft/teams.ai");
const teams_api_1 = require("@microsoft/teams.api");
const teams_apps_1 = require("@microsoft/teams.apps");
const teams_common_1 = require("@microsoft/teams.common");
const config_1 = __importDefault(require("../config"));
const language_model_1 = require("./models/language-model");
const unified_chat_model_1 = require("./models/unified-chat-model");
// Create storage for conversation history
const storage = new teams_common_1.LocalStorage();
// Load instructions from file on initialization
function loadInstructions() {
    const instructionsFilePath = path.join(__dirname, 'instructions.txt');
    return fs.readFileSync(instructionsFilePath, 'utf-8').trim();
}
// Load instructions once at startup
const instructions = loadInstructions();
const createTokenFactory = () => {
    return async (scope, tenantId) => {
        const managedIdentityCredential = new identity_1.ManagedIdentityCredential({
            clientId: process.env.CLIENT_ID,
        });
        const scopes = Array.isArray(scope) ? scope : [scope];
        const tokenResponse = await managedIdentityCredential.getToken(scopes, {
            tenantId: tenantId,
        });
        return tokenResponse.token;
    };
};
// Configure authentication using TokenCredentials
const tokenCredentials = {
    clientId: process.env.CLIENT_ID || '',
    token: createTokenFactory(),
};
const credentialOptions = config_1.default.MicrosoftAppType === 'UserAssignedMsi'
    ? { ...tokenCredentials }
    : undefined;
// Create the app with storage
const app = new teams_apps_1.App({
    ...credentialOptions,
    storage,
});
// Handle incoming messages
app.on('message', async ({ send, stream, activity }) => {
    //Get conversation history
    const conversationKey = `${activity.conversation.id}/${activity.from.id}`;
    const messages = storage.get(conversationKey) || [];
    try {
        const prompt = new teams_ai_1.ChatPrompt({
            messages,
            instructions,
            model: new unified_chat_model_1.UnifiedChatModel((0, language_model_1.getLanguageModel)(config_1.default.llmProvider, config_1.default.llmModelName || '', config_1.default.llmApiKey || '', config_1.default.llmBaseUrl)),
        });
        let responseContent = '';
        if (activity.conversation.isGroup) {
            // If the conversation is a group chat, we need to send the final response
            // back to the group chat
            const response = await prompt.send(activity.text);
            if (response?.content) {
                responseContent = response.content;
            }
            const responseActivity = new teams_api_1.MessageActivity(responseContent)
                .addAiGenerated()
                .addFeedback();
            await send(responseActivity);
        }
        else {
            const response = await prompt.send(activity.text, {
                onChunk: (chunk) => {
                    stream.emit(chunk);
                },
            });
            if (response?.content) {
                responseContent = response.content;
            }
            // We wrap the final response with an AI Generated indicator
            stream.emit(new teams_api_1.MessageActivity().addAiGenerated().addFeedback());
        }
        messages.push({ role: 'user', content: activity.text });
        messages.push({ role: 'model', content: responseContent });
        // Keep only the most recent N messages to prevent context window bloat
        const MAX_HISTORY_MESSAGES = config_1.default.maxHistoryMessages;
        if (messages.length > MAX_HISTORY_MESSAGES) {
            messages.splice(0, messages.length - MAX_HISTORY_MESSAGES);
        }
        storage.set(conversationKey, messages);
    }
    catch (error) {
        console.error(error);
        await send('The agent encountered an error or bug.');
        await send('To continue to run this agent, please fix the agent source code.');
    }
});
app.on('message.submit.feedback', async ({ activity }) => {
    //add custom feedback process logic here
    console.log(`Your feedback is ${JSON.stringify(activity.value)}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map