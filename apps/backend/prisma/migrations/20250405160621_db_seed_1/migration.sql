-- CreateTable
CREATE TABLE "tblTenants" (
    "tenantID" SERIAL NOT NULL,
    "creatorID" INTEGER,
    "isDisabled" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMPTZ(6),
    "disableReason" VARCHAR,
    "tenantDBURL" VARCHAR,
    "tenantLogoURL" VARCHAR,
    "tenantTitle" VARCHAR,

    CONSTRAINT "tblTenants_pkey" PRIMARY KEY ("tenantID")
);

-- CreateTable
CREATE TABLE "tblUsers" (
    "userID" SERIAL NOT NULL,
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
    "tenantID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" VARCHAR NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "pktblUsersTenantsRelationship" PRIMARY KEY ("tenantID","userID")
);

-- CreateTable
CREATE TABLE "tblDatabaseQueries" (
    "dataQueryID" SERIAL NOT NULL,
    "tenantID" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMPTZ(6),
    "isDisabled" BOOLEAN DEFAULT false,
    "dataQueryTitle" VARCHAR NOT NULL DEFAULT 'Untitled',
    "dataQueryDescription" VARCHAR,
    "dataQueryData" JSON,
    "runOnLoad" BOOLEAN,
    "dataQueryResultSchema" JSON,
    "creatorID" INTEGER,

    CONSTRAINT "pktblDatabaseQueries" PRIMARY KEY ("dataQueryID")
);

-- CreateTable
CREATE TABLE "tblPermissions" (
    "permissionID" SERIAL NOT NULL,
    "permissionTitle" VARCHAR NOT NULL,
    "permissionDescription" VARCHAR,

    CONSTRAINT "tblPermission_pkey" PRIMARY KEY ("permissionID")
);

-- CreateTable
CREATE TABLE "tblRolePermissionMappings" (
    "roleID" INTEGER NOT NULL,
    "permissionID" INTEGER NOT NULL,

    CONSTRAINT "tblRolePermissionMappings_pkey" PRIMARY KEY ("roleID","permissionID")
);

-- CreateTable
CREATE TABLE "tblRoles" (
    "roleID" SERIAL NOT NULL,
    "roleTitle" VARCHAR NOT NULL,
    "roleDescription" VARCHAR,
    "tenantID" INTEGER,

    CONSTRAINT "tblroles_pkey" PRIMARY KEY ("roleID")
);

-- CreateTable
CREATE TABLE "tblUserTenantRoleMappings" (
    "userID" INTEGER NOT NULL,
    "tenantID" INTEGER NOT NULL,
    "roleID" INTEGER NOT NULL,

    CONSTRAINT "tblUserTenantRoleMappings_pkey" PRIMARY KEY ("userID","tenantID","roleID")
);

-- CreateTable
CREATE TABLE "tblDatabaseChartQueryMappings" (
    "databaseChartID" INTEGER NOT NULL,
    "dataQueryID" INTEGER NOT NULL,
    "parameters" JSONB,
    "title" TEXT,
    "executionOrder" INTEGER,
    "datasetFields" JSONB,
    "dataQueryArgValues" JSONB,

    CONSTRAINT "tblDatabaseChartQueryMappings_pkey" PRIMARY KEY ("databaseChartID","dataQueryID")
);

-- CreateTable
CREATE TABLE "tblDatabaseCharts" (
    "databaseChartID" SERIAL NOT NULL,
    "databaseChartName" TEXT NOT NULL,
    "databaseChartDescription" TEXT,
    "databaseChartType" TEXT NOT NULL,
    "databaseChartConfig" JSONB NOT NULL,
    "databaseChartMultiQueryConfig" JSONB,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "tenantID" INTEGER NOT NULL,
    "creatorID" INTEGER,
    "refreshInterval" INTEGER,

    CONSTRAINT "tblDatabaseCharts_pkey" PRIMARY KEY ("databaseChartID")
);

