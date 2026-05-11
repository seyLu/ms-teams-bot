import 'dotenv';
import { configDotenv } from 'dotenv';

const env = process.env.APP_ENV || 'dev';

configDotenv({ path: `env/.env.${env}` });
configDotenv({
    path: `env/.env.${env}.user`,
    override: true,
});

// Fallback to local environments.
// Because 'override: true' is NOT set here, these files will NOT overwrite
// variables already defined in the active APP_ENV (e.g., .env.dev).
// They strictly act as a fallback for missing variables.
configDotenv({
    path: `env/.env.local`,
});
configDotenv({
    path: `env/.env.local.user`,
});
