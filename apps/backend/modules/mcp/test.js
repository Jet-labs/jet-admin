import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prisma } from "../../config/prisma.config.js";
import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";

// Create server instance
const server = new McpServer({
  name: "jet",
  version: "1.0.0",
  capabilities: {
    resources: {
      datasources: {
        description: "List datasources for tenant",
        inputSchema: z.object({
          tenantID: z.number().describe("Tenant ID"),
        }),
      },
      datasources_by_id: {
        description: "Get datasource by ID",
        inputSchema: z.object({
          datasourceID: z.number().describe("Datasource ID"),
        }),
      },
    },
    tools: {},
  },
});

server.resource(
  "datasources",
  "Datasources",
  z.object({
    tenantID: z.number().describe("Tenant ID"),
  }),
  async ({ tenantID }) => {
    const datasources = await prisma.tblDatasources.findMany({
      where: {
        tenantID,
      },
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(datasources, null, 2),
        },
      ],
    };
  }
);

server.resource("datasources_by_id", "Datasources by ID",
  z.object({
    datasourceID: z.number().describe("Datasource ID"),
  }),
  async ({ datasourceID }) => {
    const datasource = await prisma.tblDatasources.findUnique({
      where: {
        datasourceID,
      },
    });

    const processedDatasource = {
      ...datasource,
      formConfig: DATASOURCE_TYPES[datasource.datasourceType].formConfig,
      queryConfigForm:
        DATASOURCE_TYPES[datasource.datasourceType].queryConfigForm,
    };
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(processedDatasource, null, 2),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
