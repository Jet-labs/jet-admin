/**
 * Tenant reference validation used by workflow/app-page/listener/cron saves.
 */

const mockFindMany = jest.fn();

jest.mock("../../../config/prisma.config", () => ({
  prisma: {
    tblDataQueries: { findMany: (...args) => mockFindMany("tblDataQueries", ...args) },
    tblWorkflows: { findMany: (...args) => mockFindMany("tblWorkflows", ...args) },
    tblListeners: { findMany: (...args) => mockFindMany("tblListeners", ...args) },
    tblAppPages: { findMany: (...args) => mockFindMany("tblAppPages", ...args) },
    tblDatasources: { findMany: (...args) => mockFindMany("tblDatasources", ...args) },
  },
}));

const { assertTenantReferences } = require("../../../utils/tenantReference.util");

const TENANT = "11111111-1111-4111-8111-111111111111";
const QUERY = "22222222-2222-4222-8222-222222222222";
const WORKFLOW = "33333333-3333-4333-8333-333333333333";

describe("assertTenantReferences", () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  it("accepts references that exist in the tenant", async () => {
    mockFindMany.mockImplementation((model, { where }) => {
      if (model === "tblDataQueries") return Promise.resolve([{ dataQueryID: QUERY }]);
      if (model === "tblWorkflows") return Promise.resolve([{ workflowID: WORKFLOW }]);
      return Promise.resolve([]);
    });

    await expect(
      assertTenantReferences({ tenantID: TENANT, dataQueryIDs: [QUERY], workflowIDs: [WORKFLOW] })
    ).resolves.toBeUndefined();

    expect(mockFindMany).toHaveBeenCalledWith(
      "tblDataQueries",
      expect.objectContaining({ where: { tenantID: TENANT, dataQueryID: { in: [QUERY] } } })
    );
  });

  it("rejects a reference that belongs to another tenant", async () => {
    mockFindMany.mockResolvedValue([]);

    await expect(
      assertTenantReferences({ tenantID: TENANT, dataQueryIDs: [QUERY] })
    ).rejects.toMatchObject({
      code: "INVALID_TENANT_REFERENCE",
      statusCode: 400,
      details: {
        missing: [{ type: "dataQueryID", id: QUERY, reason: "not found in tenant" }],
      },
    });
  });

  it("rejects malformed IDs before querying the database", async () => {
    await expect(
      assertTenantReferences({ tenantID: TENANT, dataQueryIDs: ["not-a-uuid"] })
    ).rejects.toMatchObject({
      code: "INVALID_TENANT_REFERENCE",
      details: {
        missing: [{ type: "dataQueryID", id: "not-a-uuid", reason: "not a valid UUID" }],
      },
    });

    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("deduplicates repeated references", async () => {
    mockFindMany.mockResolvedValue([{ dataQueryID: QUERY }]);

    await assertTenantReferences({
      tenantID: TENANT,
      dataQueryIDs: [QUERY, QUERY, QUERY],
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      "tblDataQueries",
      expect.objectContaining({ where: { tenantID: TENANT, dataQueryID: { in: [QUERY] } } })
    );
  });
});
