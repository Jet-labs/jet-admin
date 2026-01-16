-- CreateTable
CREATE TABLE "tblAPIKeyRoleMappings" (
    "apiKeyID" UUID NOT NULL,
    "roleID" UUID NOT NULL,

    CONSTRAINT "tblAPIKeyRoleMappings_pkey" PRIMARY KEY ("apiKeyID","roleID")
);

-- CreateTable
CREATE TABLE "tblAPIKeys" (
    "apiKeyID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantID" UUID NOT NULL,
    "apiKey" VARCHAR NOT NULL,
    "apiKeyTitle" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDisabled" BOOLEAN NOT NULL,
    "creatorID" UUID,
    "createdByApiKeyID" UUID,

    CONSTRAINT "tblAPIKeys_pkey" PRIMARY KEY ("apiKeyID")
);

-- CreateTable
CREATE TABLE "tblAuditLogs" (
    "auditLogID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userID" UUID,
    "tenantID" UUID,
    "type" VARCHAR NOT NULL,
    "subType" VARCHAR,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "error" JSONB,

    CONSTRAINT "tblAuditLogs_pkey" PRIMARY KEY ("auditLogID")
);

-- CreateTable
CREATE TABLE "tblCronJobHistory" (
    "cronJobHistoryID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cronJobID" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "scheduledAt" TIMESTAMPTZ(6),
    "startTime" TIMESTAMPTZ(6),
    "endTime" TIMESTAMPTZ(6),
    "durationMs" INTEGER,
    "result" TEXT,
    "triggerType" VARCHAR(50) DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblCronJobHistory_pkey" PRIMARY KEY ("cronJobHistoryID")
);

-- CreateTable
CREATE TABLE "tblCronJobs" (
    "cronJobID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cronJobTitle" VARCHAR NOT NULL,
    "cronJobDescription" TEXT,
    "cronJobSchedule" VARCHAR NOT NULL,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "nextRunAt" TIMESTAMPTZ(6),
    "timeoutSeconds" INTEGER DEFAULT 300,
    "retryAttempts" INTEGER NOT NULL DEFAULT 0,
    "retryDelaySeconds" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantID" UUID NOT NULL,
    "dataQueryID" UUID NOT NULL,
    "dataQueryArgValues" JSONB,

    CONSTRAINT "tblCronJobs_pkey" PRIMARY KEY ("cronJobID")
);

-- CreateTable
CREATE TABLE "tblDashboards" (
    "dashboardID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dashboardDescription" VARCHAR,
    "tenantID" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "creatorID" UUID,
    "dashboardConfig" JSONB,
    "dashboardTitle" VARCHAR NOT NULL,
    "createdByApiKeyID" UUID,

    CONSTRAINT "tblDashboards_pkey" PRIMARY KEY ("dashboardID")
);

-- CreateTable
CREATE TABLE "tblDataQueries" (
    "dataQueryID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantID" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMPTZ(6),
    "isDisabled" BOOLEAN DEFAULT false,
    "dataQueryTitle" VARCHAR NOT NULL DEFAULT 'Untitled',
    "dataQueryDescription" VARCHAR,
    "dataQueryOptions" JSON,
    "runOnLoad" BOOLEAN,
    "dataQueryResultSchema" JSON,
    "creatorID" UUID,
    "datasourceID" UUID,
    "datasourceType" VARCHAR NOT NULL DEFAULT 'postgresql',
    "createdByApiKeyID" UUID,

    CONSTRAINT "tblDataQueries_pkey" PRIMARY KEY ("dataQueryID")
);

-- CreateTable
CREATE TABLE "tblDatabaseNotifications" (
    "databaseNotificationID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "databaseNotificationTitle" VARCHAR NOT NULL,
    "tenantID" UUID NOT NULL,

    CONSTRAINT "tblDatabaseNotifications_pkey" PRIMARY KEY ("databaseNotificationID")
);

