import path from "node:path";
import "dotenv";
import { configDotenv } from "dotenv";

/**
 * Base file (shared defaults)
 */
configDotenv({ path: path.resolve("env/.env") });

/**
 * Decide environment once
 */
const env = process.env.APP_ENV || "dev";

/**
 * Environment-specific file
 */
configDotenv({
    path: path.resolve(`env/.env.${env}`),
});

/**
 * Local overrides (developer machine)
 */
configDotenv({
    path: path.resolve(`env/.env.local`),
});

/**
 * Secret overrides (never committed)
 */
configDotenv({
    path: path.resolve(`env/.env.${env}.user`),
});
