const { appPageMiddleware } = require("../../../modules/appPage/appPage.middleware");
const { workflowMiddleware } = require("../../../modules/workflow/workflow.middleware");
const { cronJobMiddleware } = require("../../../modules/cronJob/cronJob.middleware");
const { dataQueryMiddleware } = require("../../../modules/dataQuery/dataQuery.middleware");
const { listenerMiddleware } = require("../../../modules/listener/listener.middleware");

// Mock prisma and logger
jest.mock("../../../config/prisma.config", () => ({
  prisma: {
    tblAppPages: {
      findUnique: jest.fn(),
    },
    tblWorkflows: {
      findUnique: jest.fn(),
    },
    tblCronJobs: {
      findUnique: jest.fn(),
    },
    tblDataQueries: {
      findUnique: jest.fn(),
    },
    tblListeners: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("../../../utils/logger", () => ({
  log: jest.fn(),
}));

const { prisma } = require("../../../config/prisma.config");

describe("Security and Asset Extraction Middlewares", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("appPageMiddleware.extractAppPageConfigAssetIDs", () => {
    it("should extract query, workflow, listener, and widget IDs from appPageConfig", () => {
      req.body = {
        appPageConfig: {
          dataSources: [
            { type: "query", queryID: "q-1" },
            { type: "workflow", workflowID: "wf-1" },
            { type: "listener", listenerID: "l-1" },
            { type: "other", queryID: "ignored" },
          ],
          widgets: [
            "widget_w-1_1718300000000",
            "widget_w-2_1718300000000",
            "invalid_widget_key",
          ],
        },
      };

      appPageMiddleware.extractAppPageConfigAssetIDs(req, res, next);

      expect(req.dataQueryIDs).toEqual(["q-1"]);
      expect(req.workflowIDs).toEqual(["wf-1"]);
      expect(req.listenerIDs).toEqual(["l-1"]);
      expect(req.widgetIDs).toEqual(["w-1", "w-2"]);
      expect(next).toHaveBeenCalled();
    });

    it("should handle empty or missing appPageConfig", () => {
      appPageMiddleware.extractAppPageConfigAssetIDs(req, res, next);
      expect(req.dataQueryIDs).toBeUndefined();
      expect(req.workflowIDs).toBeUndefined();
      expect(req.listenerIDs).toBeUndefined();
      expect(req.widgetIDs).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("appPageMiddleware.resolveAppPageCloneAssetIDsFromDB", () => {
    it("should fetch page configuration from DB and extract dependent asset IDs", async () => {
      req.params = { appPageID: "page-123" };
      prisma.tblAppPages.findUnique.mockResolvedValue({
        appPageConfig: {
          dataSources: [
            { type: "query", queryID: "q-db" },
            { type: "workflow", workflowID: "wf-db" },
          ],
          widgets: ["widget_w-db_1718300000000"],
        },
      });

      await appPageMiddleware.resolveAppPageCloneAssetIDsFromDB(req, res, next);

      expect(prisma.tblAppPages.findUnique).toHaveBeenCalledWith({
        where: { appPageID: "page-123" },
        select: { appPageConfig: true },
      });
      expect(req.dataQueryIDs).toEqual(["q-db"]);
      expect(req.workflowIDs).toEqual(["wf-db"]);
      expect(req.widgetIDs).toEqual(["w-db"]);
      expect(next).toHaveBeenCalled();
    });

    it("should skip and call next if appPageID is missing", async () => {
      await appPageMiddleware.resolveAppPageCloneAssetIDsFromDB(req, res, next);
      expect(prisma.tblAppPages.findUnique).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("workflowMiddleware.resolveWorkflowDataQueryIDsFromDB", () => {
    it("should resolve workflow queries from workflow nodes in database", async () => {
      req.params = { workflowID: "wf-123" };
      prisma.tblWorkflows.findUnique.mockResolvedValue({
        tblWorkflowNodes: [
          { nodeType: "dataQuery", nodeConfig: { dataQueryID: "q-wf-1" } },
          { nodeType: "dataQuery", nodeConfig: { dataQueryID: "q-wf-2" } },
          { nodeType: "otherNode", nodeConfig: {} },
        ],
      });

      await workflowMiddleware.resolveWorkflowDataQueryIDsFromDB(req, res, next);

      expect(prisma.tblWorkflows.findUnique).toHaveBeenCalledWith({
        where: { workflowID: "wf-123" },
        include: { tblWorkflowNodes: true },
      });
      expect(req.dataQueryIDs).toEqual(["q-wf-1", "q-wf-2"]);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("cronJobMiddleware.resolveWorkflowIDFromDB", () => {
    it("should resolve workflowID from the cron job in database", async () => {
      req.params = { cronJobID: "cron-123" };
      prisma.tblCronJobs.findUnique.mockResolvedValue({
        workflowID: "wf-cron",
      });

      await cronJobMiddleware.resolveWorkflowIDFromDB(req, res, next);

      expect(prisma.tblCronJobs.findUnique).toHaveBeenCalledWith({
        where: { cronJobID: "cron-123" },
        select: { workflowID: true },
      });
      expect(req.workflowID).toBe("wf-cron");
      expect(next).toHaveBeenCalled();
    });
  });

  describe("dataQueryMiddleware.resolveDatasourceIDFromDB", () => {
    it("should resolve datasourceID from the dataQuery in database", async () => {
      req.params = { dataQueryID: "q-123" };
      prisma.tblDataQueries.findUnique.mockResolvedValue({
        datasourceID: "ds-q",
      });

      await dataQueryMiddleware.resolveDatasourceIDFromDB(req, res, next);

      expect(prisma.tblDataQueries.findUnique).toHaveBeenCalledWith({
        where: { dataQueryID: "q-123" },
        select: { datasourceID: true },
      });
      expect(req.datasourceID).toBe("ds-q");
      expect(next).toHaveBeenCalled();
    });
  });

  describe("listenerMiddleware.extractListenerPipelinePermissions", () => {
    it("should extract workflows and queries from actions", () => {
      req.body = {
        actions: [
          { actionType: "trigger_workflow", actionConfig: { workflowID: "wf-lst" } },
          { actionType: "trigger_query", actionConfig: { dataQueryID: "q-lst" } }
        ]
      };

      listenerMiddleware.extractListenerPipelinePermissions(req, res, next);

      expect(req.workflowIDs).toEqual(["wf-lst"]);
      expect(req.dataQueryIDs).toEqual(["q-lst"]);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("listenerMiddleware.resolveListenerClonePermissionsFromDB", () => {
    it("should resolve datasource, workflows, and queries from existing listener", async () => {
      req.params = { listenerID: "lst-123" };
      prisma.tblListeners.findUnique.mockResolvedValue({
        datasourceID: "ds-lst",
        tblListenerActions: [
          { actionType: "trigger_workflow", actionConfig: { workflowID: "wf-db-lst" } }
        ]
      });

      await listenerMiddleware.resolveListenerClonePermissionsFromDB(req, res, next);

      expect(prisma.tblListeners.findUnique).toHaveBeenCalledWith({
        where: { listenerID: "lst-123" },
        include: { tblListenerActions: true }
      });
      expect(req.datasourceID).toBe("ds-lst");
      expect(req.workflowIDs).toEqual(["wf-db-lst"]);
      expect(next).toHaveBeenCalled();
    });
  });
});