-- CreateTable
CREATE TABLE "tblDatasources" (
    "datasourceID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "datasourceTitle" VARCHAR NOT NULL,
    "datasourceType" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantID" UUID NOT NULL,
    "creatorID" UUID,
    "datasourceOptions" JSONB NOT NULL,
    "datasourceTags" VARCHAR[],
    "createdByApiKeyID" UUID,

    CONSTRAINT "tblDatasources_pkey" PRIMARY KEY ("datasourceID")
);

-- CreateTable
CREATE TABLE "tblPermissions" (
    "permissionID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "permissionTitle" VARCHAR NOT NULL,
    "permissionDescription" VARCHAR,

    CONSTRAINT "tblPermissions_pkey" PRIMARY KEY ("permissionID")
);

-- CreateTable
CREATE TABLE "tblRolePermissionMappings" (
    "roleID" UUID NOT NULL,
    "permissionID" UUID NOT NULL,

    CONSTRAINT "tblRolePermissionMappings_pkey" PRIMARY KEY ("roleID","permissionID")
);

-- CreateTable
CREATE TABLE "tblRoles" (
    "roleID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "roleTitle" VARCHAR NOT NULL,
    "roleDescription" VARCHAR,
    "tenantID" UUID,

    CONSTRAINT "tblRoles_pkey" PRIMARY KEY ("roleID")
);

-- CreateTable
CREATE TABLE "tblRuntimeConfig" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblRuntimeConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "tblTenants" (
    "tenantID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creatorID" UUID,
    "isDisabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMPTZ(6),
    "disableReason" VARCHAR,
    "tenantDBURL" VARCHAR NOT NULL,
    "tenantLogoURL" VARCHAR,
    "tenantTitle" VARCHAR NOT NULL,
    "tenantDBType" VARCHAR NOT NULL DEFAULT 'postgresql',
    "createdByApiKeyID" UUID,

    CONSTRAINT "tblTenants_pkey" PRIMARY KEY ("tenantID")
);

-- CreateTable
CREATE TABLE "tblUserNotifications" (
    "notificationID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userID" UUID NOT NULL,
    "tenantID" UUID,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR,
    "actionType" VARCHAR,
    "action" VARCHAR,
    "actionText" VARCHAR,
    "notifierID" VARCHAR NOT NULL,

    CONSTRAINT "tblUserNotifications_pkey" PRIMARY KEY ("notificationID")
);

-- CreateTable
CREATE TABLE "tblUserTenantConfigMap" (
    "userID" UUID NOT NULL,
    "tenantID" UUID NOT NULL,
    "config" JSONB,

    CONSTRAINT "tblUserTenantConfigMap_pkey" PRIMARY KEY ("userID","tenantID")
);

-- CreateTable
CREATE TABLE "tblUserTenantRoleMappings" (
    "userID" UUID NOT NULL,
    "tenantID" UUID NOT NULL,
    "roleID" UUID NOT NULL,

    CONSTRAINT "tblUserTenantRoleMappings_pkey" PRIMARY KEY ("userID","tenantID","roleID")
);

-- CreateTable
CREATE TABLE "tblUsers" (
    "userID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firebaseID" VARCHAR(128) NOT NULL,
    "phoneNumber" VARCHAR,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "address1" VARCHAR,
    "address2" VARCHAR,
    "email" VARCHAR NOT NULL,
    "isDisabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMPTZ(6),
    "disableReason" VARCHAR,
    "lastSeen" TIMESTAMPTZ(6),

    CONSTRAINT "tblUsers_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "tblUsersTenantsRelationship" (
    "tenantID" UUID NOT NULL,
    "userID" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" VARCHAR NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "pktblUsersTenantsRelationship" PRIMARY KEY ("tenantID","userID")
);

