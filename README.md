# Overview of the Basic AI Chatbot template

This app template is built on top of [Microsoft Teams SDK](https://aka.ms/teams-ai-library-v2).
It showcases an agent app that responds to user questions like ChatGPT. This enables your users to talk with the AI agent in Teams.

## Get started with the template

> **Prerequisites**
>
> To run the template in your local dev machine, you will need:
>
> - [Node.js](https://nodejs.org/), supported versions: 20, 22.
> - [Microsoft 365 Agents Toolkit CLI](https://aka.ms/teamsfx-toolkit-cli).
> - An account with [OpenAI](https://platform.openai.com/), [Anthropic](https://www.anthropic.com/), [Google Gemini](https://ai.google.dev/), or a proxy like [LiteLLM](https://litellm.vercel.app/).

> For local debugging using Microsoft 365 Agents Toolkit CLI, you need to do some extra steps described in [Set up your Microsoft 365 Agents Toolkit CLI for local debugging](https://aka.ms/teamsfx-cli-debugging).

1. To set up your local environment, copy `env/.env.example` to `env/.env.dev` (and `.env.playground`) and copy `env/.env.user.example` to `env/.env.dev.user` (and `.env.playground.user`).
1. In your new `*.user` files, fill in your API key: `SECRET_LLM_API_KEY=<your-key>`.
1. In your new non-user files, make sure `LLM_PROVIDER` and `LLM_MODEL_NAME` are set properly (e.g. `openai` and `gpt-4o`).
1. Run `npm run dev` in one terminal to start your local dev server.
1. Run `npm run playground` in another terminal to launch the Microsoft 365 Agents Playground using a web browser.
1. You can send any message to get a response from the agent.

**Congratulations**! You are running an application that can now interact with users in Microsoft 365 Agents Playground:

![Basic AI Chatbot](https://github.com/user-attachments/assets/984af126-222b-4c98-9578-0744790b103a)

## What's included in the template

| Folder       | Contents                                            |
| - | - |
| `appPackage` | Templates for the application manifest        |
| `env`        | Environment files                                   |
| `infra`      | Templates for provisioning Azure resources          |
| `src`        | The source code for the application                 |

The following files can be customized and demonstrate an example implementation to get you started.

| File                                 | Contents                                           |
| - | - |
|`src/index.ts`| Application entry point. |
|`src/config.ts`| Defines the environment variables.|
|`src/app/instructions.txt`| Defines the prompt.|
|`src/app/app.ts`| Handles business logics for the Basic AI Chatbot.|

The following are Microsoft 365 Agents Toolkit specific project files. You can [visit a complete guide on Github](https://github.com/OfficeDev/TeamsFx/wiki/Teams-Toolkit-Visual-Studio-Code-v5-Guide#overview) to understand how Microsoft 365 Agents Toolkit works.

| File                                 | Contents                                           |
| - | - |
|`m365agents.yml`|This is the main Microsoft 365 Agents Toolkit project file. The project file defines two primary things:  Properties and configuration Stage definitions. |
|`m365agents.local.yml`|This overrides `m365agents.yml` with actions that enable local execution and debugging.|
|`m365agents.playground.yml`| This overrides `m365agents.yml` with actions that enable local execution and debugging in Microsoft 365 Agents Playground.|

## Swappable LLM Models & Environment Configuration

This template has been customized to support multiple Large Language Model providers (OpenAI, Anthropic, Google Gemini, LiteLLM) using the Vercel AI SDK.

To switch providers, update the following environment variables in your `.env.dev` files:
- `LLM_PROVIDER`: The provider to use (`openai`, `claude`, `gemini`, or `litellm`).
- `LLM_BASE_URL`: The custom base URL to use (required for `litellm`, optional for others).
- `LLM_MODEL_NAME`: The specific model version (e.g., `gpt-4o`, `claude-3-7-sonnet-latest`, `gemini-2.5-pro`).

### Why use `SECRET_` for API Keys?

You must place your API keys in the `.user` configuration files (e.g., `.env.dev.user`) as `SECRET_LLM_API_KEY=<your-key>`.

> [!IMPORTANT]
> **Always prefix API keys with `SECRET_`**.
> The Microsoft 365 Agents Toolkit automatically scans environment variables. Any variable starting with `SECRET_` will be masked (`***`) in your build and deployment logs. If you just use `LLM_API_KEY`, the toolkit might accidentally print your raw API key to the console or CI/CD logs during provisioning.
>
> Our codebase (`src/config.ts`) prioritizes `SECRET_LLM_API_KEY` over `LLM_API_KEY` to enforce this security best practice!

## Webhook Integrations (n8n, Slack, etc.)

This bot includes a powerful, generic `triggerWebhook` tool allowing the LLM to interact with external services (like n8n workflows) dynamically.

For details on how webhooks are configured securely without committing API keys to source control, and a step-by-step guide on how to add a new webhook integration, please see the [Webhook Documentation](src/app/tools/webhook/README.md).

## Conversation History Management

To maintain a healthy token context limit and prevent API token exhaustion or high costs during long chats, this template implements a rolling conversation window.

By default, the bot remembers the most recent **20 messages** (10 conversation turns). This limit is managed dynamically right before the conversation state is saved to the bot's storage.

You can easily adjust this limit to retain more or less context by setting the `MAX_HISTORY_MESSAGES` environment variable in your `.env.dev` or `.env.dev` files (e.g., `MAX_HISTORY_MESSAGES=50`).

## Extend the template

To extend the Basic AI Chatbot template with more AI capabilities, explore [Microsoft Teams SDK documentation](https://aka.ms/m365-agents-toolkit/teams-agent-extend-ai).

## Additional information and references

- [Microsoft 365 Agents Toolkit Documentations](https://docs.microsoft.com/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [Microsoft 365 Agents Toolkit CLI](https://aka.ms/teamsfx-toolkit-cli)
- [Microsoft 365 Agents Toolkit Samples](https://github.com/OfficeDev/TeamsFx-Samples)
