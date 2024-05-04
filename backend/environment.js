const dotenv = require("dotenv");
const path = require("path");
const p = path.resolve(__dirname, `${process.env.NODE_ENV}.env`);
console.log("setting path for environment...", p);
console.log("setting up environment variables...");
dotenv.config({
  path: p,
});

const environmentVariables = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 8080,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
};
console.log("environment variables set-----------------------------");
console.log(environmentVariables);
module.exports = environmentVariables;
