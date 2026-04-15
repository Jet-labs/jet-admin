/**
 * Webhook Service
 * Business logic for webhook CRUD operations.
 * Called by controllers; delegates core processing to WebhookEngine.
 */
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const webhookEngine = require("./webhookEngine/engine");

const webhookService = {};

webhookService.createWebhook = async ({ tenantID, webhookTitle, webhookPath, authType, authConfig, status, workflows }) => {
  Logger.log("info", { message: "webhookService:createWebhook", params: { tenantID, webhookPath } });

  const webhook = await prisma.tblWebhooks.create({
    data: {
      tenantID,
      webhookTitle,
      webhookPath,
      authType,
      authConfig,
      status,
      tblWebhookListeners: {
        create: workflows?.map(wfID => ({ workflowID: wfID })) || []
      }
    },
    include: { tblWebhookListeners: true }
  });

  return webhook;
};

webhookService.getAllWebhooks = async ({ tenantID }) => {
  return prisma.tblWebhooks.findMany({
    where: { tenantID },
    include: { tblWebhookListeners: true }
  });
};

webhookService.updateWebhook = async ({ tenantID, webhookID, updateData, workflows }) => {
  // Fetch old webhook to invalidate cache for old path
  const oldWebhook = await prisma.tblWebhooks.findUnique({ where: { webhookID } });

  if (workflows) {
    await prisma.tblWebhookListeners.deleteMany({ where: { webhookID } });
  }

  const payload = { ...updateData };
  if (workflows) {
    payload.tblWebhookListeners = {
      create: workflows.map(wfID => ({ workflowID: wfID }))
    };
  }

  const webhook = await prisma.tblWebhooks.update({
    where: { webhookID, tenantID },
    data: payload,
    include: { tblWebhookListeners: true }
  });

  // Invalidate engine cache for old and new paths
  if (oldWebhook) webhookEngine.invalidateCache(tenantID, oldWebhook.webhookPath);
  webhookEngine.invalidateCache(tenantID, webhook.webhookPath);

  return webhook;
};

webhookService.deleteWebhook = async ({ tenantID, webhookID }) => {
  const webhook = await prisma.tblWebhooks.findUnique({ where: { webhookID } });

  const deleted = await prisma.tblWebhooks.delete({
    where: { webhookID, tenantID }
  });

  if (webhook) webhookEngine.invalidateCache(tenantID, webhook.webhookPath);

  return deleted;
};

module.exports = { webhookService };
