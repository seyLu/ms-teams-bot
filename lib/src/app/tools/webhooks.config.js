Object.defineProperty(exports, '__esModule', { value: true });
exports.webhookConfigs = void 0;
exports.getWebhookSystemInstructions = getWebhookSystemInstructions;
exports.webhookConfigs = [
    // We configure webhooks here to avoid ugly JSON strings in .env files.
    // This also keeps API keys completely secure by only referencing their environment variable name (authEnvVar),
    // preventing the AI from ever seeing them directly! The authHeaderName/Prefix allows flexibility for any service.
    {
        matchUrl: 'https://n8n.mycompany.com/webhook/',
        authHeaderName: 'Authorization',
        authHeaderPrefix: 'Bearer',
        authEnvVar: 'SECRET_N8N_API_KEY',
        llmInstruction:
            'If the user asks to create a ticket, trigger a POST webhook to https://n8n.mycompany.com/webhook/create-ticket with body { title }.',
    },
    // Example: API Gateway (Custom Header, no prefix)
    // {
    //   matchUrl: "https://api.mycompany.com/",
    //   authHeaderName: "x-api-key",
    //   authHeaderPrefix: "",
    //   authEnvVar: "SECRET_CUSTOM_API_KEY"
    // },
    // Example: Public Webhook (No Authentication needed)
    // {
    //   matchUrl: "https://public.service.com/webhook/"
    // }
    // }
];
function getWebhookSystemInstructions() {
    const instructions = exports.webhookConfigs
        .map((c) => c.llmInstruction)
        .filter(Boolean)
        .join('\n');
    return instructions
        ? `\n\n[WEBHOOK INSTRUCTIONS]\nYou have access to the triggerWebhook tool. Follow these rules:\n${instructions}`
        : '';
}
//# sourceMappingURL=webhooks.config.js.map
