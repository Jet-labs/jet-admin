/**
 * Data Collection Service — Temporal-only
 * Signals the DSL workflow via Temporal (replaces native queue injection).
 */

const { stateManager } = require('../workflowEngine/stateManager');
const Logger = require("../../../utils/logger");
const { isDeepStrictEqual } = require('node:util');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { deliverSubmission } = require('./submissionDelivery');

const dataCollectionService = {};

/**
 * Submit collected data for a pending request, resuming the workflow.
 *
 * @param {{ collectionRequestID: string, submittedData: object }} params
 * @returns {Promise<{ success: boolean, collectionRequestID: string }>}
 */
dataCollectionService.submitCollectionData = async ({ collectionRequestID, submittedData, tenantID }) => {
    Logger.log('info', {
        message: 'dataCollectionService:submitCollectionData',
        params: { collectionRequestID },
    });

    // ── 1. Load and validate the request ──────────────────────────────────────
    const request = await stateManager.getDataCollectionRequest(collectionRequestID);

    if (!request) {
        throw new Error(`Data collection request ${collectionRequestID} not found`);
    }
    const instance = await stateManager.getInstance(request.instanceID);
    if (!instance || (tenantID && instance.tenantID !== tenantID)) throw new Error('Request not found in tenant');
    if (!submittedData || typeof submittedData !== 'object' || Array.isArray(submittedData)) throw new Error('submittedData must be an object');
    // JSON-only canonical payload; reject cycles/unsupported values before CAS.
    const canonicalData = JSON.parse(JSON.stringify(submittedData));
    const schema = request.collectionConfig?.formSchema || { type: 'object' };
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    if (!validate(canonicalData)) {
        throw new Error(`Invalid submitted data: ${ajv.errorsText(validate.errors)}`);
    }
    if (request.collectionConfig?.requireComment && !String(canonicalData.comment || '').trim()) throw new Error('A comment is required');
    // `approvers` is currently explicitly display-only in the node editor;
    // execution authorization is enforced by the route, not inferred from text.
    if (request.status === 'COMPLETED' && isDeepStrictEqual(request.submittedData, canonicalData)) return { success: true, collectionRequestID, alreadyAccepted: true };
    const accepted = await stateManager.submitDataCollectionRequest(request, canonicalData);
    const delivered = accepted.status === 'COMPLETED' || accepted.deliveredAt || await deliverSubmission(accepted);
    Logger.log('success', {
        message: 'dataCollectionService:workflowResumed:temporal',
        params: { collectionRequestID, instanceID: request.instanceID, nodeID: request.nodeID },
    });
    return { success: true, collectionRequestID, driver: 'temporal', delivery: delivered ? 'delivered' : 'queued' };
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
