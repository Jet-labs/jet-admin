import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from '@jet-admin/ui';
import { AppPageMetaContext } from '../../../logic/appPageRuntime/AppPageRuntimeProvider';
import { useAppPageStateTree } from '../../../logic/appPageRuntime/useAppPageStateTree';
import { useAppPageDispatch } from '../../../logic/appPageRuntime/useAppPageDispatch';
import { appPageActions } from '../../../logic/appPageRuntime/appPageActions';
import { submitDataCollectionAPI } from '../../../data/apis/workflow';
import { displayError } from '../../../utils/notification';
import { WorkflowDataCollectionModal } from '../workflowComponents/workflowDataCollectionModal';

/** Reuse the workflow editor's form/approval UI in both AppPage modes. */
export function AppPageWorkflowInputHost() {
  const { tenantID } = useContext(AppPageMetaContext);
  const tree = useAppPageStateTree();
  const dispatch = useAppPageDispatch();
  const [dismissed, setDismissed] = useState(new Set());
  const [submitting, setSubmitting] = useState(null);
  const submittingIDs = useRef(new Set());
  const mounted = useRef(true);
  const pending = Object.entries(tree.workflows || {}).flatMap(([alias, result]) =>
    (result.pendingRequests || []).map(request => ({ alias, instanceID: result.instanceID, request })));
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const ids = pending.map(item => item.request.collectionRequestID).sort().join('|');
  useEffect(() => {
    const active = new Set(pendingRef.current.map(item => item.request.collectionRequestID));
    setDismissed(previous => [...previous].every(id => active.has(id)) ? previous : new Set([...previous].filter(id => active.has(id))));
  }, [ids]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const selected = pending.find(item => !dismissed.has(item.request.collectionRequestID));
  const submit = async data => {
    if (!selected || submittingIDs.current.has(selected.request.collectionRequestID)) return;
    const { alias, instanceID, request } = selected;
    submittingIDs.current.add(request.collectionRequestID);
    setSubmitting(request.collectionRequestID);
    try {
      await submitDataCollectionAPI({ tenantID, collectionRequestID: request.collectionRequestID, submittedData: data });
      if (mounted.current) dispatch(appPageActions.acknowledgeWorkflowRequest(alias, request.collectionRequestID, instanceID));
    } catch (error) {
      if (mounted.current && pendingRef.current.some(item => item.request.collectionRequestID === request.collectionRequestID)) displayError(error?.message || 'Submission failed. Your input has been kept; please retry.');
    } finally {
      submittingIDs.current.delete(request.collectionRequestID);
      if (mounted.current) setSubmitting(previous => previous === request.collectionRequestID ? null : previous);
    }
  };
  if (!pending.length) return null;
  return (
    <div className="flex flex-wrap gap-2" aria-label="Workflows awaiting input">
      {pending.map(item => (
        <Button key={item.request.collectionRequestID} type="button" variant="outline" size="sm"
          onClick={() => setDismissed(previous => { const next = new Set(previous); next.delete(item.request.collectionRequestID); return next; })}>
          Review input: {item.alias}
        </Button>
      ))}
      {selected && <WorkflowDataCollectionModal key={selected.request.collectionRequestID} request={selected.request}
        isSubmitting={submitting === selected.request.collectionRequestID} onSubmit={submit}
        onDismiss={() => setDismissed(previous => new Set([...previous, selected.request.collectionRequestID]))} />}
    </div>
  );
}
