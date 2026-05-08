const config = {
    MicrosoftAppId: process.env.CLIENT_ID,
    MicrosoftAppType: process.env.BOT_TYPE,
    MicrosoftAppTenantId: process.env.TENANT_ID,
    MicrosoftAppPassword: process.env.CLIENT_SECRET,
    llmProvider: process.env.LLM_PROVIDER || 'openai',
    llmApiKey: process.env.SECRET_LLM_API_KEY || process.env.LLM_API_KEY,
    llmModelName: process.env.LLM_MODEL_NAME,
    maxHistoryMessages: process.env.MAX_HISTORY_MESSAGES
        ? Number.parseInt(process.env.MAX_HISTORY_MESSAGES, 10)
        : 20,
};

export default config;
