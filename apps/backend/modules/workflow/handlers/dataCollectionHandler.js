/**
 * Data Collection Node Handler
 *
 * Pure handler — no DB access. Resolves templates from nodeConfig and returns
 * a "suspended" result. The orchestrator owns DB record creation so that
 * idempotency (P2002) can be enforced at the log-write layer.
 *
 * Supported collectionTypes
 * ─────────────────────────
 *   'form'  — JSON-Forms schema rendered in the frontend modal (active)
 *   'api'   — external system POSTs to the resume endpoint (stub, scope for later)
 */

const { ERROR_HANDLING, NEXT_HANDLE, serializeError } = require('./constants');
const Logger = require('../../../utils/logger');

/**
 * @param {object} nodeConfig
 * @param {string} nodeConfig.collectionType   'form' | 'api'
 * @param {string} nodeConfig.title            Modal heading (template-resolvable)
 * @param {string} nodeConfig.description      Instruction text (template-resolvable)
 * @param {object} nodeConfig.formSchema       JSON Schema for the form fields
 * @param {object} nodeConfig.formUischema     JSON-Forms UI schema
 * @param {string} nodeConfig.outputVariable   Context key for collected data
 * @param {number} nodeConfig.expiryMinutes    0 = no expiry
 * @param {string} nodeConfig.errorHandling
 * @param {object} context
 * @param {object} helpers
 */
async function execute(nodeConfig, context, helpers) {
    const {
        collectionType = 'form',
        title = 'Input required',
        description = '',
        formSchema = { type: 'object', properties: {} },
        formUischema = { type: 'VerticalLayout', elements: [] },
        outputVariable = 'collectedData',
        expiryMinutes = 60,
        errorHandling = ERROR_HANDLING.FAIL_WORKFLOW,
    } = nodeConfig ?? {};

    const { resolveTemplate } = helpers;
    const nodeID = helpers?.nodeID || 'dataCollection';
    const instanceID = helpers?.instanceID;

    Logger.log('info', {
      message: 'dataCollectionHandler:execute:params',
      params: { nodeID, instanceID, collectionType, outputVariable, expiryMinutes },
    });

    try {
        // Resolve any mustache templates that the author put into title/description
        const resolvedTitle = resolveTemplate(title);
        const resolvedDescription = resolveTemplate(description);

        // For 'api' type the config only needs the outputVariable and a webhook hint.
        // Full API-triggered resumption is outside current scope; the resume endpoint
        // already accepts any collectionType so adding the actual trigger is additive.

        const collectionConfig = {
            collectionType,
            title: resolvedTitle,
            description: resolvedDescription,
            formSchema,
            formUischema,
            outputVariable,
            expiryMinutes,
        };

        return {
            output: collectionConfig,   // orchestrator stores this on the DB record
            nextHandle: NEXT_HANDLE.OUTPUT,
            suspended: true,               // signal to taskWorker + orchestrator
        };

    } catch (err) {
        Logger.log('error', {
          message: 'dataCollectionHandler:execute:error',
          params: { nodeID: helpers?.nodeID, instanceID: helpers?.instanceID, error: err.message },
        });
        if (errorHandling === ERROR_HANDLING.FAIL_WORKFLOW) throw err;
        return {
            output: { [outputVariable]: null, success: false, error: serializeError(err) },
            nextHandle: NEXT_HANDLE.ERROR,
        };
    }
}

module.exports = { execute };