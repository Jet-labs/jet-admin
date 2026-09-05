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
 * Route-aware hints so Jet tailors answers to where the user is standing.
 */
function routeHints(route = '') {
  const r = route.toLowerCase();
  if (r.includes('workflow')) {
    return '- The user is in the Workflows area. Prefer `get_workflow_schema` + targeted get_workflow calls. Offer to inspect, explain, or extend the open workflow.\n';
  }
  if (r.includes('app-page') || r.includes('apppage') || r.includes('/pages')) {
    return '- The user is in the App Pages area. Follow the App Page Building guide strictly (layoutVersion 2, widget instance keys, dataSources + variables + events).\n';
  }
  if (r.includes('widget')) {
    return '- The user is in the Widgets area. Call `get_widget_schemas` before proposing widget configs.\n';
  }
  if (r.includes('quer')) {
    return '- The user is in the Queries area. Call `get_data_query_schemas` for the datasource type before writing query options.\n';
  }
  if (r.includes('datasource') || r.includes('data-source')) {
    return '- The user is in the Datasources area. Call `get_datasource_schemas` before proposing connection options. Never invent credentials.\n';
  }
  if (r.includes('listener')) {
    return '- The user is in the Listeners area. Call `get_listener_schemas` before proposing listener configs.\n';
  }
  if (r.includes('dashboard')) {
    return '- The user is in the Dashboards area. Think widgets + app pages composed into views.\n';
  }
  return '';
}

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
  let contextBlock = '## Current User Context\n';

  contextBlock += `- **Active Route**: ${route || 'Unknown'}\n`;
  contextBlock += `- **Tenant ID**: ${tenantID}\n`;
  contextBlock += `- **Server time (UTC)**: ${new Date().toISOString()}\n`;
  const routeHint = routeHints(route || '');
  if (routeHint) contextBlock += routeHint;

  try {
    if (appPageID) {
      contextBlock += `- **Active App Page ID**: ${appPageID}\n`;
      // Fetch the actual app page to give the AI context on its layout/widgets
      const appPage = await appPageService.getAppPageByID({ tenantID, appPageID, userID: 'system' });
      if (appPage) {
        contextBlock += `- **App Page Title**: ${appPage.appPageTitle || appPage.title || appPageID}\n`;
        contextBlock += `- **App Page Config**:\n\`\`\`json\n${JSON.stringify(appPage.appPageConfig, null, 2).slice(0, 12000)}\n\`\`\`\n`;
      }
    }

    if (widgetID) {
      contextBlock += `- **Active Widget ID**: ${widgetID}\n`;
      const widget = await widgetService.getWidgetByID({ tenantID, widgetID, userID: 'system' });
      if (widget) {
        contextBlock += `- **Widget Title/Type**: ${widget.widgetTitle || ''} / ${widget.widgetType || ''}\n`;
        contextBlock += `- **Widget Config**:\n\`\`\`json\n${JSON.stringify(widget.widgetConfig, null, 2).slice(0, 8000)}\n\`\`\`\n`;
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
    contextBlock += "- No specific page/widget is open. Use `get_tenant_resource_summary` first to explore this tenant's resources before proposing anything.\n";
  }

  contextBlock += [
    '',
    '### Jet Admin domain quick reference',
    '- Datasource types include: postgresql, mysql, mongodb, restapi, graphql, and 25+ more. Always fetch `get_datasource_schemas` for the exact type before creating.',
    '- Query options are datasource-specific. Always fetch `get_data_query_schemas` first.',
    '- Workflow nodes: start → dataQuery / javascript / condition / loop / delay / dataCollection → end. Fetch `get_workflow_schema` before building.',
    '- Widgets are standalone records reused across pages; pages reference them via `widget_<widgetID>_<n>` instance keys with layoutVersion 2.',
    '- Page expressions use `{{state.queries.<alias>.data}}`, `{{state.workflows.<alias>.data}}`, `{{state.variables.<key>}}`, `{{state.event.<field>}}` (events only).',
  ].join('\n');

  // Cache the result if we have a cache key
  if (cacheKey) {
    sessionContextCache.set(cacheKey, contextBlock);
  }

  return contextBlock;
};

module.exports = { aiContextService };
