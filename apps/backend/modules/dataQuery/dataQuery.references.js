/**
 * Data-query reference lookup.
 *
 * Queries are referenced from JSON configs (app pages, workflow nodes,
 * listener actions), so deleting one can leave background automations broken.
 * The delete path checks these references and returns 409 instead.
 */

const { prisma } = require("../../config/prisma.config");

async function findDataQueryReferences({ tenantID, dataQueryID }) {
  const [appPages, widgets, workflowNodes, listenerActions] = await Promise.all([
    prisma.tblAppPages.findMany({
      where: { tenantID },
      select: { appPageID: true, appPageTitle: true, appPageConfig: true },
    }),
    prisma.tblWidgets.findMany({
      where: { tenantID },
      select: { widgetID: true, widgetTitle: true, widgetConfig: true },
    }),
    prisma.tblWorkflowNodes.findMany({
      where: { nodeType: "dataQuery", tblWorkflows: { tenantID } },
      select: {
        nodeID: true,
        workflowID: true,
        nodeConfig: true,
        tblWorkflows: { select: { title: true } },
      },
    }),
    prisma.tblListenerActions.findMany({
      where: { actionType: "trigger_query", tblListeners: { tenantID } },
      select: {
        actionID: true,
        listenerID: true,
        actionConfig: true,
        tblListeners: { select: { listenerTitle: true } },
      },
    }),
  ]);

  const referencingAppPages = appPages.filter((page) => {
    const sources = Array.isArray(page.appPageConfig?.dataSources)
      ? page.appPageConfig.dataSources
      : [];
    return sources.some(
      // Match by target ID regardless of whether `type` was supplied; older
      // pages may omit it, and deletion protection must still see the link.
      (source) => String(source?.queryID) === String(dataQueryID)
    );
  });

  const referencingWidgets = widgets.filter((widget) => {
    const events = widget.widgetConfig?.events;
    if (!events || typeof events !== "object") return false;
    return Object.values(events).some(
      (actions) =>
        Array.isArray(actions) &&
        actions.some(
          (action) =>
            action?.actionType === "TRIGGER_QUERY" &&
            String(action.config?.queryID) === String(dataQueryID)
        )
    );
  });

  const referencingWorkflowNodes = workflowNodes.filter(
    (node) => String(node.nodeConfig?.dataQueryID) === String(dataQueryID)
  );

  const referencingListenerActions = listenerActions.filter(
    (action) => String(action.actionConfig?.dataQueryID) === String(dataQueryID)
  );

  return {
    appPages: referencingAppPages,
    widgets: referencingWidgets,
    workflows: referencingWorkflowNodes,
    listenerActions: referencingListenerActions,
    total:
      referencingAppPages.length +
      referencingWidgets.length +
      referencingWorkflowNodes.length +
      referencingListenerActions.length,
  };
}

module.exports = { findDataQueryReferences };
