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

        if (options?.system) {
            chatMessages.push({
                role: 'system',
                content:
                    typeof options.system.content === 'string'
                        ? options.system.content
                        : JSON.stringify(options.system.content),
            });
        }

        if (options?.messages) {
            const history = await options.messages.values();
            for (const msg of history) {
                chatMessages.push(this.mapToCoreMessage(msg));
            }
        }

        chatMessages.push(this.mapToCoreMessage(input));

        const result = await streamText({
            model: this.aiModel,
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
            case 'system':
                return {
                    role: 'system',
                    content: msg.content,
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
