import type {
    ChatSendOptions,
    IChatModel,
    Message,
    ModelMessage,
} from '@microsoft/teams.ai';
import { type LanguageModel, streamText } from 'ai';

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

        const result = await streamText({
            model: this.aiModel,
            system: systemPrompt,
            messages: chatMessages,
        });

        let fullResponse = '';

        for await (const chunk of result.textStream) {
            fullResponse += chunk;
            if (options?.onChunk) {
                await options.onChunk(chunk);
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