-- CreateTable
CREATE TABLE "tblDashboardChartMappings" (
    "databaseChartID" INTEGER NOT NULL,
    "dashboardID" INTEGER NOT NULL,
    "parameters" JSONB,
    "title" VARCHAR NOT NULL,

    CONSTRAINT "pkTblDashboardChartMappings" PRIMARY KEY ("databaseChartID","dashboardID")
);

-- CreateTable
CREATE TABLE "tblDashboards" (
    "dashboardID" SERIAL NOT NULL,
    "dashboardDescription" VARCHAR,
    "tenantID" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "creatorID" INTEGER,
    "dashboardConfig" JSONB,
    "dashboardTitle" VARCHAR NOT NULL,

    CONSTRAINT "tblDashboards_pkey" PRIMARY KEY ("dashboardID")
);

-- CreateTable
CREATE TABLE "tblUserTenantConfigMap" (
    "userID" INTEGER NOT NULL,
    "tenantID" INTEGER NOT NULL,
    "config" JSONB,

    CONSTRAINT "tblUserTenantConfigMap_pkey" PRIMARY KEY ("userID","tenantID")
);

-- CreateTable
CREATE TABLE "tblUserNotifications" (
    "notificationID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "tenantID" INTEGER,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR,
    "actionType" VARCHAR,
    "action" VARCHAR,
    "actionText" VARCHAR,
    "notifierID" VARCHAR NOT NULL,

    CONSTRAINT "tblUserNotifications_pkey" PRIMARY KEY ("notificationID")
);

-- CreateTable
CREATE TABLE "tblWidgetQueryMappings" (
    "widgetID" INTEGER NOT NULL,
    "dataQueryID" INTEGER NOT NULL,
    "parameters" JSONB,
    "title" VARCHAR,
    "executionOrder" INTEGER,
    "datasetFields" JSONB,
    "dataQueryArgValues" JSONB,

    CONSTRAINT "tblWidgetQueryMappings_pkey" PRIMARY KEY ("widgetID","dataQueryID")
);

-- CreateTable
CREATE TABLE "tblWidgets" (
    "widgetID" SERIAL NOT NULL,
    "widgetTitle" VARCHAR NOT NULL,
    "widgetDescription" VARCHAR,
    "widgetType" VARCHAR NOT NULL,
    "widgetConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "tenantID" INTEGER NOT NULL,
    "creatorID" INTEGER,
    "refreshInterval" INTEGER,

    CONSTRAINT "tblWidgets_pkey" PRIMARY KEY ("widgetID")
);

-- CreateTable
CREATE TABLE "tblDatabaseNotifications" (
    "databaseNotificationID" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "databaseNotificationTitle" VARCHAR NOT NULL,
    "tenantID" INTEGER NOT NULL,

    CONSTRAINT "tblDatabaseNotifications_pkey" PRIMARY KEY ("databaseNotificationID")
);

-- CreateTable
CREATE TABLE "tblAPIKeys" (
    "apiKeyID" SERIAL NOT NULL,
    "tenantID" INTEGER NOT NULL,
    "apiKey" VARCHAR NOT NULL,
    "apiKeyTitle" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDisabled" BOOLEAN NOT NULL,
    "creatorID" INTEGER NOT NULL,

    CONSTRAINT "tblAPIKeys_pkey" PRIMARY KEY ("apiKeyID")
);

-- CreateTable
CREATE TABLE "tblAPIKeyRoleMappings" (
    "apiKeyID" INTEGER NOT NULL,
    "roleID" INTEGER NOT NULL,

    CONSTRAINT "tblAPIKeyRoleMappings_pkey" PRIMARY KEY ("apiKeyID","roleID")
);

-- CreateIndex
CREATE UNIQUE INDEX "uniquetblUsersTenantsRelationship" ON "tblUsersTenantsRelationship"("tenantID", "userID");

