require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { Util } = require("casbin");

// Verify keyMatch vs keyMatch2
console.log("=== keyMatch vs keyMatch2 ===");
const km = Util.keyMatchFunc;
const km2 = Util.keyMatch2Func;
console.log("keyMatch('datasource:abc', 'datasource:*'):", km("datasource:abc", "datasource:*"));
console.log("keyMatch('datasource:*', 'datasource:*'):", km("datasource:*", "datasource:*"));
console.log("keyMatch2('datasource:abc', 'datasource:*'):", km2("datasource:abc", "datasource:*"));

async function main() {
  const { getEnforcer } = require("../config/casbin.config");
  const enforcer = await getEnforcer();

  const TENANT   = "c7d62f04-720b-4d78-9e58-0d157c301097";
  const API_KEY  = "679a11ed-1340-4216-a51d-d356e582c3c0";
  const ROLE     = "role:d527f3b0-31a7-4a81-b85a-8a1973f56aec";
  const ADMIN    = "2c743141-7ff2-4c96-a075-3610a985e2d7";

  console.log("\n=== Enforce tests after keyMatch fix ===");
  const tests = [
    [API_KEY,  "datasource:*",       "list"],
    [API_KEY,  "datasource:abc-123", "list"],
    [API_KEY,  "datasource:*",       "test"],
    [API_KEY,  "widget:*",           "list"],
    [ROLE,     "datasource:*",       "list"],
    [ADMIN,    "datasource:*",       "list"],
    [API_KEY,  "datasource:*",       "read"],
  ];

  for (const [sub, obj, act] of tests) {
    const label = sub === API_KEY ? "apiKey" : sub === ROLE ? "ROLE" : "admin";
    const r = await enforcer.enforce(sub, TENANT, obj, act);
    console.log(`  enforce(${label}, tenant, "${obj}", "${act}") → ${r ? "✅ ALLOW" : "❌ DENY"}`);
  }
}
main().catch(console.error);
