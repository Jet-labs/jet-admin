const { BoundedCache } = require('../../utils/cache.util');
const { appPageService } = require('../appPage/appPage.service');
const { widgetService } = require('../widget/widget.service');
const { dataQueryService } = require('../dataQuery/dataQuery.service');
const { datasourceService } = require('../datasource/datasource.service');
const Logger = require('../../utils/logger');

// Cache conversation contexts so we don't rebuild them on every chat turn.
// Maps conversationID -> string (the assembled context block)
const sessionContextCache = new BoundedCache(500);

const aiContextService = {};

/**
 * Builds localized context for the AI prompt based on the user's current location in the app.
 *
 * @param {object} param0
 * @param {string} param0.tenantID
 * @param {string} param0.conversationID
 * @param {object} param0.clientContext
 * @returns {Promise<string>} The generated context block string
 */
aiContextService.buildSessionContext = async ({ tenantID, conversationID, clientContext = {} }) => {
  const { appPageID, widgetID, route } = clientContext;
  const cacheKey = conversationID
    ? `${conversationID}:${route || ''}:${appPageID || ''}:${widgetID || ''}`
    : null;

  // Return cached context if available for this specific context
  if (cacheKey && sessionContextCache.has(cacheKey)) {
    return sessionContextCache.get(cacheKey);
  }
  let contextBlock = "## Current User Context\n";

  contextBlock += `- **Active Route**: ${route || 'Unknown'}\n`;

  try {
    if (appPageID) {
      contextBlock += `- **Active App Page ID**: ${appPageID}\n`;
      // Fetch the actual app page to give the AI context on its layout/widgets
      const appPage = await appPageService.getAppPageByID({ tenantID, appPageID, userID: 'system' });
      if (appPage) {
        contextBlock += `- **App Page Config**:\n\`\`\`json\n${JSON.stringify(appPage.appPageConfig, null, 2)}\n\`\`\`\n`;
      }
    }

    if (widgetID) {
      contextBlock += `- **Active Widget ID**: ${widgetID}\n`;
      const widget = await widgetService.getWidgetByID({ tenantID, widgetID, userID: 'system' });
      if (widget) {
        contextBlock += `- **Widget Config**:\n\`\`\`json\n${JSON.stringify(widget.widgetConfig, null, 2)}\n\`\`\`\n`;
      }
    }
  } catch (err) {
    Logger.log('warning', {
      message: 'aiContextService:buildSessionContext:error',
      params: { tenantID, appPageID, widgetID, error: err.message }
    });
  }

  // If no specific context, provide a general hint
  if (!appPageID && !widgetID) {
    contextBlock += "- The user is in a general context. Use `get_tenant_resource_summary` to explore their resources.\n";
  }

  // Cache the result if we have a cache key
  if (cacheKey) {
    sessionContextCache.set(cacheKey, contextBlock);
  }

  return contextBlock;
};

module.exports = { aiContextService };
