/**
 * Data Collection Service
 * Handles resuming a suspended workflow by injecting the user's submitted data
 * back into the results queue. The orchestrator then picks it up and advances
 * the DAG exactly as if the node had completed normally.
 */

const { addResult } = require('../../../config/queue.config');
const { stateManager } = require('../orchestrator/stateManager');
const Logger = require('../../../utils/logger');

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

    // ── 4. Re-inject into the results queue — this resumes the DAG ────────────
    const outputVariable = request.collectionConfig?.outputVariable || 'collectedData';

    await addResult({
        instanceID: request.instanceID,
        nodeID: request.nodeID,
        nodeType: 'dataCollection',
        outputVariable,
        status: 'success',
        output: { [outputVariable]: submittedData, success: true },
        nextHandle: 'output',
        queueDelay: 0,
        nodeAttempt: request.nodeAttempt ?? 1,
    });

    Logger.log('success', {
        message: 'dataCollectionService:workflowResumed',
        params: { collectionRequestID, instanceID: request.instanceID, nodeID: request.nodeID },
    });

    return { success: true, collectionRequestID };
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