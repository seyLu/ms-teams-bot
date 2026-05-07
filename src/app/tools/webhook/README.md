# Webhook Integrations

This bot includes a powerful, generic `triggerWebhook` tool that allows the LLM to interact with external services (like n8n, Slack, or any API) dynamically.

## Why use `webhook.config.ts`?

Instead of forcing you to write complex JSON strings inside `.env` files, webhook mapping is handled programmatically in `webhook.config.ts`.

This file acts as a secure router:
1. **SSRF Protection**: The AI can only trigger URLs that match the explicitly defined `url` property.
2. **Secure Auth Injection**: The `authToken` configuration allows you to securely inject API keys directly from `process.env`. **The AI never sees the actual API keys.**
3. **Flexibility**: The `authHeaderName` and `authHeaderPrefix` properties allow you to connect to *any* service, whether it requires `Authorization: Bearer <key>`, `x-api-key: <key>`, or `Authorization: Token <key>`.

Because `webhook.config.ts` contains no actual secrets (only `process.env` references), it is safely committed to source control.

## Webhook Prompts

If your webhook requires lengthy LLM instructions (explaining *when* and *how* the AI should trigger the webhook), you should place a `.txt` file inside the `prompts/` directory.

You can then load it seamlessly using the helper function:
```typescript
llmInstruction: loadPrompt('my-webhook-instruction.txt')
```

*(Note: The build scripts are configured to automatically copy the `prompts/` directory to the output `lib` folder during compilation).*

## How to Add a New Webhook Manually

Because this project uses the Microsoft Teams Toolkit and Azure App Service, adding a new webhook with secure environment variables requires **4 steps**.

Please see the dedicated workflow guide: [How to Add a New Webhook](../../../../.agents/workflows/add-webhook.md) for step-by-step instructions with code examples.
