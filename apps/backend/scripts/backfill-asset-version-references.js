// Rebuilds dependency edges for versions and releases created before reference
// tracking existed. Dry-run by default; pass --apply to insert missing edges.
// This script never deletes versions or releases.
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { prisma } = require("../config/prisma.config");
const { payloadChildVersionIDs } = require("../modules/assetVersion/assetVersion.references");

const APPLY = process.argv.includes("--apply");
const PAGE_SIZE = 250;

async function existingByID(ids) {
  const unique = [...new Set(ids)].filter(Boolean);
  const rows = unique.length
    ? await prisma.tblAssetVersions.findMany({
        where: { assetVersionID: { in: unique } },
        select: { assetVersionID: true, tenantID: true },
      })
    : [];
  return new Map(rows.map((row) => [row.assetVersionID, row.tenantID]));
}

async function main() {
  let skip = 0;
  let versionEdges = 0;
  let releaseEdges = 0;
  let versionsScanned = 0;
  let releasesScanned = 0;

  for (;;) {
    const versions = await prisma.tblAssetVersions.findMany({
      orderBy: { assetVersionID: "asc" },
      skip,
      take: PAGE_SIZE,
      select: {
        assetVersionID: true,
        tenantID: true,
        assetType: true,
        payload: true,
      },
    });
    if (!versions.length) break;
    versionsScanned += versions.length;

    const candidates = [];
    for (const version of versions) {
      for (const childVersionID of payloadChildVersionIDs(
        version.assetType,
        version.payload
      )) {
        if (childVersionID !== version.assetVersionID) {
          candidates.push({
            tenantID: version.tenantID,
            parentVersionID: version.assetVersionID,
            childVersionID,
          });
        }
      }
    }
    const tenants = await existingByID(candidates.map((edge) => edge.childVersionID));
    const edges = candidates.filter(
      (edge) => tenants.get(edge.childVersionID) === edge.tenantID
    );
    versionEdges += edges.length;
    if (APPLY && edges.length) {
      await prisma.tblAssetVersionReferences.createMany({
        data: edges.map((edge) => ({
          tenantID: edge.tenantID,
          parentType: "assetVersion",
          parentVersionID: edge.parentVersionID,
          parentReleaseID: null,
          childVersionID: edge.childVersionID,
          referenceKey: `${edge.parentVersionID}:${edge.childVersionID}`,
        })),
        skipDuplicates: true,
      });
    }
    if (versions.length < PAGE_SIZE) break;
    skip += versions.length;
  }

  skip = 0;
  for (;;) {
    const releases = await prisma.tblApplicationReleases.findMany({
      orderBy: { releaseID: "asc" },
      skip,
      take: PAGE_SIZE,
      select: {
        releaseID: true,
        tenantID: true,
        serverManifest: true,
        clientManifest: true,
      },
    });
    if (!releases.length) break;
    releasesScanned += releases.length;

    const candidates = [];
    for (const release of releases) {
      const pageVersions =
        release.serverManifest?.pageVersions ||
        release.clientManifest?.pageVersions ||
        {};
      for (const childVersionID of new Set(Object.values(pageVersions))) {
        if (childVersionID) {
          candidates.push({
            tenantID: release.tenantID,
            parentReleaseID: release.releaseID,
            childVersionID,
          });
        }
      }
    }
    const tenants = await existingByID(candidates.map((edge) => edge.childVersionID));
    const edges = candidates.filter(
      (edge) => tenants.get(edge.childVersionID) === edge.tenantID
    );
    releaseEdges += edges.length;
    if (APPLY && edges.length) {
      await prisma.tblAssetVersionReferences.createMany({
        data: edges.map((edge) => ({
          tenantID: edge.tenantID,
          parentType: "applicationRelease",
          parentVersionID: null,
          parentReleaseID: edge.parentReleaseID,
          childVersionID: edge.childVersionID,
          referenceKey: `release:${edge.parentReleaseID}:${edge.childVersionID}`,
        })),
        skipDuplicates: true,
      });
    }
    if (releases.length < PAGE_SIZE) break;
    skip += releases.length;
  }

  const [referenced, total] = await Promise.all([
    prisma.tblAssetVersionReferences
      .findMany({ select: { childVersionID: true }, distinct: ["childVersionID"] })
      .then((rows) => rows.length),
    prisma.tblAssetVersions.count(),
  ]);

  console.log(`${APPLY ? "Backfilled" : "Found"} ${versionEdges} version edges and ${releaseEdges} release edges.`);
  console.log(`Scanned ${versionsScanned} versions and ${releasesScanned} releases.`);
  console.log(
    `${referenced} of ${total} immutable versions have incoming references; unreferenced versions are retained.`
  );
  if (!APPLY) console.log("Dry run. Re-run with --apply to insert missing reference edges.");
}

main()
  .catch((error) => {
    console.error("Asset version backfill failed:", error.code || "UNKNOWN", error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
