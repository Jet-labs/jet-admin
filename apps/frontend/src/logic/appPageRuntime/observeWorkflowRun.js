import { getWorkflowRunStatusAPI } from '../../data/apis/workflow';
import { useSocketStore } from '../stores/useSocketStore';
import { retainSocketRoom } from './socketRoomLease';

const terminalStatuses = new Set(['COMPLETED', 'FAILED', 'CANCELLED', 'STOPPED']);

/** Observe, never execute/cancel. Socket loss is a transport state, not a run outcome. */
export function observeWorkflowRun({ tenantID, instanceID, onUpdate, onTerminal, onRequest, onObservationError, pollInterval = 2000 }) {
  let disposed = false, timer = null, polling = false, boundSocket = null;
  let unbind = () => {};
  const alive = () => !disposed;
  const receive = data => {
    if (!alive() || !data || (data.instanceID && data.instanceID !== instanceID)) return;
    if (terminalStatuses.has(data.status)) {
      disconnect();
      onTerminal?.(data);
    } else {
      onUpdate?.(data);
      for (const request of data.pendingDataCollectionRequests || []) onRequest?.(request);
    }
  };
  const poll = async () => {
    if (!alive() || polling) return;
    clearTimeout(timer);
    polling = true;
    try {
      const response = await getWorkflowRunStatusAPI({ tenantID, instanceID });
      if (alive()) receive(response?.data ?? response);
    } catch (error) {
      if (alive()) onObservationError?.(error);
    } finally {
      polling = false;
      if (alive()) timer = setTimeout(poll, pollInterval);
    }
  };
  const bind = socket => {
    if (!alive() || socket === boundSocket) return;
    unbind();
    boundSocket = socket;
    if (!socket) { unbind = () => {}; return; }
    const joined = acknowledgement => {
        if (!alive()) return;
        if (acknowledgement?.joined === false) onObservationError?.(new Error('Workflow subscription denied'));
        else poll();
    };
    const update = data => { if (data?.instanceID === instanceID) receive(data); };
    const request = data => { if (alive() && data?.instanceID === instanceID) onRequest?.(data); };
    socket.on('workflow_node_update', update);
    socket.on('workflow_status_update', update);
    socket.on('workflow_data_collection_request', request);
    socket.on('connect', poll);
    const releaseRoom = retainSocketRoom(socket, instanceID, { event: 'workflow_run_join', payload: { runId: instanceID }, onJoin: joined });
    unbind = () => {
      socket.off('workflow_node_update', update);
      socket.off('workflow_status_update', update);
      socket.off('workflow_data_collection_request', request);
      socket.off('connect', poll);
      releaseRoom();
    };
    poll();
  };
  let unsubscribeStore = () => {};
  function disconnect() {
    if (disposed) return;
    disposed = true;
    clearTimeout(timer);
    unbind();
    unsubscribeStore();
  }
  unsubscribeStore = useSocketStore.subscribe?.(state => bind(state.socket)) || (() => {});
  bind(useSocketStore.getState().socket);
  poll(); // Also works before a shared socket exists or after a missed terminal event.
  return { disconnect };
}
