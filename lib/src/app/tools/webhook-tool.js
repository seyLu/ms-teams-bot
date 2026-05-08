Object.defineProperty(exports, '__esModule', { value: true });
exports.triggerWebhook = void 0;
const ai_1 = require('ai');
const zod_1 = require('zod');
const webhook_config_1 = require('./webhook.config');
exports.triggerWebhook = (0, ai_1.tool)({
    description:
        'Trigger an external webhook or workflow (like n8n) to perform an action or fetch data.',
    parameters: zod_1.z.object({
        url: zod_1.z
            .string()
            .url()
            .describe('The full URL of the webhook to trigger.'),
        method: zod_1.z
            .enum(['GET', 'POST', 'PUT', 'DELETE'])
            .describe('The HTTP method to use.'),
        body: zod_1.z
            .record(zod_1.z.any())
            .optional()
            .describe(
                'An optional JSON object representing the payload to send.',
            ),
    }),
    execute: async ({ url, method, body }) => {
        try {
            // Find a matching configuration for this URL to prevent SSRF and apply correct auth
            const config = webhook_config_1.webhookConfigs.find((c) =>
                url.startsWith(c.matchUrl),
            );
            if (!config) {
                return {
                    success: false,
                    error: `Access Denied: The URL '${url}' is not an allowed webhook domain.`,
                };
            }
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            // Securely inject the API key if this webhook requires authentication
            if (config.authEnvVar && config.authHeaderName) {
                const secret = process.env[config.authEnvVar];
                if (!secret) {
                    return {
                        success: false,
                        error: `Configuration Error: The environment variable '${config.authEnvVar}' is missing.`,
                    };
                }
                const prefix = config.authHeaderPrefix
                    ? `${config.authHeaderPrefix.trim()} `
                    : '';
                headers[config.authHeaderName] = `${prefix}${secret}`;
            }
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!response.ok) {
                return {
                    success: false,
                    status: response.status,
                    error: `Webhook returned an error: ${response.statusText}`,
                };
            }
            const responseData = await response.json();
            return {
                success: true,
                status: response.status,
                data: responseData,
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to execute webhook: ${error.message}`,
            };
        }
    },
});
//# sourceMappingURL=webhook-tool.js.map
