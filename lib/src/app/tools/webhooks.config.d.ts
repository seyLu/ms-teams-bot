export interface WebhookConfig {
    matchUrl: string;
    authHeaderName?: string;
    authHeaderPrefix?: string;
    authEnvVar?: string;
    llmInstruction?: string;
}
export declare const webhookConfigs: WebhookConfig[];
export declare function getWebhookSystemInstructions(): string;
