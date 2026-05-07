import type {
    ChatSendOptions,
    IChatModel,
    Message,
    ModelMessage,
} from '@microsoft/teams.ai';
import { type LanguageModel, stepCountIs, streamText } from 'ai';
import {
    getWebhookSystemInstructions,
    webhookConfigs,
} from '../tools/webhook/webhook.config';
import { triggerWebhook } from '../tools/webhook/webhook-tool';

// biome-ignore lint/suspicious/noExplicitAny: Required for loose compatibility with Vercel AI SDK CoreMessages
type CoreMessage = any;

export class UnifiedChatModel implements IChatModel {
    private aiModel: LanguageModel;

    constructor(aiModel: LanguageModel) {
        this.aiModel = aiModel;
    }

    async send(
        input: Message,
        options?: ChatSendOptions,
    ): Promise<ModelMessage> {
        const chatMessages: CoreMessage[] = [];
        let systemPrompt: string | undefined;

        if (options?.system) {
            systemPrompt =
                typeof options.system.content === 'string'
                    ? options.system.content
                    : JSON.stringify(options.system.content);
        }

        if (options?.messages) {
            const history = await options.messages.values();
            for (const msg of history) {
                if (msg.role === 'system') {
                    const content =
                        typeof msg.content === 'string'
                            ? msg.content
                            : JSON.stringify(msg.content);
                    systemPrompt = systemPrompt
                        ? `${systemPrompt}\n\n${content}`
                        : content;
                } else {
                    chatMessages.push(this.mapToCoreMessage(msg));
                }
            }
        }

        if (input.role === 'system') {
            const content =
                typeof input.content === 'string'
                    ? input.content
                    : JSON.stringify(input.content);
            systemPrompt = systemPrompt
                ? `${systemPrompt}\n\n${content}`
                : content;
        } else {
            chatMessages.push(this.mapToCoreMessage(input));
        }

        if (systemPrompt) {
            systemPrompt += getWebhookSystemInstructions();
        } else {
            systemPrompt = getWebhookSystemInstructions();
        }

        const result = await streamText({
            model: this.aiModel,
            system: systemPrompt,
            messages: chatMessages,
            tools: { triggerWebhook },
            stopWhen: stepCountIs(5),
        });

        let fullResponse = '';

        for await (const part of result.fullStream) {
            if (part.type === 'text-delta') {
                fullResponse += part.text;
                if (options?.onChunk) {
                    await options.onChunk(part.text);
                }
            } else if (part.type === 'tool-call') {
                let name = 'workflow';
                const partRecord = part as Record<string, unknown>;
                const input = (partRecord.input || partRecord.args) as
                    | { url?: string }
                    | undefined;
                if (input?.url) {
                    const config = webhookConfigs.find((c) =>
                        input.url?.startsWith(c.url),
                    );
                    if (config) name = `workflow: ${config.name}`;
                }
                const updateMsg = `\n\n⏳ *Triggering ${name}...*\n\n`;
                fullResponse += updateMsg;
                if (options?.onChunk) {
                    await options.onChunk(updateMsg);
                }
            } else if (part.type === 'tool-result') {
                let name = 'workflow';
                const partRecord = part as Record<string, unknown>;
                const input = (partRecord.input || partRecord.args) as
                    | { url?: string }
                    | undefined;
                if (input?.url) {
                    const config = webhookConfigs.find((c) =>
                        input.url?.startsWith(c.url),
                    );
                    if (config) name = `workflow: ${config.name}`;
                }
                let successStr = '';
                const output = partRecord.output as
                    | { success?: boolean }
                    | undefined;
                if (
                    output &&
                    typeof output === 'object' &&
                    'success' in output
                ) {
                    successStr = output.success ? '✅ ' : '❌ ';
                }
                const updateMsg = `\n\n${successStr}*Completed ${name}.*\n\n`;
                fullResponse += updateMsg;
                if (options?.onChunk) {
                    await options.onChunk(updateMsg);
                }
            }
        }

        return {
            role: 'model',
            content: fullResponse,
        };
    }

    private mapToCoreMessage(msg: Message): CoreMessage {
        switch (msg.role) {
            case 'user':
                return {
                    role: 'user',
                    content:
                        typeof msg.content === 'string'
                            ? msg.content
                            : msg.content.map((p) => {
                                  if (p.type === 'text')
                                      return { type: 'text', text: p.text };
                                  if (p.type === 'image_url')
                                      return {
                                          type: 'image',
                                          image: p.image_url,
                                      };
                                  return { type: 'text', text: '' };
                              }),
                };
            case 'model':
                return {
                    role: 'assistant',
                    content: msg.content || '',
                };

            case 'function':
                return {
                    role: 'tool',
                    content: [
                        {
                            type: 'tool-result',
                            toolCallId: msg.function_id,
                            result: msg.content || '',
                            toolName: 'unknown',
                        },
                    ],
                };
            default:
                return { role: 'user', content: '' };
        }
    }
}
