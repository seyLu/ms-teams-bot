console.log("key", process.env.OPENAI_API_KEY);
console.log("secret", process.env.SECRET_OPENAI_API_KEY);

const config = {
    MicrosoftAppId: process.env.CLIENT_ID,
    MicrosoftAppType: process.env.BOT_TYPE,
    MicrosoftAppTenantId: process.env.TENANT_ID,
    MicrosoftAppPassword: process.env.CLIENT_SECRET,
    openAIKey: process.env.OPENAI_API_KEY,
    openAIModelName: "gpt-3.5-turbo",
};

export default config;
