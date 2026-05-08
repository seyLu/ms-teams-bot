var __importDefault =
    (this && this.__importDefault) ||
    ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, '__esModule', { value: true });
exports.webhookConfigs = void 0;
exports.getWebhookSystemInstructions = getWebhookSystemInstructions;
const node_fs_1 = __importDefault(require('node:fs'));
const node_path_1 = __importDefault(require('node:path'));
function loadPrompt(filename) {
    return node_fs_1.default.readFileSync(
        node_path_1.default.join(__dirname, 'prompts', filename),
        'utf8',
    );
}
exports.webhookConfigs = [
    // We configure webhooks here to avoid ugly JSON strings in .env files.
    // This also keeps API keys completely secure by only referencing their environment variable name (authEnvVar),
    // preventing the AI from ever seeing them directly! The authHeaderName/Prefix allows flexibility for any service.
    // {
    //     name: "Create Ticket (n8n)",
    //     url: process.env.SECRET_N8N_WEBHOOK_URL as string,
    //     method: "POST",
    //     // You can load lengthy instructions from a file in the prompts/ directory
    //     llmInstruction: loadPrompt("create-ticket-instruction.txt"),
    //     authHeaderName: "Authorization",
    //     authHeaderPrefix: "Bearer",
    //     authToken: process.env.SECRET_N8N_API_KEY,
    // },
    // // Example: API Gateway (Custom Header, no prefix)
    // {
    //   name: "Custom API Gateway",
    //   url: process.env.SECRET_CUSTOM_API_WEBHOOK_URL as string,
    //   method: "POST",
    //   // Alternatively, you can pass instructions directly as a string
    //   llmInstruction: "Trigger this webhook when the user wants to fetch data from the custom API...",
    //   authHeaderName: "x-api-key",
    //   authHeaderPrefix: "",
    //   authToken: process.env.SECRET_CUSTOM_API_KEY,
    // },
    // Example: Public Webhook (No Authentication needed)
    // {
    //   name: "Public Webhook",
    //   url: process.env.PUBLIC_SERVICE_WEBHOOK_URL as string,
    //   method: "POST",
    //   llmInstruction: "Trigger this public webhook when..."
    // }
    {
        name: 'SharePoint Delta Poller',
        url: process.env.SECRET_SHAREPOINT_DELTA_POLLER_WEBHOOK_URL,
        method: 'POST',
        llmInstruction: loadPrompt('delta-poller-tool-instruction.txt'),
    },
];
function getWebhookSystemInstructions() {
    const instructions = exports.webhookConfigs
        .map((c) => {
            if (!c.llmInstruction) return null;
            return `Webhook Target:\n- Name: ${c.name}\n- URL: ${c.url}\n- Method: ${c.method}\n- Instructions: ${c.llmInstruction.trim()}`;
        })
        .filter(Boolean)
        .join('\n\n');
    return instructions
        ? `\n\n[WEBHOOK INSTRUCTIONS]\nYou have access to the triggerWebhook tool. When instructed to trigger a webhook, you MUST use the exact URL and Method specified below.\n\n${instructions}`
        : '';
}
//# sourceMappingURL=webhook.config.js.map
