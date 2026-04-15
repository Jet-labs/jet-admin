const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const subscriptionEngine = require("./subscriptionEngine/engine");

const subscriptionService = {};

subscriptionService.createSubscription = async ({ tenantID, datasourceID, subscriptionTitle, subscriptionType, subscriptionConfig, status, workflows }) => {
  const subscription = await prisma.tblSubscriptions.create({
    data: {
      tenantID,
      datasourceID,
      subscriptionTitle,
      subscriptionType,
      subscriptionConfig,
      status,
      tblSubscriptionListeners: {
        create: workflows?.map(wfID => ({
          workflowID: wfID,
          listenerType: 'workflow'
        })) || []
      }
    },
    include: { tblSubscriptionListeners: true, tblDatasources: true }
  });

  if (subscription.status === 'active') {
    await subscriptionEngine.startSubscription(subscription);
  }

  return subscription;
};

subscriptionService.getAllSubscriptions = async ({ tenantID }) => {
  return prisma.tblSubscriptions.findMany({
    where: { tenantID },
    include: { tblSubscriptionListeners: true }
  });
};

subscriptionService.updateSubscription = async ({ tenantID, subscriptionID, updateData, workflows }) => {
  // Overwrite listeners fully for simplicity
  if (workflows) {
    await prisma.tblSubscriptionListeners.deleteMany({ where: { subscriptionID } });
  }

  const updatePayload = {
    ...updateData
  };

  if (workflows) {
    updatePayload.tblSubscriptionListeners = {
      create: workflows.map(wfID => ({
        workflowID: wfID,
        listenerType: 'workflow'
      }))
    };
  }

  const subscription = await prisma.tblSubscriptions.update({
    where: { subscriptionID, tenantID },
    data: updatePayload,
    include: { tblSubscriptionListeners: true, tblDatasources: true }
  });

  // Hot reload
  await subscriptionEngine.stopSubscription(subscription.subscriptionID);
  if (subscription.status === 'active') {
    await subscriptionEngine.startSubscription(subscription);
  }

  return subscription;
};

subscriptionService.deleteSubscription = async ({ tenantID, subscriptionID }) => {
  await subscriptionEngine.stopSubscription(subscriptionID);
  
  return prisma.tblSubscriptions.delete({
    where: { subscriptionID, tenantID }
  });
};

subscriptionService.startAllServerSubscriptions = async () => {
  Logger.log("info", { message: "subscriptionService:startAllServerSubscriptions:init" });
  try {
    const activeSubscriptions = await prisma.tblSubscriptions.findMany({
      where: { status: 'active' },
      include: {
        tblDatasources: true,
        tblSubscriptionListeners: {
          where: { isEnabled: true },
        },
      },
    });

    for (const sub of activeSubscriptions) {
      await subscriptionEngine.startSubscription(sub);
    }
  } catch (error) {
    Logger.log("error", { message: "subscriptionService:startAllFailed", params: { error: error.message } });
  }
};

module.exports = { subscriptionService };
