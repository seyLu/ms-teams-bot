export interface WebhookConfig {
    url: string;
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    llmInstruction: string;
    authHeaderName?: string;
    authHeaderPrefix?: string;
    authToken?: string;
}
export declare const webhookConfigs: WebhookConfig[];
export declare function getWebhookSystemInstructions(): string;
