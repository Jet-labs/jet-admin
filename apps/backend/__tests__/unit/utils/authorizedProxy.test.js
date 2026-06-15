const {
  authorizedExecuteDataQuery,
  authorizedExecuteWorkflow,
} = require("../../../utils/authorizedProxy");
const { enforce } = require("../../../config/casbin.config");
const { QueryEngine } = require("../../../modules/dataQuery/queryEngine/engine");
const { startWorkflow } = require("../../../modules/workflow/workflowEngine/engine");
const { prisma } = require("../../../config/prisma.config");

// Mock dependencies
jest.mock("../../../config/casbin.config", () => ({
  enforce: jest.fn(),
}));

jest.mock("../../../modules/dataQuery/queryEngine/engine", () => {
  return {
    QueryEngine: jest.fn().mockImplementation(() => {
      return {
        executeQuery: jest.fn().mockResolvedValue({ success: true, data: [] }),
      };
    }),
  };
});

jest.mock("../../../modules/workflow/workflowEngine/engine", () => ({
  startWorkflow: jest.fn().mockResolvedValue({ instanceID: "wf-inst-123" }),
}));

jest.mock("../../../config/prisma.config", () => ({
  prisma: {
    tblDataQueries: {
      findUnique: jest.fn().mockResolvedValue({
        dataQueryID: "q-1",
        dataQueryOptions: { inputDefinitions: [] },
      }),
    },
    tblWorkflows: {
      findUnique: jest.fn().mockResolvedValue({
        workflowID: "wf-1",
        workflowOptions: { inputDefinitions: [] },
      }),
    },
  },
}));

jest.mock("../../../utils/logger", () => ({
  log: jest.fn(),
}));

describe("Authorized Execution Proxy Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authorizedExecuteDataQuery", () => {
    it("should throw error if executionCtx is missing", async () => {
      await expect(
        authorizedExecuteDataQuery({ dataQueryID: "q-1" })
      ).rejects.toThrow("executionCtx is required");
    });

    it("should bypass Casbin check for SYSTEM callers", async () => {
      const executionCtx = {
        tenantID: "1",
        caller: { type: "system", id: "system-caller" },
      };

      const res = await authorizedExecuteDataQuery({
        dataQueryID: "q-1",
        executionCtx,
      });

      expect(enforce).not.toHaveBeenCalled();
      expect(res).toEqual({ success: true, data: [] });
    });

    it("should allow execution if user has direct permission", async () => {
      const executionCtx = {
        tenantID: "1",
        caller: { type: "user", id: "usr-1" },
      };
      enforce.mockResolvedValue(true);

      const res = await authorizedExecuteDataQuery({
        dataQueryID: "q-1",
        executionCtx,
      });

      expect(enforce).toHaveBeenCalledWith("usr-1", "1", "dataquery:q-1", "execute");
      expect(res).toEqual({ success: true, data: [] });
    });

    it("should allow execution if user has delegated workflow permission", async () => {
      const executionCtx = {
        tenantID: "1",
        caller: { type: "user", id: "usr-1" },
        originatingResource: { type: "workflow", id: "wf-9" },
      };
      // Deny direct permission, but allow delegated workflow permission
      enforce
        .mockResolvedValueOnce(false) // direct check
        .mockResolvedValueOnce(true); // delegated check

      const res = await authorizedExecuteDataQuery({
        dataQueryID: "q-1",
        executionCtx,
      });

      expect(enforce).toHaveBeenNthCalledWith(1, "usr-1", "1", "dataquery:q-1", "execute");
      expect(enforce).toHaveBeenNthCalledWith(2, "usr-1", "1", "workflow:wf-9", "execute");
      expect(res).toEqual({ success: true, data: [] });
    });

    it("should allow execution if user has delegated appPage permission (checking execute)", async () => {
      const executionCtx = {
        tenantID: "1",
        caller: { type: "user", id: "usr-1" },
        originatingResource: { type: "appPage", id: "page-12" },
      };
      enforce
        .mockResolvedValueOnce(false) // direct check
        .mockResolvedValueOnce(true); // delegated check

      const res = await authorizedExecuteDataQuery({
        dataQueryID: "q-1",
        executionCtx,
      });

      expect(enforce).toHaveBeenNthCalledWith(1, "usr-1", "1", "dataquery:q-1", "execute");
      expect(enforce).toHaveBeenNthCalledWith(2, "usr-1", "1", "appPage:page-12", "execute");
      expect(res).toEqual({ success: true, data: [] });
    });

    it("should deny execution if both direct and delegated checks fail", async () => {
      const executionCtx = {
        tenantID: "1",
        caller: { type: "user", id: "usr-1" },
        originatingResource: { type: "appPage", id: "page-12" },
      };
      enforce.mockResolvedValue(false);

      await expect(
        authorizedExecuteDataQuery({ dataQueryID: "q-1", executionCtx })
      ).rejects.toThrow("Authorization denied");
    });
  });

  describe("authorizedExecuteWorkflow", () => {
    it("should throw error if executionCtx is missing", async () => {
      await expect(
        authorizedExecuteWorkflow({ workflowID: "wf-1", tenantID: "1" })
      ).rejects.toThrow("executionCtx is required");
    });

    it("should bypass Casbin check for SYSTEM callers", async () => {
      const executionCtx = {
        tenantID: "1",
        caller: { type: "system", id: "system-caller" },
      };

      const res = await authorizedExecuteWorkflow({
        workflowID: "wf-1",
        tenantID: "1",
        executionCtx,
      });

      expect(enforce).not.toHaveBeenCalled();
      expect(res).toEqual({ instanceID: "wf-inst-123" });
    });

    it("should allow execution if user has direct permission", async () => {
      const executionCtx = {
        tenantID: "1",
        caller: { type: "user", id: "usr-1" },
      };
      enforce.mockResolvedValue(true);

      const res = await authorizedExecuteWorkflow({
        workflowID: "wf-1",
        tenantID: "1",
        executionCtx,
      });

      expect(enforce).toHaveBeenCalledWith("usr-1", "1", "workflow:wf-1", "execute");
      expect(res).toEqual({ instanceID: "wf-inst-123" });
    });

    it("should allow execution if user has delegated appPage permission", async () => {
      const executionCtx = {
        tenantID: "1",
        caller: { type: "user", id: "usr-1" },
        originatingResource: { type: "appPage", id: "page-12" },
      };
      enforce
        .mockResolvedValueOnce(false) // direct check
        .mockResolvedValueOnce(true); // delegated check

      const res = await authorizedExecuteWorkflow({
        workflowID: "wf-1",
        tenantID: "1",
        executionCtx,
      });

      expect(enforce).toHaveBeenNthCalledWith(1, "usr-1", "1", "workflow:wf-1", "execute");
      expect(enforce).toHaveBeenNthCalledWith(2, "usr-1", "1", "appPage:page-12", "execute");
      expect(res).toEqual({ instanceID: "wf-inst-123" });
    });

    it("should deny execution if both direct and delegated checks fail", async () => {
      const executionCtx = {
        tenantID: "1",
        caller: { type: "user", id: "usr-1" },
        originatingResource: { type: "appPage", id: "page-12" },
      };
      enforce.mockResolvedValue(false);

      await expect(
        authorizedExecuteWorkflow({ workflowID: "wf-1", tenantID: "1", executionCtx })
      ).rejects.toThrow("Authorization denied");
    });
  });
});
