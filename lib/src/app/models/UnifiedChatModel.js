Object.defineProperty(exports, '__esModule', { value: true });
exports.UnifiedChatModel = void 0;
const ai_1 = require('ai');
class UnifiedChatModel {
    aiModel;
    constructor(aiModel) {
        this.aiModel = aiModel;
    }
    async send(input, options) {
        const chatMessages = [];
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
        const result = await (0, ai_1.streamText)({
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
    mapToCoreMessage(msg) {
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
exports.UnifiedChatModel = UnifiedChatModel;
//# sourceMappingURL=UnifiedChatModel.js.map
