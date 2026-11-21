import { useState, useRef, useCallback, useEffect } from 'react';
import { testWorkflowAPI, executeWorkflowAPI, stopTestWorkflowAPI, cancelWorkflowAPI, submitDataCollectionAPI } from '../../../data/apis/workflow';
import { observeWorkflowRun } from '../../../logic/appPageRuntime/observeWorkflowRun';
import { extractError } from '../../../utils/error';

const nodeStatus = value => ({
    success: 'completed', completed: 'completed', running: 'running', suspended: 'suspended',
    failed: 'failed', error: 'failed', cancelled: 'cancelled', canceled: 'cancelled', skipped: 'skipped',
})[String(value || '').toLowerCase()];

/** One observer and one generation object per run; no callback can own a later run. */
export const useWorkflowRun = ({ tenantID }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [nodeExecutionStatus, setNodeExecutionStatus] = useState({});
    const [logs, setLogs] = useState([]);
    const [context, setContext] = useState({});
    const [dataCollectionRequest, setDataCollectionRequest] = useState(null);
    const current = useRef(null);
    const mounted = useRef(true);
    const tenant = useRef(tenantID);
    tenant.current = tenantID;
    const isCurrent = useCallback(run => mounted.current && current.current === run && run.tenantID === tenant.current, []);
    const addLog = useCallback((type, label, message, extra = {}) => {
        setLogs(previous => [...previous, { type, label, message, timestamp: Date.now(), ...extra }]);
    }, []);
    const clearLogs = useCallback(() => setLogs([]), []);
    const invalidate = useCallback(() => {
        const previous = current.current;
        previous?.observer?.disconnect();
        if (previous?.isTest && previous.instanceID && !previous.finished && !previous.stopping) {
            stopTestWorkflowAPI({ tenantID: previous.tenantID, instanceID: previous.instanceID }).catch(() => {});
        }
        current.current = null;
    }, []);
    const clearRunState = useCallback(() => {
        invalidate();
        setIsRunning(false); setResult(null); setNodeExecutionStatus({});
        setLogs([]); setContext({}); setDataCollectionRequest(null);
    }, [invalidate]);

    const requestStop = useCallback(async run => {
        run.stopRequested = true;
        if (!run.instanceID || run.stopping || run.finished) return;
        run.stopping = true;
        try {
            if (run.isTest) await stopTestWorkflowAPI({ tenantID: run.tenantID, instanceID: run.instanceID });
            else await cancelWorkflowAPI({ tenantID: run.tenantID, instanceID: run.instanceID });
            if (!isCurrent(run) || run.finished) return;
            if (run.isTest) {
                run.finished = true;
                run.observer?.disconnect();
                setIsRunning(false); setDataCollectionRequest(null);
                setResult({ instanceID: run.instanceID, status: 'CANCELLED' });
                setNodeExecutionStatus(previous => Object.fromEntries(Object.entries(previous).map(([key, value]) => [key, ['running', 'suspended'].includes(value) ? 'cancelled' : value])));
                addLog('info', 'Test stopped', 'Test instance terminated and deleted');
            } else {
                // Continue observing until Temporal confirms the terminal state.
                addLog('info', 'Cancellation requested', 'Waiting for the server to confirm cancellation');
            }
        } catch (error) {
            if (isCurrent(run)) addLog('warning', 'Cancellation failed', error?.message || String(error));
        } finally { run.stopping = false; }
    }, [addLog, isCurrent]);

    const observe = useCallback(run => {
        const update = data => {
            if (!isCurrent(run) || run.finished) return;
            if (data.contextData) setContext(data.contextData);
            const statuses = {};
            if (data.nodeID && nodeStatus(data.status)) {
                statuses[data.nodeID] = nodeStatus(data.status);
                const node = run.nodes.find(item => item.id === data.nodeID);
                addLog(statuses[data.nodeID] === 'failed' ? 'node_error' : statuses[data.nodeID] === 'completed' ? 'node_complete' : 'info',
                    `Node: ${node?.data?.title || node?.type || data.nodeID}`, statuses[data.nodeID], { nodeId: data.nodeID, output: data.output, error: data.error });
            }
            for (const event of data.logs || []) {
                if (event.nodeID && nodeStatus(event.nodeStatus)) statuses[event.nodeID] = nodeStatus(event.nodeStatus);
                if (run.seenLogs.has(event.logID)) continue;
                run.seenLogs.add(event.logID);
                if (event.errorMessage) addLog('node_error', 'Run history', event.errorMessage, { nodeId: event.nodeID });
            }
            if (Object.keys(statuses).length) setNodeExecutionStatus(previous => ({ ...previous, ...statuses }));
        };
        run.observer = observeWorkflowRun({
            tenantID: run.tenantID, instanceID: run.instanceID,
            onUpdate: update,
            onRequest: request => {
                if (!isCurrent(run) || run.finished || run.submitted.has(request.collectionRequestID)) return;
                setDataCollectionRequest(previous => previous?.collectionRequestID === request.collectionRequestID ? previous : request);
            },
            onTerminal: data => {
                if (!isCurrent(run) || run.finished) return;
                update(data);
                run.finished = true;
                setIsRunning(false); setResult(data); setDataCollectionRequest(null);
                const fallback = data.status === 'COMPLETED' ? 'skipped' : data.status === 'FAILED' ? 'failed' : 'cancelled';
                setNodeExecutionStatus(previous => Object.fromEntries(Object.entries(previous).map(([key, value]) => [key, ['running', 'suspended'].includes(value) ? fallback : value])));
                addLog(data.status === 'FAILED' ? 'workflow_error' : 'workflow_complete', `Workflow ${data.status.toLowerCase()}`, data.error || 'Server confirmed the final workflow state');
            },
            onObservationError: error => {
                if (isCurrent(run) && !run.finished && !run.observationWarning) {
                    run.observationWarning = true;
                    addLog('warning', 'Connection warning', error?.message || 'Retrying run observation');
                }
            },
        });
    }, [addLog, isCurrent]);

    const start = useCallback(async (options, isTest) => {
        clearRunState();
        const run = { tenantID, isTest, nodes: options.nodes || [], seenLogs: new Set(), submitted: new Set(), submitting: new Set(), stopRequested: false, finished: false };
        current.current = run;
        setIsRunning(true);
        addLog('start', isTest ? 'Test run started' : 'Run started', 'Starting workflow execution');
        try {
            const response = await (isTest ? testWorkflowAPI({ ...options, tenantID }) : executeWorkflowAPI({ tenantID, workflowID: options.workflowID, inputValues: options.inputValues }));
            run.instanceID = response.instanceID;
            if (!run.instanceID) throw new Error('No instanceID returned from workflow execution');
            if (!isCurrent(run)) {
                // Late test starts must not become orphan fixtures. Saved runs
                // are cancelled only if the user actually requested Stop.
                if (isTest) await stopTestWorkflowAPI({ tenantID: run.tenantID, instanceID: run.instanceID }).catch(() => {});
                else if (run.stopRequested) await cancelWorkflowAPI({ tenantID: run.tenantID, instanceID: run.instanceID }).catch(() => {});
                return;
            }
            addLog('info', 'Instance created', `Instance ID: ${run.instanceID}`);
            if (run.stopRequested && isTest) await requestStop(run);
            else {
                observe(run);
                if (run.stopRequested) await requestStop(run);
            }
        } catch (error) {
            if (!isCurrent(run)) return;
            addLog('workflow_error', 'Start failed', extractError(error) || error?.message || String(error));
            setIsRunning(false); setNodeExecutionStatus({}); setDataCollectionRequest(null);
        }
    }, [tenantID, clearRunState, isCurrent, addLog, observe, requestStop]);
    const startTestRun = useCallback(options => start(options, true), [start]);
    const startSavedRun = useCallback(options => start(options, false), [start]);
    const stopRun = useCallback(async () => {
        const run = current.current;
        if (run && isCurrent(run)) await requestStop(run);
    }, [isCurrent, requestStop]);

    const submitCollectedData = useCallback(async submittedData => {
        const run = current.current;
        const request = dataCollectionRequest;
        if (!run || !request || !isCurrent(run) || run.submitting.has(request.collectionRequestID)) return;
        run.submitting.add(request.collectionRequestID);
        try {
            await submitDataCollectionAPI({ tenantID: run.tenantID, collectionRequestID: request.collectionRequestID, submittedData });
            if (!isCurrent(run) || run.finished) return;
            run.submitted.add(request.collectionRequestID);
            setDataCollectionRequest(previous => previous?.collectionRequestID === request.collectionRequestID ? null : previous);
            addLog('info', 'Data submitted', 'Submission accepted; waiting for workflow to resume');
        } catch (error) {
            if (isCurrent(run)) addLog('workflow_error', 'Submission failed', error?.message || String(error));
        } finally { run.submitting.delete(request.collectionRequestID); }
    }, [dataCollectionRequest, isCurrent, addLog]);

    const previousTenant = useRef(tenantID);
    useEffect(() => {
        if (previousTenant.current !== tenantID) { previousTenant.current = tenantID; clearRunState(); }
    }, [tenantID, clearRunState]);
    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; invalidate(); };
    }, [invalidate]);

    return { isRunning, result, nodeExecutionStatus, dataCollectionRequest, logs, context,
        clearRunState, startTestRun, startSavedRun, stopRun, clearLogs, submitCollectedData };
};
