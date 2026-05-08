Object.defineProperty(exports, '__esModule', { value: true });
require('dotenv');
const dotenv_1 = require('dotenv');
const env = process.env.APP_ENV || 'dev';
(0, dotenv_1.configDotenv)({ path: `env/.env.${env}` });
(0, dotenv_1.configDotenv)({
    path: `env/.env.${env}.user`,
    override: true,
});
// local overrides
(0, dotenv_1.configDotenv)({
    path: `env/.env.local`,
});
(0, dotenv_1.configDotenv)({
    path: `env/.env.local.user`,
});
//# sourceMappingURL=env.js.map
