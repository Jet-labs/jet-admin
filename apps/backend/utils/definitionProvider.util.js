/**
 * Definition Provider Utility
 *
 * Derives input definitions for any executable entity type.
 * Definitions describe what inputs are required to execute a unit.
 *
 * Definition sources:
 *   Workflow  → workflowOptions.args (native)
 *   Query     → dataQueryOptions.args (native)
 *   Node      → linked query's dataQueryOptions.args (derived)
 *   Widget    → linked workflow's workflowOptions.args (derived)
 *   Cron      → linked workflow's workflowOptions.args (derived)
 *
 * Usage patterns:
 *   1. Pass definitions directly when the parent entity is already loaded
 *   2. Use getInputDefinitions(type, id) for Prisma lookup when only an ID is available
 */

const { prisma } = require('../config/prisma.config');
const Logger = require('./logger');

/**
 * Normalise a raw arg-schema array into a canonical InputDefinition[].
 *
 * Canonical shape:
 *   { key, type, required, default, supportsTemplate, definitionSource }
 *
 * @param {Array<{ key: string, type?: string, required?: boolean, default?: * }>} rawArgs
 * @param {{ definitionSource?: string, supportsTemplate?: boolean }} [options]
 * @returns {Array<object>}
 */
function normalizeDefinitions(rawArgs, options = {}) {
  if (!Array.isArray(rawArgs)) return [];

  const {
    definitionSource = 'native',
    supportsTemplate = false,
  } = options;

  return rawArgs
    .filter((arg) => arg && arg.key)
    .map((arg) => ({
      key: arg.key,
      type: arg.type || 'string',
      required: arg.required === true,
      default: arg.default !== undefined ? arg.default : undefined,
      supportsTemplate,
      definitionSource,
    }));
}

/**
 * Extract definitions from an already-loaded workflow entity.
 *
 * @param {object} workflow  Prisma tblWorkflows row
 * @returns {Array<object>}  Normalised InputDefinition[]
 */
function extractWorkflowDefinitions(workflow) {
  if (!workflow || !workflow.workflowOptions) return [];
  return normalizeDefinitions(
    workflow.workflowOptions.args,
    { definitionSource: 'native', supportsTemplate: false }
  );
}

/**
 * Extract definitions from an already-loaded data query entity.
 *
 * @param {object} dataQuery  Prisma tblDataQueries row
 * @returns {Array<object>}   Normalised InputDefinition[]
 */
function extractQueryDefinitions(dataQuery) {
  if (!dataQuery || !dataQuery.dataQueryOptions) return [];
  return normalizeDefinitions(
    dataQuery.dataQueryOptions.args,
    { definitionSource: 'native', supportsTemplate: true }
  );
}

/**
 * Fetch input definitions by executable type and ID.
 *
 * This is the Prisma-backed fallback used ONLY when the caller
 * does not already have the parent entity loaded.
 *
 * @param {'workflow'|'query'|'node'|'widget'|'cron'} type
 * @param {string|number} id  Entity primary key
 * @returns {Promise<Array<object>>}  Normalised InputDefinition[]
 */
async function getInputDefinitions(type, id) {
  Logger.log('info', {
    message: 'definitionProvider:getInputDefinitions',
    params: { type, id },
  });

  switch (type) {
    case 'workflow': {
      const workflow = await prisma.tblWorkflows.findUnique({ where: { workflowID: id } });
      return extractWorkflowDefinitions(workflow);
    }

    case 'query': {
      const query = await prisma.tblDataQueries.findFirst({ where: { dataQueryID: id } });
      return extractQueryDefinitions(query);
    }

    case 'node': {
      // Node → linked query's definitions (derived)
      // id here is the dataQueryID stored in nodeConfig
      const query = await prisma.tblDataQueries.findFirst({ where: { dataQueryID: id } });
      const defs = extractQueryDefinitions(query);
      return defs.map((d) => ({ ...d, definitionSource: 'derived' }));
    }

    case 'widget': {
      // Widget → linked workflow's definitions (derived)
      const widget = await prisma.tblWidgets.findFirst({
        where: { widgetID: id },
        include: { tblWorkflows: true },
      });
      if (!widget?.tblWorkflows) return [];
      const defs = extractWorkflowDefinitions(widget.tblWorkflows);
      return defs.map((d) => ({ ...d, definitionSource: 'derived' }));
    }

    case 'cron': {
      // Cron → linked workflow's definitions (derived)
      const cronJob = await prisma.tblCronJobs.findFirst({
        where: { cronJobID: id },
        include: { tblWorkflows: true },
      });
      if (!cronJob?.tblWorkflows) return [];
      const defs = extractWorkflowDefinitions(cronJob.tblWorkflows);
      return defs.map((d) => ({ ...d, definitionSource: 'derived' }));
    }

    default:
      Logger.log('warning', {
        message: 'definitionProvider:unknownType',
        params: { type, id },
      });
      return [];
  }
}

module.exports = {
  getInputDefinitions,
  extractWorkflowDefinitions,
  extractQueryDefinitions,
  normalizeDefinitions,
};
