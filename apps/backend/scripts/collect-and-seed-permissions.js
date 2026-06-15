const fs = require("fs");
const path = require("path");
const { prisma } = require("../config/prisma.config");

// Helper to recursively find all *.routes.js files in a directory
function findRouteFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findRouteFiles(filePath, files);
    } else if (file.endsWith(".routes.js")) {
      files.push(filePath);
    }
  }
  return files;
}

// Extract arguments from authMiddleware.authorize calls
function extractAuthorizeCalls(fileContent) {
  const calls = [];
  let index = 0;
  while (true) {
    const pos = fileContent.indexOf("authMiddleware.authorize", index);
    if (pos === -1) break;

    const startParen = fileContent.indexOf("(", pos);
    if (startParen === -1) {
      index = pos + 24;
      continue;
    }

    let count = 1;
    let endParen = -1;
    for (let i = startParen + 1; i < fileContent.length; i++) {
      if (fileContent[i] === "(") count++;
      else if (fileContent[i] === ")") count--;

      if (count === 0) {
        endParen = i;
        break;
      }
    }

    if (endParen !== -1) {
      const argsStr = fileContent.substring(startParen + 1, endParen);
      calls.push(argsStr);
      index = endParen + 1;
    } else {
      index = pos + 24;
    }
  }
  return calls;
}

function parseAuthorizeArgs(argsStr) {
  const results = [];
  const cleanStr = argsStr.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");

  const simpleMatch = cleanStr.match(/^\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/);
  if (simpleMatch) {
    results.push({ resource: simpleMatch[1], action: simpleMatch[2] });
    return results;
  }

  const objRegex = /\{([^}]+)\}/g;
  let match;
  while ((match = objRegex.exec(cleanStr)) !== null) {
    const objContent = match[1];
    const resourceMatch = objContent.match(/resource\s*:\s*["']([^"']+)["']/);
    const actionMatch = objContent.match(/action\s*:\s*["']([^"']+)["']/);
    if (resourceMatch && actionMatch) {
      results.push({ resource: resourceMatch[1], action: actionMatch[1] });
    }
  }

  return results;
}

async function run() {
  console.log("🔍 Scanning backend modules for routes...");
  const modulesDir = path.join(__dirname, "../modules");
  const routeFiles = findRouteFiles(modulesDir);
  console.log(`Found ${routeFiles.length} route files.`);

  const routePermissions = [];
  const seenPairs = new Set();

  for (const file of routeFiles) {
    const content = fs.readFileSync(file, "utf8");
    const calls = extractAuthorizeCalls(content);
    for (const call of calls) {
      const parsed = parseAuthorizeArgs(call);
      for (const item of parsed) {
        const key = `${item.resource}:${item.action}`;
        if (!seenPairs.has(key)) {
          seenPairs.add(key);
          routePermissions.push(item);
        }
      }
    }
  }

  console.log("\n📋 Collected unique resource:action pairs from routes:");
  console.log(routePermissions);

  // Fetch existing permissions from the database
  const dbPermissions = await prisma.tblPermissions.findMany();
  const existingPermissionTitles = new Set(
    dbPermissions.map((p) => p.permissionTitle.toLowerCase())
  );

  console.log(`\nFound ${dbPermissions.length} existing permissions in the database.`);

  // We want to verify if the corresponding database permission exists for each pair.
  // By standard convention:
  // - A general tenant-level resource wildcard or specific permission.
  // Let's generate candidate permission titles. For resource 'X' and action 'Y':
  // candidate 1: tenant:X:Y (e.g. tenant:widget:create)
  // candidate 2: tenant:X (if wildcard/broader mapping is used)
  // Let's map any missing specific permissions: "tenant:resource:action" (e.g. "tenant:widget:create").
  // Special casing: resource 'tenant' maps to "tenant:read", "tenant:update", "tenant:delete" directly.
  
  const missingPermissions = [];
  for (const { resource, action } of routePermissions) {
    let specificTitle = `tenant:${resource.toLowerCase()}:${action.toLowerCase()}`;
    if (resource === "tenant") {
      specificTitle = `tenant:${action.toLowerCase()}`;
    }

    if (!existingPermissionTitles.has(specificTitle)) {
      missingPermissions.push({
        permissionTitle: specificTitle,
        permissionDescription: `Permission to perform '${action}' on '${resource}'`,
      });
    }
  }

  if (missingPermissions.length === 0) {
    console.log("\n✅ No missing permissions detected in the database.");
    return;
  }

  console.log(`\n⚠️ Found ${missingPermissions.length} missing permissions to seed:`);
  console.log(missingPermissions);

  // Start Transaction to Seed Missing Permissions and Map to ADMIN
  await prisma.$transaction(async (tx) => {
    // 1. Seed missing permissions
    await tx.tblPermissions.createMany({
      data: missingPermissions,
      skipDuplicates: true,
    });
    console.log("Inserted missing permissions.");

    // Fetch all permissions to get IDs for mapping
    const allPermissions = await tx.tblPermissions.findMany();
    const permissionTitleToId = {};
    allPermissions.forEach((p) => {
      permissionTitleToId[p.permissionTitle.toLowerCase()] = p.permissionID;
    });

    // 2. Fetch the ADMIN role
    const adminRole = await tx.tblRoles.findFirst({
      where: { roleTitle: "ADMIN" },
    });

    if (!adminRole) {
      console.warn("⚠️ ADMIN role not found. Skipping mapping to ADMIN role.");
      return;
    }

    // 3. Prepare role-permission mapping for missing permissions to ADMIN
    const rolePermissionData = missingPermissions.map((p) => ({
      roleID: adminRole.roleID,
      permissionID: permissionTitleToId[p.permissionTitle],
    }));

    await tx.tblRolePermissionMappings.createMany({
      data: rolePermissionData,
      skipDuplicates: true,
    });
    console.log(`Mapped ${rolePermissionData.length} new permissions to the 'ADMIN' role.`);
  });

  console.log("\n🎉 Seeding completed successfully!");
}

run()
  .catch((err) => {
    console.error("Error running script:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
