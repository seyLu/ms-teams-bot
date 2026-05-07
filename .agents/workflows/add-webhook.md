---
description: 
---

# How to Add a New Webhook to Microsoft Teams Bot

This workflow documents the exact steps required to add a new webhook integration to the Teams Bot. Because webhooks require secure environment variables that are injected into Azure App Service, adding a webhook requires updates to both the source code and the infrastructure templates.

## Step 1: Update `webhook.config.ts`

First, configure the webhook in the application source code.
Modify `src/app/tools/webhook/webhook.config.ts`:

1.  Create a new `WebhookConfig` entry in the `webhookConfigs` array.
2.  Use `process.env` to reference your secure webhook URL.
3.  If the instructions are lengthy, use the `loadPrompt()` helper and place a `.txt` file in `src/app/tools/webhook/prompts/`.

**Example:**
```typescript
{
    name: "My New Service",
    url: process.env.SECRET_MY_NEW_SERVICE_WEBHOOK_URL as string,
    method: "POST",
    llmInstruction: loadPrompt("my-new-service-instruction.txt"),
    authHeaderName: "Authorization",
    authHeaderPrefix: "Bearer",
    authToken: process.env.SECRET_MY_NEW_SERVICE_API_KEY,
}
```

## Step 2: Add Secrets to Local Environments

Webhooks usually require URLs and API Keys. Add these variables to your `.env` templates so other developers know they are required, and to your personal `.user` files for local testing.

**Important:** ALWAYS prefix your variables with `SECRET_` so the Teams Toolkit masks them in deployment logs.

Modify `env/.env.user.example` (and your active `.env.dev.user` / `.env.local.user`):
```env
SECRET_MY_NEW_SERVICE_WEBHOOK_URL=<your-url>
SECRET_MY_NEW_SERVICE_API_KEY=<your-key>
```

## Step 3: Update Bicep Infrastructure

To deploy these environment variables to the Azure App Service, you must explicitly declare them in the Bicep template.

Modify `infra/azure.bicep`:

1.  Add a `@secure()` parameter at the top of the file:
    ```bicep
    @secure()
    param myNewServiceWebhookUrl string
    @secure()
    param myNewServiceApiKey string
    ```
2.  Map the parameter to the Azure App Service `appSettings` array inside the `webApp` resource:
    ```bicep
    {
      name: 'SECRET_MY_NEW_SERVICE_WEBHOOK_URL'
      value: myNewServiceWebhookUrl
    }
    {
      name: 'SECRET_MY_NEW_SERVICE_API_KEY'
      value: myNewServiceApiKey
    }
    ```

## Step 4: Map Parameters in Teams Toolkit

Finally, link the `.env` variables to the newly created Bicep parameters so Teams Toolkit can inject them during deployment.

Modify `infra/azure.parameters.json`:
```json
"myNewServiceWebhookUrl": {
  "value": "${{SECRET_MY_NEW_SERVICE_WEBHOOK_URL}}"
},
"myNewServiceApiKey": {
  "value": "${{SECRET_MY_NEW_SERVICE_API_KEY}}"
}
```

## Step 5: Provision Azure Resources

After saving all changes, provision your Azure environment to apply the new App Settings:

```bash
pnpm atk provision --env dev
```
(Replace `dev` with your target environment).
