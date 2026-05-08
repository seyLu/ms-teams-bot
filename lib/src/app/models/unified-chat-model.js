Object.defineProperty(exports, '__esModule', { value: true });
exports.UnifiedChatModel = void 0;
const ai_1 = require('ai');
const webhook_config_1 = require('../tools/webhook/webhook.config');
const webhook_tool_1 = require('../tools/webhook/webhook-tool');
class UnifiedChatModel {
    aiModel;
    constructor(aiModel) {
        this.aiModel = aiModel;
    }
    async send(input, options) {
        const chatMessages = [];
        let systemPrompt;
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
            systemPrompt += (0,
            webhook_config_1.getWebhookSystemInstructions)();
        } else {
            systemPrompt = (0, webhook_config_1.getWebhookSystemInstructions)();
        }
        const result = await (0, ai_1.streamText)({
            model: this.aiModel,
            system: systemPrompt,
            messages: chatMessages,
            tools: { triggerWebhook: webhook_tool_1.triggerWebhook },
            stopWhen: (0, ai_1.stepCountIs)(5),
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
                const partRecord = part;
                const input = partRecord.input || partRecord.args;
                if (input?.url) {
                    const config = webhook_config_1.webhookConfigs.find((c) =>
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
                const partRecord = part;
                const input = partRecord.input || partRecord.args;
                if (input?.url) {
                    const config = webhook_config_1.webhookConfigs.find((c) =>
                        input.url?.startsWith(c.url),
                    );
                    if (config) name = `workflow: ${config.name}`;
                }
                let successStr = '';
                const output = partRecord.output;
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
//# sourceMappingURL=unified-chat-model.js.map
