const dotenv = require("dotenv");
const path = require("path");
const constants = require("./constants");
const p = path.resolve(__dirname, `.env`);
console.log("setting path for environment...", p);
console.log("setting up environment variables...");
dotenv.config({
  path: p,
});
const env = process.env.NODE_ENV || "development";
const environmentVariables = {
  NODE_ENV: env,
  NODE_ID: env == "development" ? "dev_node_1" : "prod_node_1",
  PORT: process.env.PORT || 8090,
  ENABLED_MODULES: process.env.ENABLED_MODULES
    ? process.env.ENABLED_MODULES.split(",")
    : [constants.MODULES.AUTH, constants.MODULES.TENANT],
  DATABASE_URL: process.env.DATABASE_URL,
  UNPOOLED_DATABASE_URL: process.env.UNPOOLED_DATABASE_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || process.env.OPEROUTER_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY,
  SYSLOG_HOST: process.env.SYSLOG_HOST || "127.0.0.1",
  SYSLOG_PORT: process.env.SYSLOG_PORT || 514,
  SYSLOG_PROTOCOL: process.env.SYSLOG_PROTOCOL || "udp4",
  LOG_RETENTION: process.env.LOG_RETENTION || 7,
  SYSLOG_LEVEL: process.env.SYSLOG_LEVEL || "warning",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE_SIZE: process.env.LOG_FILE_SIZE || 1,
  EXPRESS_REQUEST_SIZE_LIMIT: process.env.EXPRESS_REQUEST_SIZE_LIMIT || "5mb",
  CORS_WHITELIST: process.env.CORS_WHITELIST
    ? process.env.CORS_WHITELIST.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:3001",
      ],
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_S3_ENDPOINT: process.env.SUPABASE_S3_ENDPOINT,
  SUPABASE_S3_REGION: process.env.SUPABASE_S3_REGION,
  SUPABASE_S3_ACCESS_KEY_ID: process.env.SUPABASE_S3_ACCESS_KEY_ID,
  SUPABASE_S3_SECRET_ACCESS_KEY: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  SUPABASE_S3_BUCKET: process.env.SUPABASE_S3_BUCKET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  BACKEND_URL: process.env.BACKEND_URL,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  JET_ADMIN_INTERNAL_API_KEY: process.env.JET_ADMIN_INTERNAL_API_KEY,
  VAULT_ENCRYPTION_KEY: process.env.VAULT_ENCRYPTION_KEY,
  OAUTH_STATE_SECRET: process.env.OAUTH_STATE_SECRET || process.env.VAULT_ENCRYPTION_KEY,
  FIREBASE_CREDENTIALS: process.env.FIREBASE_CREDENTIALS,
};
console.log("environment variables set-----------------------------");
const safeEnv = { ...environmentVariables };
for (const key of Object.keys(safeEnv)) {
  if (key.includes('KEY') || key.includes('SUPABASE_S3_ENDPOINT') || key.includes('SUPABASE_S3_BUCKET') || key.includes('SECRET') || key.includes('URL') || key.includes('TOKEN') || key.includes('PASSWORD')) {
    safeEnv[key] = '***';
  }
}
console.log(safeEnv);
module.exports = environmentVariables;
