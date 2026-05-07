import 'dotenv';
import { configDotenv } from 'dotenv';

const env = process.env.APP_ENV || 'dev';

configDotenv({ path: `env/.env.${env}` });
configDotenv({
    path: `env/.env.${env}.user`,
    override: true,
});

// local overrides
configDotenv({
    path: `env/.env.local`,
});
configDotenv({
    path: `env/.env.local.user`,
});
