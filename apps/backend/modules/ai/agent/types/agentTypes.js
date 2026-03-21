/**
 * @typedef {Object} DatasourceManifest
 * @property {string} name - Human readable name
 * @property {string} description - LLM-readable description of what data this source contains
 * @property {string[]} capabilities - ['read', 'write', 'aggregate', 'filter']
 * @property {string} queryInstructions - How to write queries for this datasource type
 * @property {Object[]} exampleQueries - Few-shot examples for the LLM
 * @property {Object} semanticHints - Field-level semantic explanations (e.g., amount is in paise)
 * @property {string} queryShape - The shape of dataQueryOptions this datasource expects
 */

/**
 * @typedef {Object} ConceptualizedQuery
 * @property {string} id - Temp UUID for this query
 * @property {string} title - Human readable title
 * @property {string} datasourceID - The actual datasourceID from tblDatasources
 * @property {string} datasourceType - e.g., 'postgresql', 'restapi'
 * @property {Object} dataQueryOptions - Ready to pass to runDataQueryByData
 * @property {string} humanReadableDescription - Plain English explanation of what this query does
 * @property {string[]} argKeys - Parameterizable fields detected by the agent
 */

/**
 * @typedef {Object} AgentSession
 * @property {string} chatRoomID
 * @property {string} tenantID
 * @property {string} userID
 * @property {string} originalQuery - The user's original natural language question
 * @property {Object[]} geminiMessageHistory - Full message history for Gemini multi-turn
 * @property {'idle'|'discovering'|'awaiting_ds_approval'|'conceptualizing'|'awaiting_query_approval'|'executing'|'responding'|'done'} state
 * @property {string[]} approvedDatasourceIDs
 * @property {Object} datasourceManifests - { datasourceID: DatasourceManifest }
 * @property {ConceptualizedQuery[]} conceptualizedQueries
 * @property {Object} queryResults - { queryId: resultData }
 * @property {string} selectedVizType - 'bar'|'line'|'table'|'kpi'|'pie'
 * @property {Object} widgetConfig - Final viz config if promoted
 */

module.exports = {};
