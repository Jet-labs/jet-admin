const fs = require('fs');
const path = require('path');
const permissionsData = require('../config/permissions.json');

// Get all permission titles from JSON
const allTitles = [];
for (const [resource, actions] of Object.entries(permissionsData)) {
  for (const [action, meta] of Object.entries(actions)) {
    allTitles.push(meta.title);
  }
}

// Read seed-casbin-policies.js
const seedContent = fs.readFileSync(path.join(__dirname, '../scripts/seed-casbin-policies.js'), 'utf8');

// Find all strings in the format "tenant:..." in the PERMISSION_MAP block
const match = seedContent.match(/PERMISSION_MAP = \{([\s\S]*?)\};/);
if (!match) {
  console.log("Could not find PERMISSION_MAP in seed script");
  process.exit(1);
}

const mapContent = match[1];
const seedTitles = [];
const titleRegex = /"([^"]+)":/g;
let m;
while ((m = titleRegex.exec(mapContent)) !== null) {
  seedTitles.push(m[1]);
}

const missingInSeed = allTitles.filter(t => !seedTitles.includes(t));
console.log("Permissions missing from seed-casbin-policies.js PERMISSION_MAP:");
console.log(missingInSeed);

// Also check fix-admin-permissions.js MISSING_PERMISSIONS
const fixContent = fs.readFileSync(path.join(__dirname, '../scripts/fix-admin-permissions.js'), 'utf8');
const missingMatch = fixContent.match(/MISSING_PERMISSIONS = \[([\s\S]*?)\];/);
const missingArrayContent = missingMatch[1];
const fixTitles = [];
while ((m = titleRegex.exec(missingArrayContent)) !== null) {
  fixTitles.push(m[1]);
}

console.log("\nTitles in fix-admin-permissions.js MISSING_PERMISSIONS:");
// We should check what permissions from allTitles are NOT in MISSING_PERMISSIONS AND NOT in the existing seed role?
// Actually, it's easier to just list what's missing in seed scripts.