-- CreateTable
CREATE TABLE "tblWidgets" (
    "widgetID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "widgetTitle" VARCHAR NOT NULL,
    "widgetDescription" VARCHAR,
    "widgetType" VARCHAR NOT NULL,
    "widgetConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "tenantID" UUID NOT NULL,
    "creatorID" UUID,
    "refreshInterval" INTEGER,
    "createdByApiKeyID" UUID,
    "workflowID" UUID,
    "workflowConfig" JSONB,

    CONSTRAINT "tblWidgets_pkey" PRIMARY KEY ("widgetID")
);

-- CreateTable
CREATE TABLE "tblTenantConfig" (
    "tenantConfigID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantID" UUID NOT NULL,
    "allowedModules" VARCHAR[],
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tblTenantConfig_pkey" PRIMARY KEY ("tenantConfigID")
);

-- CreateTable
CREATE TABLE "tblNodeExecutionLogs" (
    "executionLogID" BIGSERIAL NOT NULL,
    "instanceID" UUID NOT NULL,
    "nodeID" UUID,
    "eventType" VARCHAR NOT NULL,
    "inputData" JSONB,
    "outputData" JSONB,
    "errorMessage" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nodeUUID" VARCHAR,

    CONSTRAINT "tblNodeExecutionLogs_pkey" PRIMARY KEY ("executionLogID")
);

-- CreateTable
CREATE TABLE "tblWorkflowEdge" (
    "edgeID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflowID" UUID NOT NULL,
    "upstreamNodeID" UUID NOT NULL,
    "downstreamNodeID" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceHandle" VARCHAR,
    "targetHandle" VARCHAR,
    "edgeType" VARCHAR,
    "edgeConfig" JSONB,

    CONSTRAINT "tblWorkflowEdge_pkey" PRIMARY KEY ("edgeID")
);

-- CreateTable
CREATE TABLE "tblWorkflowInstances" (
    "instanceID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflowID" UUID,
    "tenantID" UUID NOT NULL,
    "status" VARCHAR NOT NULL DEFAULT 'PENDING',
    "contextData" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isTest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tblWorkflowInstances_pkey" PRIMARY KEY ("instanceID")
);

-- CreateTable
CREATE TABLE "tblWorkflowNodes" (
    "nodeID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workflowID" UUID NOT NULL,
    "nodeType" VARCHAR NOT NULL,
    "timeoutSeconds" INTEGER DEFAULT 300,
    "retryLimit" INTEGER DEFAULT 3,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nodeConfig" JSONB,

    CONSTRAINT "tblWorkflowNodes_pkey" PRIMARY KEY ("nodeID")
);

-- CreateTable
CREATE TABLE "tblWorkflows" (
    "workflowID" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR NOT NULL,
    "tenantID" UUID NOT NULL,
    "creatorID" UUID,
    "isDisabled" BOOLEAN,
    "disabledAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workflowOptions" JSONB DEFAULT '{}',
    "createdByApiKeyID" UUID,

    CONSTRAINT "tblWorflows_pkey" PRIMARY KEY ("workflowID")
);

-- CreateIndex
CREATE INDEX "idx_tblAPIKeys_createdByApiKeyID" ON "tblAPIKeys"("createdByApiKeyID");

-- CreateIndex
CREATE INDEX "idx_tblDashboards_createdByApiKeyID" ON "tblDashboards"("createdByApiKeyID");

-- CreateIndex
CREATE INDEX "idx_tblDataQueries_createdByApiKeyID" ON "tblDataQueries"("createdByApiKeyID");

-- CreateIndex
CREATE INDEX "idx_tblDatasources_createdByApiKeyID" ON "tblDatasources"("createdByApiKeyID");

-- CreateIndex
CREATE INDEX "idx_tblTenants_createdByApiKeyID" ON "tblTenants"("createdByApiKeyID");

-- CreateIndex
CREATE UNIQUE INDEX "uniquetblUsersTenantsRelationship" ON "tblUsersTenantsRelationship"("tenantID", "userID");

-- CreateIndex
CREATE INDEX "idx_tblWidgets_createdByApiKeyID" ON "tblWidgets"("createdByApiKeyID");

