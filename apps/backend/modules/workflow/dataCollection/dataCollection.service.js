/**
 * Data Collection Service — Temporal-only
 * Signals the DSL workflow via Temporal (replaces native queue injection).
 */

const { stateManager } = require('../workflowEngine/stateManager');
const Logger = require("../../../utils/logger");

const dataCollectionService = {};

/**
 * Submit collected data for a pending request, resuming the workflow.
 *
 * @param {{ collectionRequestID: string, submittedData: object }} params
 * @returns {Promise<{ success: boolean, collectionRequestID: string }>}
 */
dataCollectionService.submitCollectionData = async ({ collectionRequestID, submittedData }) => {
    Logger.log('info', {
        message: 'dataCollectionService:submitCollectionData',
        params: { collectionRequestID },
    });

    // ── 1. Load and validate the request ──────────────────────────────────────
    const request = await stateManager.getDataCollectionRequest(collectionRequestID);

    if (!request) {
        throw new Error(`Data collection request ${collectionRequestID} not found`);
    }
    if (request.status !== 'PENDING') {
        throw new Error(`Request is already ${request.status} and cannot be submitted again`);
    }
    if (request.expiresAt && new Date() > new Date(request.expiresAt)) {
        // Mark expired then reject.
        await stateManager.completeDataCollectionRequest(collectionRequestID, null);
        // (We reuse completeDataCollectionRequest but ideally you'd set status='EXPIRED'.
        //  Add a dedicated updateStatus helper if you want the distinction.)
        throw new Error('Data collection request has expired');
    }

    // ── 2. Verify the workflow instance is still running ──────────────────────
    const instance = await stateManager.getInstance(request.instanceID);
    if (!instance || instance.status !== 'RUNNING') {
        throw new Error(`Workflow instance ${request.instanceID} is not in a RUNNING state`);
    }

    // ── 3. Persist the submitted data ─────────────────────────────────────────
    await stateManager.completeDataCollectionRequest(collectionRequestID, submittedData);

    // ── 4. Resume workflow via Temporal signal ───────────────────────────────
    const { signalHumanInput } = require('../temporal/service');
    await signalHumanInput({
        instanceID: request.instanceID,
        nodeID: request.nodeID,
        data: submittedData,
        collectionRequestID,
    });
    Logger.log('success', {
        message: 'dataCollectionService:workflowResumed:temporal',
        params: { collectionRequestID, instanceID: request.instanceID, nodeID: request.nodeID },
    });
    return { success: true, collectionRequestID, driver: 'temporal' };
};

/**
 * Fetch a single request (used by the frontend on page refresh to re-show the form).
 */
dataCollectionService.getCollectionRequest = async ({ collectionRequestID }) => {
    const request = await stateManager.getDataCollectionRequest(collectionRequestID);
    if (!request) throw new Error(`Request ${collectionRequestID} not found`);
    return request;
};

/**
 * All pending requests for an instance (for getRunStatus polling fallback).
 */
dataCollectionService.getPendingRequestsForInstance = async ({ instanceID }) => {
    return stateManager.getPendingDataCollectionRequests(instanceID);
};

module.exports = { dataCollectionService };