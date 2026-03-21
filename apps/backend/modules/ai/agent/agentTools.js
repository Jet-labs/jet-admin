/**
 * Gemini Function Declarations for the ReAct agent.
 * These are passed to the Gemini API as tools.
 * The model calls these instead of returning text when it needs information.
 * 
 * Gemini API format: functionDeclarations array
 * Docs: https://ai.google.dev/gemini-api/docs/function-calling
 */

const AGENT_TOOL_DECLARATIONS = [
  {
    type: "function",
    function: {
      name: "getDatasourceInfo",
      description: `Retrieve the schema, capabilities, and query instructions for a specific 
        datasource. Call this for each datasource to understand if it contains data relevant 
        to the user's question. Always call this before deciding which datasources to use.`,
      parameters: {
        type: "object",
        properties: {
          datasourceID: {
            type: "string",
            description: "The UUID of the datasource to inspect"
          }
        },
        required: ["datasourceID"]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "requestDatasourceApproval",
      description: `After inspecting all available datasources, call this to present 
        the relevant ones to the user for approval. Only include datasources that 
        actually contain data needed to answer the user's question. 
        This PAUSES the agent and waits for user confirmation.`,
      parameters: {
        type: "object",
        properties: {
          selectedDatasources: {
            type: "array",
            description: "The datasources the agent wants to access",
            items: {
              type: "object",
              properties: {
                datasourceID: { type: "string" },
                datasourceTitle: { type: "string" },
                reason: {
                  type: "string",
                  description: "One sentence explaining why this datasource is needed"
                }
              },
              required: ["datasourceID", "datasourceTitle", "reason"]
            }
          },
          planSummary: {
            type: "string",
            description: "Plain English explanation of what data will be fetched and why"
          }
        },
        required: ["selectedDatasources", "planSummary"]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "draftQuery",
      description: `Draft a query for a specific approved datasource. 
        Use the queryInstructions from getDatasourceInfo to format correctly.
        Do NOT execute the query — just draft it for user review.
        Call this once per datasource you need to query.`,
      parameters: {
        type: "object",
        properties: {
          datasourceID: {
            type: "string",
            description: "The datasourceID to query (must be in approved list)"
          },
          queryTitle: {
            type: "string",
            description: "Short human-readable title for this query"
          },
          humanReadableDescription: {
            type: "string",
            description: "Plain English: what data does this query fetch and why"
          },
          dataQueryOptions: {
            type: "object",
            description: `The complete query configuration in the format required by 
              this datasource type (from queryInstructions)`,
            additionalProperties: true
          },
          detectedParameters: {
            type: "array",
            description: "Parameters that could be made dynamic (e.g., restaurantId, dateRange)",
            items: {
              type: "object",
              properties: {
                key: { type: "string" },
                description: { type: "string" },
                exampleValue: { type: "string" }
              },
              required: ["key", "description"]
            }
          }
        },
        required: ["datasourceID", "queryTitle", "humanReadableDescription", "dataQueryOptions"]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "requestQueryApproval",
      description: `After drafting all required queries, call this to show them to the 
        user for review before execution. This PAUSES the agent.
        The user can approve all queries or reject individual ones.`,
      parameters: {
        type: "object",
        properties: {
          querySummary: {
            type: "string",
            description: "Plain English summary of all queries that will be run"
          }
        },
        required: ["querySummary"]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "selectVisualization",
      description: `After receiving query results, decide the best visualization type 
        and structure the data for rendering. Call this before synthesizeResponse.`,
      parameters: {
        type: "object",
        properties: {
          vizType: {
            type: "string",
            enum: ["bar", "line", "area", "pie", "table", "kpi", "scatter", "multi"],
            description: "The chart type that best represents this data"
          },
          reasoning: {
            type: "string",
            description: "Why this visualization type was chosen"
          },
          xAxisKey: {
            type: "string",
            description: "For charts: the data key for the X axis"
          },
          yAxisKeys: {
            type: "array",
            items: { type: "string" },
            description: "For charts: the data keys for Y axis series"
          },
          kpiMetrics: {
            type: "array",
            description: "For KPI cards: the metrics to highlight",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                dataKey: { type: "string" },
                format: {
                  type: "string",
                  enum: ["currency_inr", "number", "percentage", "text"]
                }
              },
              required: ["label", "dataKey"]
            }
          }
        },
        required: ["vizType", "reasoning"]
      }
    }
  },

  {
    type: "function",
    function: {
      name: "synthesizeResponse",
      description: `Generate the final narrative analysis to accompany the visualization.
        This is the last tool call before the agent returns its response to the user.
        Include key insights, anomalies, comparisons, and suggested follow-up questions.`,
      parameters: {
        type: "object",
        properties: {
          narrative: {
            type: "string",
            description: `2-4 paragraph analysis of the data. Include:
              - Direct answer to the user's question (first sentence)
              - Key metrics and what they mean
              - Notable patterns, peaks, or anomalies
              - Comparison context if available (vs previous period)
              - 2-3 suggested follow-up questions`
          },
          keyMetrics: {
            type: "array",
            description: "The 2-4 most important numbers to highlight prominently",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
                trend: { type: "string", enum: ["up", "down", "neutral"] }
              },
              required: ["label", "value"]
            }
          },
          suggestedFollowUps: {
            type: "array",
            items: { type: "string" },
            description: "3 follow-up questions the user might want to ask next"
          }
        },
        required: ["narrative", "keyMetrics"]
      }
    }
  }
];

/**
 * Tool names as constants to avoid string typos
 */
const TOOL_NAMES = {
  GET_DATASOURCE_INFO: 'getDatasourceInfo',
  REQUEST_DATASOURCE_APPROVAL: 'requestDatasourceApproval',
  DRAFT_QUERY: 'draftQuery',
  REQUEST_QUERY_APPROVAL: 'requestQueryApproval',
  SELECT_VISUALIZATION: 'selectVisualization',
  SYNTHESIZE_RESPONSE: 'synthesizeResponse',
};

module.exports = { AGENT_TOOL_DECLARATIONS, TOOL_NAMES };
