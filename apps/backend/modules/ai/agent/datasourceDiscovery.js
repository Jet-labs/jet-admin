/**
 * DatasourceDiscovery
 * Fetches manifests from tenant datasources using getDatasourceInfo()
 * Enriches with user-configured datasource titles and tags for LLM disambiguation.
 * Reuses existing datasourceService and DATASOURCE_LOGIC_COMPONENTS
 */

const Logger = require("../../../utils/logger");
const { datasourceService } = require('../../datasource/datasource.service');
const { DATASOURCE_LOGIC_COMPONENTS } = require('@jet-admin/datasources-logic');
const { agentSession } = require('./agentSession');

const datasourceDiscovery = {

  /**
   * Fetch all available datasource IDs for a tenant.
   * Called before starting the agent loop.
   */
  async getAvailableDatasourceIDs({ tenantID, userID }) {
    const datasources = await datasourceService.getAllDatasources({ userID, tenantID });
    return datasources.map(ds => ({
      datasourceID: ds.datasourceID,
      datasourceTitle: ds.datasourceTitle,
      datasourceType: ds.datasourceType,
      datasourceTags: ds.datasourceTags || [],
    }));
  },

  /**
   * Execute getDatasourceInfo() for a specific datasource.
   * Called by the agent tool executor when model calls getDatasourceInfo.
   * 
   * Enriches the type-level manifest with user-configured context:
   * - datasourceTitle (e.g., "Production Bookings DB")
   * - datasourceTags (e.g., ["orders", "payments"])
   * 
   * This enrichment is critical for disambiguation when a tenant has
   * multiple datasources of the same type.
   */
  async getManifestForDatasource({ datasourceID, tenantID, userID, session }) {
    Logger.log('info', {
      message: 'datasourceDiscovery:getManifestForDatasource',
      params: { datasourceID, tenantID },
    });

    try {
      // Fetch the datasource record from DB
      const datasource = await datasourceService.getDatasourceByID({
        userID,
        tenantID,
        datasourceID,
      });

      if (!datasource) {
        return { error: `Datasource ${datasourceID} not found` };
      }

      // Get the logic component for this type
      const logicComponent = DATASOURCE_LOGIC_COMPONENTS[datasource.datasourceType];

      let manifest;

      if (logicComponent?.getDatasourceInfo) {
        // Call getDatasourceInfo() — uses the centralized manifest registry
        manifest = await logicComponent.getDatasourceInfo({
          datasourceOptions: datasource.datasourceOptions,
        });
      } else {
        // Fallback for datasources without manifest
        manifest = {
          name: datasource.datasourceType,
          description: `${datasource.datasourceType} datasource`,
          capabilities: ['read'],
          queryInstructions: `Use standard ${datasource.datasourceType} query format`,
          exampleQueries: [],
          semanticHints: {},
          warning: 'No detailed manifest available for this datasource type'
        };
      }

      // ENRICH with user-configured context from tblDatasources.
      // This is critical for the LLM to disambiguate between multiple
      // datasources of the same type (e.g., two PostgreSQL instances).
      const enrichedManifest = {
        ...manifest,
        // Identity
        datasourceID,
        datasourceType: datasource.datasourceType,
        // User-configured context — the LLM uses these to decide which DS to query
        datasourceTitle: datasource.datasourceTitle,
        datasourceTags: datasource.datasourceTags || [],
        userDescription: datasource.datasourceTags?.length > 0
          ? `User-configured datasource "${datasource.datasourceTitle}" tagged as: [${datasource.datasourceTags.join(', ')}]. Use this context to understand what data this specific instance contains.`
          : `User-configured datasource "${datasource.datasourceTitle}". No additional tags provided.`,
      };

      // Cache manifest on session for use during query conceptualization
      if (session) {
        const currentManifests = session.datasourceManifests || {};
        agentSession.update(session.chatRoomID, {
          datasourceManifests: {
            ...currentManifests,
            [datasourceID]: enrichedManifest,
          }
        });
      }

      Logger.log('success', {
        message: 'datasourceDiscovery:getManifestForDatasource:success',
        params: {
          datasourceID,
          datasourceType: datasource.datasourceType,
          datasourceTitle: datasource.datasourceTitle,
        },
      });

      return enrichedManifest;

    } catch (error) {
      Logger.log('error', {
        message: 'datasourceDiscovery:getManifestForDatasource:error',
        params: { datasourceID, error: error.message },
      });
      return { error: error.message, datasourceID };
    }
  },
};

module.exports = { datasourceDiscovery };