-- AddForeignKey
ALTER TABLE "tblTenants" ADD CONSTRAINT "fktblTenantstblUsersCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUsersTenantsRelationship" ADD CONSTRAINT "fkTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUsersTenantsRelationship" ADD CONSTRAINT "fkUserIDUserID" FOREIGN KEY ("userID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatabaseQueries" ADD CONSTRAINT "fkTblDatabaseQueriesCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatabaseQueries" ADD CONSTRAINT "fkTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblRolePermissionMappings" ADD CONSTRAINT "fktblRolePermissionMappingsPermission" FOREIGN KEY ("permissionID") REFERENCES "tblPermissions"("permissionID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblRolePermissionMappings" ADD CONSTRAINT "fktblRolePermissionMappingsRole" FOREIGN KEY ("roleID") REFERENCES "tblRoles"("roleID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblRoles" ADD CONSTRAINT "fktblRolesTenantIDTblTenantsTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserTenantRoleMappings" ADD CONSTRAINT "fkUserTenantRoleRole" FOREIGN KEY ("roleID") REFERENCES "tblRoles"("roleID") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserTenantRoleMappings" ADD CONSTRAINT "fkUserTenantRoleUserTenant" FOREIGN KEY ("tenantID", "userID") REFERENCES "tblUsersTenantsRelationship"("tenantID", "userID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatabaseChartQueryMappings" ADD CONSTRAINT "tblDatabaseChartQueryMappings_databaseChartID_fkey" FOREIGN KEY ("databaseChartID") REFERENCES "tblDatabaseCharts"("databaseChartID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatabaseChartQueryMappings" ADD CONSTRAINT "tblDatabaseChartQueryMappings_dataQueryID_fkey" FOREIGN KEY ("dataQueryID") REFERENCES "tblDatabaseQueries"("dataQueryID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatabaseCharts" ADD CONSTRAINT "fkTblDatabaseChartsCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatabaseCharts" ADD CONSTRAINT "fkTblDatabaseChartsTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDashboardChartMappings" ADD CONSTRAINT "tblDashboardChartMappings_databaseChartID_fkey" FOREIGN KEY ("databaseChartID") REFERENCES "tblDatabaseCharts"("databaseChartID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDashboardChartMappings" ADD CONSTRAINT "tblDashboardChartMappings_dashboardID_fkey" FOREIGN KEY ("dashboardID") REFERENCES "tblDashboards"("dashboardID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDashboards" ADD CONSTRAINT "fkTblDashboardCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDashboards" ADD CONSTRAINT "fkTblDashboardsTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserTenantConfigMap" ADD CONSTRAINT "fkTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserTenantConfigMap" ADD CONSTRAINT "fkUserIDUserID" FOREIGN KEY ("userID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserNotifications" ADD CONSTRAINT "fkTblUserNotificationsTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblUserNotifications" ADD CONSTRAINT "fkTblUserNotificationsUserIDUserID" FOREIGN KEY ("userID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWidgetQueryMappings" ADD CONSTRAINT "fk_tblWidgetQueryMappings_tblDatabaseQueries" FOREIGN KEY ("dataQueryID") REFERENCES "tblDatabaseQueries"("dataQueryID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWidgetQueryMappings" ADD CONSTRAINT "fk_tblWidgetQueryMappings_tblWidgets" FOREIGN KEY ("widgetID") REFERENCES "tblWidgets"("widgetID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWidgets" ADD CONSTRAINT "fkTblWidgetsCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblWidgets" ADD CONSTRAINT "fkTblWidgetsTenantIDTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblDatabaseNotifications" ADD CONSTRAINT "fkTblDatabaseNotificationsTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblAPIKeys" ADD CONSTRAINT "fkTblAPIKeysCreatorID" FOREIGN KEY ("creatorID") REFERENCES "tblUsers"("userID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblAPIKeys" ADD CONSTRAINT "fkTblAPIKeysTenantID" FOREIGN KEY ("tenantID") REFERENCES "tblTenants"("tenantID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblAPIKeyRoleMappings" ADD CONSTRAINT "tblAPIKeyRoleMappings_apiKeyID_fkey" FOREIGN KEY ("apiKeyID") REFERENCES "tblAPIKeys"("apiKeyID") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tblAPIKeyRoleMappings" ADD CONSTRAINT "tblAPIKeyRoleMappings_roleID_fkey" FOREIGN KEY ("roleID") REFERENCES "tblRoles"("roleID") ON DELETE NO ACTION ON UPDATE NO ACTION;
