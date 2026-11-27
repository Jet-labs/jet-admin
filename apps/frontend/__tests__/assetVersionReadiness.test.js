import {
  findDeployedVersion,
  resolvePageVersionReadiness,
} from "../src/logic/assetVersion/versionReadiness";

const latest = {
  assetVersionID: "version-3",
  versionNumber: 3,
  contentHash: "hash-3",
};
const older = {
  assetVersionID: "version-2",
  versionNumber: 2,
  contentHash: "hash-2",
};

describe("Application page version readiness", () => {
  it("marks an unversioned page as not versioned", () => {
    expect(resolvePageVersionReadiness({ latest: null })).toMatchObject({
      label: "Not versioned",
    });
  });

  it("distinguishes legacy releases from pages new to a versioned release", () => {
    expect(
      resolvePageVersionReadiness({ latest, pageVersionCount: 0 })
    ).toMatchObject({ label: "Legacy release" });
    expect(
      resolvePageVersionReadiness({ latest, pageVersionCount: 1 })
    ).toMatchObject({ label: "New on publish" });
  });

  it("reports current and upgrade states from exact version IDs", () => {
    expect(
      resolvePageVersionReadiness({
        latest,
        deployedPageVersionID: "version-3",
        pageVersionCount: 1,
      })
    ).toMatchObject({ label: "Up to date" });
    expect(
      resolvePageVersionReadiness({
        latest,
        deployedPageVersionID: "version-2",
        pageVersionCount: 1,
      })
    ).toMatchObject({ label: "Upgrade on publish" });
  });

  it("reports selected page versions independently of the latest version", () => {
    expect(
      resolvePageVersionReadiness({
        latest,
        pinnedPageVersionID: "version-2",
        pinnedVersion: older,
        deployedPageVersionID: "version-2",
        pageVersionCount: 1,
      })
    ).toMatchObject({ label: "Pinned · up to date" });
    expect(
      resolvePageVersionReadiness({
        latest,
        pinnedPageVersionID: "version-2",
        pinnedVersion: older,
        deployedPageVersionID: "version-3",
        pageVersionCount: 1,
      })
    ).toMatchObject({ label: "Pinned · deploy pending" });
    expect(
      resolvePageVersionReadiness({
        latest,
        pinnedPageVersionID: "missing",
        pinnedVersion: null,
        deployedPageVersionID: "version-3",
        pageVersionCount: 1,
      })
    ).toMatchObject({ label: "Pinned version unavailable" });
  });

  it("finds the deployed version in recent history by exact ID", () => {
    expect(findDeployedVersion([latest, older], "version-2")).toBe(older);
    expect(findDeployedVersion([latest], "missing")).toBeNull();
    expect(findDeployedVersion([latest], undefined)).toBeNull();
  });
});
