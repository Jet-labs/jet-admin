const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../../../config/prisma.config');
const Logger = require('../../../utils/logger');
let timer = null;
let running = false;

async function deliverSubmission(request) {
  const token = uuidv4();
  const claimed = await prisma.tblWorkflowDataCollectionRequests.updateMany({
    where: {
      collectionRequestID: request.collectionRequestID, status: 'SUBMITTED', deliveredAt: null,
      OR: [{ deliveryLeaseUntil: null }, { deliveryLeaseUntil: { lte: new Date() } }],
    },
    data: { deliveryToken: token, deliveryLeaseUntil: new Date(Date.now() + 30000) },
  });
  if (!claimed.count) return false;
  try {
    const { signalHumanInput } = require('../temporal/service');
    await signalHumanInput({
      instanceID: request.instanceID, nodeID: request.nodeID,
      data: request.submittedData, collectionRequestID: request.collectionRequestID, waitID: request.waitID,
    });
    await prisma.tblWorkflowDataCollectionRequests.updateMany({
      where: { collectionRequestID: request.collectionRequestID, deliveryToken: token, status: 'SUBMITTED' },
      data: {
        deliveredAt: new Date(), deliveryToken: null, deliveryLeaseUntil: null,
        // Legacy histories have no consumption activity. New waits are marked
        // COMPLETED only by the workflow after reading the canonical DB input.
        ...(!request.waitID ? { status: 'COMPLETED' } : {}),
      },
    });
    return true;
  } catch (error) {
    await prisma.tblWorkflowDataCollectionRequests.updateMany({
      where: { collectionRequestID: request.collectionRequestID, deliveryToken: token, status: 'SUBMITTED' },
      data: { deliveryToken: null, deliveryLeaseUntil: null },
    }).catch(() => {});
    Logger.log('warning', { message: 'humanInput:deliveryQueued', params: { collectionRequestID: request.collectionRequestID, error: error.message } });
    return false;
  }
}

async function flushSubmissions() {
  if (running) return;
  running = true;
  try {
    const requests = await prisma.tblWorkflowDataCollectionRequests.findMany({
      where: { status: 'SUBMITTED', deliveredAt: null },
      orderBy: { updatedAt: 'asc' }, take: 50,
    });
    for (const request of requests) await deliverSubmission(request);
  } catch (error) {
    Logger.log('warning', { message: 'humanInput:outboxUnavailable', params: { error: error.message } });
  } finally { running = false; }
}

function startSubmissionDelivery() {
  if (timer) return;
  flushSubmissions();
  timer = setInterval(flushSubmissions, 5000);
  timer.unref?.();
}
function stopSubmissionDelivery() {
  clearInterval(timer);
  timer = null;
}
module.exports = { deliverSubmission, flushSubmissions, startSubmissionDelivery, stopSubmissionDelivery };
