import * as fs from 'node:fs';
import * as path from 'node:path';
import { ManagedIdentityCredential } from '@azure/identity';
import { ChatPrompt } from '@microsoft/teams.ai';
import { MessageActivity, type TokenCredentials } from '@microsoft/teams.api';
import { App } from '@microsoft/teams.apps';
import { LocalStorage } from '@microsoft/teams.common';
import config from '../config';
import { getLanguageModel } from './models/language-model';
import { UnifiedChatModel } from './models/unified-chat-model';

// Create storage for conversation history
const storage = new LocalStorage();

// Load instructions from file on initialization
function loadInstructions(): string {
    const instructionsFilePath = path.join(__dirname, 'instructions.txt');
    return fs.readFileSync(instructionsFilePath, 'utf-8').trim();
}

// Load instructions once at startup
const instructions = loadInstructions();

const createTokenFactory = () => {
    return async (
        scope: string | string[],
        tenantId?: string,
    ): Promise<string> => {
        const managedIdentityCredential = new ManagedIdentityCredential({
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
const tokenCredentials: TokenCredentials = {
    clientId: process.env.CLIENT_ID || '',
    token: createTokenFactory(),
};

const credentialOptions =
    config.MicrosoftAppType === 'UserAssignedMsi'
        ? { ...tokenCredentials }
        : undefined;

// Create the app with storage
const app = new App({
    ...credentialOptions,
    storage,
});

// Handle incoming messages
app.on('message', async ({ send, stream, activity }) => {
    //Get conversation history
    const conversationKey = `${activity.conversation.id}/${activity.from.id}`;
    const messages = storage.get(conversationKey) || [];

    try {
        const prompt = new ChatPrompt({
            messages,
            instructions,
            model: new UnifiedChatModel(
                getLanguageModel(
                    config.llmProvider,
                    config.llmModelName || '',
                    config.llmApiKey || '',
                    config.llmBaseUrl,
                ),
            ),
        });

        let responseContent = '';
        if (activity.conversation.isGroup) {
            // If the conversation is a group chat, we need to send the final response
            // back to the group chat
            const response = await prompt.send(activity.text);
            if (response?.content) {
                responseContent = response.content;
            }
            const responseActivity = new MessageActivity(responseContent)
                .addAiGenerated()
                .addFeedback();
            await send(responseActivity);
        } else {
            const response = await prompt.send(activity.text, {
                onChunk: (chunk) => {
                    stream.emit(chunk);
                },
            });
            if (response?.content) {
                responseContent = response.content;
            }
            // We wrap the final response with an AI Generated indicator
            stream.emit(new MessageActivity().addAiGenerated().addFeedback());
        }

        messages.push({ role: 'user', content: activity.text });
        messages.push({ role: 'model', content: responseContent });

        // Keep only the most recent N messages to prevent context window bloat
        const MAX_HISTORY_MESSAGES = config.maxHistoryMessages;
        if (messages.length > MAX_HISTORY_MESSAGES) {
            messages.splice(0, messages.length - MAX_HISTORY_MESSAGES);
        }

        storage.set(conversationKey, messages);
    } catch (error) {
        console.error(error);
        await send('The agent encountered an error or bug.');
        await send(
            'To continue to run this agent, please fix the agent source code.',
        );
    }
});

app.on('message.submit.feedback', async ({ activity }) => {
    //add custom feedback process logic here
    console.log(`Your feedback is ${JSON.stringify(activity.value)}`);
});

export default app;
