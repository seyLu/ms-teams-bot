# Project Handover Document: Microsoft Teams Bot

This document provides a comprehensive overview of the Microsoft Teams Bot project, explaining how the codebase works, how to set it up, deploy it, and manage the required Azure permissions.

## 1. How the Codebase Works

This project is an AI-powered chatbot for Microsoft Teams, built using the [Microsoft Teams AI Library](https://aka.ms/teams-ai-library-v2) and the [Vercel AI SDK](https://sdk.vercel.ai/docs). It allows users to interact with an AI agent (like ChatGPT) directly within Microsoft Teams.

### Key Technologies
- **Microsoft Teams SDK (`@microsoft/teams.ai`)**: Handles the core bot framework, Teams channel connections, and bot state management.
- **Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/openai-compatible`, etc.)**: Manages the integration with Large Language Models (LLMs).
- **Microsoft 365 Agents Toolkit (`atk`)**: Provides the CLI and automation for provisioning Azure infrastructure and deploying the code.

### Directory Structure
- `src/`: Contains the application logic.
  - `src/index.ts`: The main entry point for the Node.js application. Sets up the HTTP server to listen for Bot Framework messages.
  - `src/app/app.ts`: Defines the core bot logic, message handling, and AI SDK integration.
  - `src/app/instructions.txt`: The system prompt/instructions for the LLM.
  - `src/config.ts`: Manages environment variable loading and validation.
- `infra/`: Contains Azure Bicep templates used to define and provision the cloud infrastructure.
  - `infra/azure.bicep`: The primary infrastructure definition file.
  - `infra/botRegistration/azurebot.bicep`: Defines the Azure Bot Service and Teams channel connection.
- `env/`: Stores environment variable templates (`.env.example`, `.env.user.example`).
- `appPackage/`: Contains templates for the Teams application manifest (`manifest.json`), which defines the app's metadata and capabilities in Teams.
- `m365agents.yml` / `m365agents.local.yml`: Toolkit configuration files defining the steps for provisioning and deployment.

### Key Features
- **Swappable LLMs**: Easily switch between OpenAI, Anthropic, Google Gemini, or LiteLLM by changing `LLM_PROVIDER` in the environment variables.
- **Conversation History**: Implements a rolling window (default 20 messages) to manage token limits and maintain context efficiently.
- **Webhooks**: Includes a tool to trigger external webhooks (e.g., n8n, Slack) directly from the LLM based on user requests.

---

## 2. How to Set It Up

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 20 or 22)
- [Microsoft 365 Agents Toolkit CLI](https://aka.ms/teamsfx-toolkit-cli) (`m365agentstoolkit-cli`)
- A Microsoft 365 Tenant with permissions to upload custom apps.
- An API Key from your chosen LLM provider (OpenAI, Anthropic, Google Gemini, or LiteLLM).

### Local Setup Steps
1. **Clone the repository** and navigate into the directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   - Copy `env/.env.example` to `env/.env.dev`
   - Copy `env/.env.user.example` to `env/.env.dev.user`
4. **Set your API Key**:
   In `env/.env.dev.user`, set your API key. *Note: Always use the `SECRET_` prefix so the toolkit masks it in logs.*
   ```env
   SECRET_LLM_API_KEY=your_api_key_here
   ```
5. **Set your LLM Provider**:
   In `env/.env.dev`, ensure your provider and model are set appropriately (e.g. `openai` and `gpt-4o`):
   ```env
   LLM_PROVIDER=openai
   LLM_MODEL_NAME=gpt-4o
   ```
6. **Run Locally**:
   - In one terminal, run the development server:
     ```bash
     npm run dev
     ```
   - In another terminal, launch the Microsoft 365 Agents Playground:
     ```bash
     npm run playground
     ```

---

## 3. How to Deploy It

Deployment is managed by the Microsoft 365 Agents Toolkit, which automates both infrastructure provisioning and code deployment.

### Deployment Steps
1. **Sign in**: Ensure you are signed into your Microsoft 365 account and Azure account via the CLI (e.g., `npx atk account login`).
2. **Provision Infrastructure**:
   - Run: `npx atk provision`
3. **Deploy Code**:
   - Run: `npx atk deploy`
4. **Publish (Optional)**:
   - To make the app available to others in your organization, use `npx atk publish` to submit it to the Teams Admin Center for review and approval.

---

## 4. What Happens Under the Hood: `atk provision` & `atk deploy`

The exact actions are defined in `m365agents.yml`.

### `atk provision`
This command is responsible for creating cloud infrastructure and app registrations:
1. **Teams App Creation (`teamsApp/create`)**: Creates a base app record in the Teams Developer Portal and gets a `TEAMS_APP_ID`.
2. **ARM/Bicep Deployment (`arm/deploy`)**: Submits `infra/azure.bicep` to Azure Resource Manager. This provisions:
   - **User Assigned Managed Identity**: For secure, passwordless resource access.
   - **Azure App Service Plan**: The compute cluster (e.g., F1 Free tier).
   - **Azure App Service (Web App)**: The hosting environment for the Node.js code.
   - **Azure Bot Service**: Registers the bot endpoint with the Bot Framework and connects it to the Microsoft Teams channel.
3. **Manifest Packaging (`teamsApp/zipAppPackage`)**: Zips `appPackage/manifest.json` and its icons into a deployment package.
4. **Teams App Update (`teamsApp/update`)**: Updates the Teams app registration with the newly packaged manifest details.

### `atk deploy`
This command is responsible for pushing your application code to the provisioned infrastructure:
1. **Build (`cli/runNpmCommand`)**: Runs `npm install` and `npm run build` to compile the TypeScript code into JavaScript.
2. **Prune (`cli/runNpmCommand`)**: Runs `npm prune --omit=dev` to remove development dependencies. This drastically reduces the deployment zip size.
3. **Zip Deploy (`azureAppService/zipDeploy`)**: Packages the current directory (excluding files listed in `.webappignore`) and uses Azure's ZipDeploy feature to push the code to the Azure App Service created during the provision step. The App Service then automatically restarts to run the new code.

---

## 5. Required Azure Permissions and Roles

To successfully provision, deploy, and manage billing for this project, the user executing the deployment requires specific access rights in both Microsoft Entra ID (formerly Azure AD) and Azure RBAC (Role-Based Access Control).

*Official Documentation References:*
*   [Azure AI Bot Service Documentation](https://learn.microsoft.com/en-us/azure/ai-services/bot-service/)
*   [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/identity/)
*   [Upload custom apps to Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/apps-upload)
*   [Azure Cost Management + Billing](https://learn.microsoft.com/azure/cost-management-billing/)

### Permissions for Azure Registration & Azure Bot
Because this project utilizes a **User Assigned Managed Identity** (`UserAssignedMSI`) for the Azure Bot rather than a traditional App Registration, the permission requirements are significantly simplified.

- **Azure Subscription / Resource Group Roles**:
  - You need **Contributor** access to the target Azure Resource Group. This allows you to create the App Service Plan, Web App, and the Azure Bot Service.
  - You also need **Managed Identity Contributor** (which is included in the standard Contributor role) to create the User Assigned Identity and assign it to the Web App and Azure Bot.
- **Microsoft Entra ID (Azure AD)**:
  - *No special Entra ID roles (like Application Developer) are required!* The use of Managed Identities eliminates the need to manually create Entra ID App Registrations for the bot, saving you from needing elevated Active Directory privileges.
- **Microsoft 365 Tenant**:
  - You must have permission to **Upload custom apps** in Microsoft Teams. This is typically managed in the Teams Admin Center via Setup Policies (usually requires Teams Administrator or Global Administrator to enable for a user).

### Permissions for Azure Billing
- To provision resources, an active Azure Subscription is required.
- If you are deploying to an *existing* subscription, the **Contributor** role on the Resource Group is sufficient; you do not need billing management permissions.
- If you need to *create a new subscription* or manage payment methods/invoices, you will need the **Account Owner**, **Billing Profile Contributor**, or **Subscription Owner** role on the Azure billing account.

---

## 6. Extending the Bot with Webhooks

This project includes a powerful, generic `triggerWebhook` tool that allows the LLM to interact with external services (like n8n, Slack, or any API) dynamically.

### How it Works
Instead of hardcoding APIs, webhook mapping is handled programmatically in `src/app/tools/webhook/webhook.config.ts`. This acts as a secure router that protects against SSRF (the AI can only trigger predefined URLs) and injects authentication securely so the LLM never sees the actual API keys.

### How to Add a New Webhook
Because the bot is deployed via Azure Bicep and the Teams Toolkit, adding a new webhook requires 5 steps (fully detailed in `.agents/workflows/add-webhook.md`):

1. **Update Code**: Add your webhook definition (URL, auth headers) to the `webhookConfigs` array in `webhook.config.ts` using `process.env` references. You can also provide custom LLM instructions via the `prompts/` directory.
2. **Update `.env` Files**: Add your webhook URL and API keys (prefixed with `SECRET_`) to your `.env.user.example` and local `.user` files.
3. **Update Bicep Infrastructure**: Add the new secrets to `infra/azure.bicep` as `@secure()` parameters and map them to the `webApp` App Settings.
4. **Map Toolkit Parameters**: Bind your `.env` variables to the Bicep parameters inside `infra/azure.parameters.json`.
5. **Provision**: Run `npx atk provision --env dev` to deploy the new secure settings to the Azure App Service.

---

## 7. Next Steps & Getting Started
1. **Understand Bot Behavior**: Review `src/app/instructions.txt` to modify the bot's persona, context, and core instructions.
2. **Extend Capabilities**: Read `src/app/tools/webhook/README.md` for full details on webhook integration.
3. **Infrastructure Changes**: Review the `m365agents.yml` file to understand the deployment pipeline and modify environment variables passed to Azure via `infra/azure.bicep`.