-- CreateIndex
CREATE INDEX "idx_tblNodeExecutionLogs_instanceID" ON "tblNodeExecutionLogs"("instanceID");

-- CreateIndex
CREATE INDEX "fki_tblNodeExecutionLogs_nodeID_fkey" ON "tblNodeExecutionLogs"("nodeID");

-- CreateIndex
CREATE INDEX "idx_tblWorkflowEdge_workflowID" ON "tblWorkflowEdge"("workflowID");

-- CreateIndex
CREATE INDEX "idx_tblWorkflowInstances_tenantID_status" ON "tblWorkflowInstances"("tenantID", "status");

-- CreateIndex
CREATE INDEX "idx_tblWorkflowNodes_workflowID" ON "tblWorkflowNodes"("workflowID");

-- CreateIndex
CREATE INDEX "idx_tblWorkflows_createdByApiKeyID" ON "tblWorkflows"("createdByApiKeyID");

-- AddForeignKey
ALTER TABLE "tblAPIKeyRoleMappings" ADD CONSTRAINT "tblAPIKeyRoleMappings_apiKeyID_fkey" FOREIGN KEY ("apiKeyID") REFERENCES "tblAPIKeys"("apiKeyID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblAPIKeyRoleMappings" ADD CONSTRAINT "tblAPIKeyRoleMappings_roleID_fkey" FOREIGN KEY ("roleID") REFERENCES "tblRoles"("roleID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblAPIKeys" ADD CONSTRAINT "fkTblAPIKeysCreatedByApiKeyID" FOREIGN KEY ("createdByApiKeyID") REFERENCES "tblAPIKeys"("apiKeyID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblAPIKeys" ADD CONSTRAINT "fkTblAPIKeysCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblAPIKeys" ADD CONSTRAINT "fkTblAPIKeysTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblCronJobHistory" ADD CONSTRAINT "fkTblCronJobHistoryCronjobID" FOREIGN KEY ("cronJobID") REFERENCES "tblCronJobs"("cronJobID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblCronJobs" ADD CONSTRAINT "fkTblConJobsDataQueryID" FOREIGN KEY ("dataQueryID") REFERENCES "tblDataQueries"("dataQueryID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblCronJobs" ADD CONSTRAINT "fkTblCronJobsTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDashboards" ADD CONSTRAINT "fkTblDashboardCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDashboards" ADD CONSTRAINT "fkTblDashboardsCreatedByApiKeyID" FOREIGN KEY ("createdByApiKeyID") REFERENCES "tblAPIKeys"("apiKeyID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDashboards" ADD CONSTRAINT "fkTblDashboardsTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDataQueries" ADD CONSTRAINT "fkDatasourceIDDatasourceID" FOREIGN KEY ("datasourceID") REFERENCES "tblDatasources"("datasourceID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDataQueries" ADD CONSTRAINT "fkTblDataQueriesCreatedByApiKeyID" FOREIGN KEY ("createdByApiKeyID") REFERENCES "tblAPIKeys"("apiKeyID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDataQueries" ADD CONSTRAINT "fkTblDataQueriesCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDataQueries" ADD CONSTRAINT "fkTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatabaseNotifications" ADD CONSTRAINT "fkTblDatabaseNotificationsTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatasources" ADD CONSTRAINT "fkTblDatasourceTblTenantsTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatasources" ADD CONSTRAINT "fkTblDatasourceTblUsersCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatasources" ADD CONSTRAINT "fkTblDatasourcesCreatedByApiKeyID" FOREIGN KEY ("createdByApiKeyID") REFERENCES "tblAPIKeys"("apiKeyID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblRolePermissionMappings" ADD CONSTRAINT "fktblRolePermissionMappingsPermission" FOREIGN KEY ("permissionID") REFERENCES "tblPermissions"("permissionID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblRolePermissionMappings" ADD CONSTRAINT "fktblRolePermissionMappingsRole" FOREIGN KEY ("roleID") REFERENCES "tblRoles"("roleID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblRoles" ADD CONSTRAINT "fktblRolesTenantIDTblTenantsTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblTenants" ADD CONSTRAINT "fkTblTenantsCreatedByApiKeyID" FOREIGN KEY ("createdByApiKeyID") REFERENCES "tblAPIKeys"("apiKeyID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblTenants" ADD CONSTRAINT "fktblTenantstblUsersCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserNotifications" ADD CONSTRAINT "fkTblUserNotificationsTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserNotifications" ADD CONSTRAINT "fkTblUserNotificationsUserIDUserID" FOREIGN KEY ("userID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserTenantConfigMap" ADD CONSTRAINT "fkTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserTenantConfigMap" ADD CONSTRAINT "fkUserIDUserID" FOREIGN KEY ("userID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserTenantRoleMappings" ADD CONSTRAINT "fkUserTenantRoleRole" FOREIGN KEY ("roleID") REFERENCES "tblRoles"("roleID") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserTenantRoleMappings" ADD CONSTRAINT "fkUserTenantRoleUserTenant" FOREIGN KEY ("tenantID", "userID") REFERENCES "tblUsersTenantsRelationship"("tenantID", "userID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUsersTenantsRelationship" ADD CONSTRAINT "fkTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUsersTenantsRelationship" ADD CONSTRAINT "fkUserIDUserID" FOREIGN KEY ("userID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWidgets" ADD CONSTRAINT "fkTblWidgetsCreatedByApiKeyID" FOREIGN KEY ("createdByApiKeyID") REFERENCES "tblAPIKeys"("apiKeyID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWidgets" ADD CONSTRAINT "fkTblWidgetsCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWidgets" ADD CONSTRAINT "fkTblWidgetsTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWidgets" ADD CONSTRAINT "fkTblWidgetsWorkflowID" FOREIGN KEY ("workflowID") REFERENCES "tblWorkflows"("workflowID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblNodeExecutionLogs" ADD CONSTRAINT "tblNodeExecutionLogs_instanceID_fkey" FOREIGN KEY ("instanceID") REFERENCES "tblWorkflowInstances"("instanceID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblNodeExecutionLogs" ADD CONSTRAINT "tblNodeExecutionLogs_nodeID_fkey" FOREIGN KEY ("nodeID") REFERENCES "tblWorkflowNodes"("nodeID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWorkflowEdge" ADD CONSTRAINT "tblWorkflowEdge_downstream_fkey" FOREIGN KEY ("downstreamNodeID") REFERENCES "tblWorkflowNodes"("nodeID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWorkflowEdge" ADD CONSTRAINT "tblWorkflowEdge_upstream_fkey" FOREIGN KEY ("upstreamNodeID") REFERENCES "tblWorkflowNodes"("nodeID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWorkflowEdge" ADD CONSTRAINT "tblWorkflowEdge_workflowID_fkey" FOREIGN KEY ("workflowID") REFERENCES "tblWorkflows"("workflowID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWorkflowInstances" ADD CONSTRAINT "tblWorkflowInstances_tenantID_fkey" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWorkflowInstances" ADD CONSTRAINT "tblWorkflowInstances_workflowID_fkey" FOREIGN KEY ("workflowID") REFERENCES "tblWorkflows"("workflowID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWorkflowNodes" ADD CONSTRAINT "tblWorkflowNodes_workflowID_fkey" FOREIGN KEY ("workflowID") REFERENCES "tblWorkflows"("workflowID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWorkflows" ADD CONSTRAINT "fkTblWorkflowsCreatedByApiKeyID" FOREIGN KEY ("createdByApiKeyID") REFERENCES "tblAPIKeys"("apiKeyID") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWorkflows" ADD CONSTRAINT "tblWorkflowsCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWorkflows" ADD CONSTRAINT "tblWorkflowsTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;
