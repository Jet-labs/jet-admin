const { Pool } = require("pg");
const environmentVariables = require("../environment");
const pool = new Pool({
  connectionString: environmentVariables.DATABASE_URL,
});

module.exports = { pgPool: pool };
