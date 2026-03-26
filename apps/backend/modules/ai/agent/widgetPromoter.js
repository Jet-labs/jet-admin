/**
 * WidgetPromoter
 * Converts an ephemeral agent session into a permanent, refreshable widget.
 * 
 * Flow:
 * 1. Save ephemeral queries as permanent DataQueries
 * 2. Create a Workflow chaining those queries
 * 3. Create a Widget pointing at the Workflow
 * 
 * The result is indistinguishable from a hand-built widget.
 */

const Logger = require('../../../utils/logger');
const { agentSession } = require('./agentSession');
const { dataQueryService } = require('../../dataQuery/dataQuery.service');
const { workflowService } = require('../../workflow/workflow.service');
const { widgetService } = require('../../widget/widget.service');
const { v4: uuid } = require('uuid');

const widgetPromoter = {

  async promote({ chatRoomID, tenantID, userID, widgetTitle, dashboardID }) {
    const session = agentSession.get(chatRoomID);
    if (!session) throw new Error('Session not found');

    Logger.log('info', {
      message: 'widgetPromoter:promote:start',
      params: { chatRoomID, widgetTitle, queryCount: session.conceptualizedQueries.length },
    });

    // Step 1: Save ephemeral queries as permanent DataQueries
    const savedQueries = await this._saveQueries({ session, tenantID, userID });

    // Step 2: Build and save the Workflow
    const workflow = await this._createWorkflow({
      session,
      savedQueries,
      tenantID,
      userID,
      widgetTitle,
    });

    // Step 3: Build widget config from session viz state
    const widgetConfig = this._buildWidgetConfig({ session });

    // Step 4: Create the Widget
    const widget = await widgetService.createWidget({
      authContext: { authType: 'USER', user: { userID }, apiKey: null },
      tenantID,
      widgetTitle,
      widgetDescription: `AI-generated: ${session.originalQuery}`,
      widgetType: session.selectedVizType || 'table',
      widgetConfig,
      workflowID: workflow.workflowID,
      workflowConfig: {
        inputArgs: {},
        title: widgetTitle,
      },
    });

    // Mark session as promoted
    agentSession.update(chatRoomID, { promotedWidgetID: widget.widgetID });

    Logger.log('success', {
      message: 'widgetPromoter:promote:success',
      params: { chatRoomID, widgetID: widget.widgetID, workflowID: workflow.workflowID },
    });

    return {
      widgetID: widget.widgetID,
      workflowID: workflow.workflowID,
      savedQueryIDs: savedQueries.map(q => q.dataQueryID),
    };
  },

  async _saveQueries({ session, tenantID, userID }) {
    const savedQueries = [];

    for (const query of session.conceptualizedQueries) {
      await dataQueryService.createDataQuery({
        userID,
        tenantID,
        dataQueryTitle: query.title,
        dataQueryOptions: query.dataQueryOptions,
        datasourceID: query.datasourceID,
        datasourceType: query.datasourceType,
        runOnLoad: true,
        authContext: { authType: 'USER', user: { userID }, apiKey: null },
      });

      // createDataQuery returns true, so we need to fetch the created record
      // Get the most recently created query matching title
      const allQueries = await dataQueryService.getAllDataQueries({ userID, tenantID });
      const justCreated = allQueries.find(q => q.dataQueryTitle === query.title);
      if (justCreated) savedQueries.push(justCreated);
    }

    return savedQueries;
  },

  _buildWorkflowNodes(savedQueries) {
    const startNodeID = uuid();
    const endNodeID = uuid();
    const nodes = [
      {
        id: startNodeID,
        type: 'start',
        position: { x: 0, y: 100 },
        data: {},
      },
      ...savedQueries.map((q, index) => ({
        id: q.dataQueryID,
        type: 'dataQuery',
        position: { x: 250 + (index * 200), y: 100 },
        data: {
          dataQueryID: q.dataQueryID,
          outputVariable: `result_${index}`,
          title: q.dataQueryTitle,
        },
      })),
      {
        id: endNodeID,
        type: 'end',
        position: { x: 250 + (savedQueries.length * 200), y: 100 },
        data: {
          outputParameters: savedQueries.map((q, index) => ({
            name: `result_${index}`,
            sourceVariable: `{{ctx.result_${index}}}`,
          }))
        },
      }
    ];

    const edges = [
      // start → first query
      {
        id: uuid(),
        source: startNodeID,
        target: savedQueries[0]?.dataQueryID || endNodeID,
        sourceHandle: 'output',
      },
      // query → query → ... → end
      ...savedQueries.map((q, index) => ({
        id: uuid(),
        source: q.dataQueryID,
        target: savedQueries[index + 1]?.dataQueryID || endNodeID,
        sourceHandle: 'success',
      })),
    ];

    return { nodes, edges, startNodeID, endNodeID };
  },

  async _createWorkflow({ session, savedQueries, tenantID, userID, widgetTitle }) {
    const { nodes, edges } = this._buildWorkflowNodes(savedQueries);

    const workflow = await workflowService.createWorkflow({
      userID,
      tenantID,
      title: `AI: ${widgetTitle}`,
      nodes,
      edges,
      workflowOptions: {
        args: [],
        description: `Auto-generated by AI agent for: ${session.originalQuery}`,
        aiGenerated: true,
      },
      authContext: { authType: 'USER', user: { userID }, apiKey: null },
    });

    return workflow;
  },

  _buildWidgetConfig({ session }) {
    const { selectedVizType, vizConfig, queryResults } = session;

    // Build a generic widget config based on viz type
    return {
      vizType: selectedVizType,
      xAxisKey: vizConfig?.xAxisKey,
      yAxisKeys: vizConfig?.yAxisKeys || [],
      kpiMetrics: vizConfig?.kpiMetrics || [],
      // Template refs to workflow context
      dataSource: Object.keys(queryResults || {}).map((qId, index) => ({
        contextKey: `result_${index}`,
        queryId: qId,
      })),
      aiGenerated: true,
      originalQuery: session.originalQuery,
    };
  },
};

module.exports = { widgetPromoter };
