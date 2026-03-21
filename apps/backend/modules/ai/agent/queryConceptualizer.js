/**
 * QueryConceptualizer
 * Executes ephemeral queries drafted by the agent.
 * Uses the existing runDataQueryByData() — no new infrastructure needed.
 */

const Logger = require('../../../utils/logger');
const { dataQueryService } = require('../../dataQuery/dataQuery.service');
const { agentSession } = require('./agentSession');

const queryConceptualizer = {

  /**
   * Execute all approved queries for a session.
   * Uses the existing runDataQueryByData pattern — queries are ephemeral,
   * never persisted to tblDataQueries.
   */
  async executeAllQueries({ chatRoomID, tenantID, userID }) {
    const session = agentSession.get(chatRoomID);
    if (!session) return;

    const { conceptualizedQueries } = session;
    const results = {};

    Logger.log('info', {
      message: 'queryConceptualizer:executeAllQueries:start',
      params: { chatRoomID, queryCount: conceptualizedQueries.length },
    });

    for (const query of conceptualizedQueries) {
      const startTime = Date.now();
      try {
        Logger.log('info', {
          message: 'queryConceptualizer:executeQuery',
          params: { chatRoomID, queryId: query.id, queryTitle: query.title },
        });

        // Reuse existing runDataQueryByData
        // It creates a temp UUID internally, runs through QueryEngine, returns data
        // No DB write happens for the query itself
        const data = await dataQueryService.runDataQueryByData({
          userID,
          tenantID,
          dataQuery: {
            datasourceID: query.datasourceID,
            datasourceType: query.datasourceType,
            dataQueryOptions: query.dataQueryOptions,
          },
          argValues: query.resolvedArgValues || {},
        });

        const executionMs = Date.now() - startTime;

        results[query.id] = {
          success: true,
          data: Array.isArray(data) ? data : [data],
          rowCount: Array.isArray(data) ? data.length : 1,
          executionMs,
          queryTitle: query.title,
          datasourceID: query.datasourceID,
        };

        Logger.log('success', {
          message: 'queryConceptualizer:executeQuery:success',
          params: {
            chatRoomID,
            queryId: query.id,
            rowCount: results[query.id].rowCount,
            executionMs,
          },
        });

      } catch (error) {
        Logger.log('error', {
          message: 'queryConceptualizer:executeQuery:error',
          params: { chatRoomID, queryId: query.id, error: error.message },
        });

        results[query.id] = {
          success: false,
          error: error.message,
          data: [],
          rowCount: 0,
          executionMs: Date.now() - startTime,
          queryTitle: query.title,
          datasourceID: query.datasourceID,
        };
      }
    }

    // Store results on session
    agentSession.update(chatRoomID, { queryResults: results });

    Logger.log('info', {
      message: 'queryConceptualizer:executeAllQueries:complete',
      params: {
        chatRoomID,
        totalQueries: conceptualizedQueries.length,
        successCount: Object.values(results).filter(r => r.success).length,
      },
    });

    return results;
  },
};

module.exports = { queryConceptualizer };
