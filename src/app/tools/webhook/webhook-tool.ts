import { tool } from 'ai';
import { z } from 'zod';
import { webhookConfigs } from './webhook.config';

export const triggerWebhook = tool({
    description:
        'Trigger an external webhook or workflow (like n8n) to perform an action or fetch data.',
    inputSchema: z.object({
        url: z
            .string()
            .url()
            .describe('The full URL of the webhook to trigger.'),
        method: z
            .enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
            .describe('The HTTP method to use.'),
        body: z
            .string()
            .optional()
            .describe(
                'An optional JSON string representing the payload to send. You MUST stringify the JSON object before passing it here.',
            ),
    }),
    execute: async ({ url, method, body }) => {
        try {
            // Find a matching configuration for this URL to prevent SSRF and apply correct auth
            const config = webhookConfigs.find((c) => url.startsWith(c.url));

            if (!config) {
                return {
                    success: false,
                    error: `Access Denied: The URL '${url}' is not an allowed webhook domain.`,
                };
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };

            // Securely inject the API key if this webhook requires authentication
            if (config.authToken && config.authHeaderName) {
                const prefix = config.authHeaderPrefix
                    ? `${config.authHeaderPrefix.trim()} `
                    : '';
                headers[config.authHeaderName] = `${prefix}${config.authToken}`;
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
        } catch (error: unknown) {
            return {
                success: false,
                error: `Network Error: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
});
