import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppPageRuntimeProvider } from '../src/logic/appPageRuntime/AppPageRuntimeProvider';
import { useAppPageDispatch } from '../src/logic/appPageRuntime/useAppPageDispatch';
import { useAppPageStateTree } from '../src/logic/appPageRuntime/useAppPageStateTree';
import { appPageActions } from '../src/logic/appPageRuntime/appPageActions';
import { AppPageWorkflowInputHost } from '../src/presentation/components/appPageComponents/appPageWorkflowInputHost';
import { submitDataCollectionAPI } from '../src/data/apis/workflow';
import { displayError } from '../src/utils/notification';

let mockModalProps;
jest.mock('@jet-admin/ui', () => ({ Button: 'button' }));
jest.mock('../src/presentation/components/workflowComponents/workflowDataCollectionModal', () => ({
  WorkflowDataCollectionModal: props => { mockModalProps = props; return require('react').createElement('workflow-form', { requestID: props.request.collectionRequestID }); },
}));
jest.mock('../src/data/apis/workflow', () => ({ submitDataCollectionAPI: jest.fn() }));
jest.mock('../src/utils/notification', () => ({ displayError: jest.fn() }));
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('AppPage human-input presentation and recovery', () => {
  let renderer, dispatch, tree;
  function Probe() { dispatch = useAppPageDispatch(); tree = useAppPageStateTree(); return null; }
  const request = id => ({ collectionRequestID: id, collectionType: 'approval', collectionConfig: { collectionType: 'approval', title: 'Approve fixture' } });
  const show = async (id = 'request', instanceID = 'run') => act(async () => {
    dispatch(appPageActions.setWorkflowLoading('q'));
    dispatch(appPageActions.setWorkflowResult('q', {}, null, true, instanceID));
    dispatch(appPageActions.setWorkflowRequests('q', [request(id)], instanceID));
  });
  beforeEach(async () => {
    jest.clearAllMocks(); mockModalProps = null;
    submitDataCollectionAPI.mockResolvedValue({ success: true });
    await act(async () => { renderer = TestRenderer.create(React.createElement(AppPageRuntimeProvider, { tenantID: 't', pageID: 'p' },
      React.createElement(Probe), React.createElement(AppPageWorkflowInputHost))); });
  });
  afterEach(async () => act(async () => renderer.unmount()));

  test('rediscovered pending request renders the existing approval form and submits through the real runtime dispatch', async () => {
    await show();
    expect(renderer.root.findAllByType('workflow-form')).toHaveLength(1);
    expect(mockModalProps.request.collectionRequestID).toBe('request');
    await act(async () => mockModalProps.onSubmit({ decision: 'approve' }));
    expect(submitDataCollectionAPI).toHaveBeenCalledWith({ tenantID: 't', collectionRequestID: 'request', submittedData: { decision: 'approve' } });
    expect(tree.workflows.q.pendingRequests).toEqual([]);
    expect(tree.workflows.q.isLoading).toBe(true);
  });

  test('dismissal keeps an explicit review action so the wait can be reopened', async () => {
    await show();
    await act(async () => mockModalProps.onDismiss());
    expect(renderer.root.findAllByType('workflow-form')).toHaveLength(0);
    await act(async () => renderer.root.findByType('button').props.onClick());
    expect(renderer.root.findAllByType('workflow-form')).toHaveLength(1);
  });

  test('submission failure keeps the form and input available for retry', async () => {
    await show();
    submitDataCollectionAPI.mockRejectedValueOnce(new Error('offline'));
    await act(async () => mockModalProps.onSubmit({ decision: 'approve' }));
    expect(displayError).toHaveBeenCalledWith('offline');
    expect(renderer.root.findAllByType('workflow-form')).toHaveLength(1);
  });

  test('acknowledged input cannot be reopened by a late duplicate request event', async () => {
    await show();
    await act(async () => mockModalProps.onSubmit({ decision: 'approve' }));
    await act(async () => dispatch(appPageActions.setWorkflowRequests('q', [request('request')], 'run')));
    expect(renderer.root.findAllByType('workflow-form')).toHaveLength(0);
  });

  test('terminal state clears the form and late old requests cannot revive it', async () => {
    await show();
    await act(async () => dispatch(appPageActions.setWorkflowResult('q', {}, null, false, 'run')));
    await act(async () => dispatch(appPageActions.setWorkflowRequests('q', [request('request')], 'run')));
    expect(renderer.root.findAllByType('workflow-form')).toHaveLength(0);
  });

  test('old submission completing after a new run starts cannot close its form', async () => {
    await show('old', 'old-run');
    let resolve;
    submitDataCollectionAPI.mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
    let pending;
    await act(async () => { pending = mockModalProps.onSubmit({ decision: 'approve' }); });
    await show('new', 'new-run');
    await act(async () => { resolve({ success: true }); await pending; });
    expect(mockModalProps.request.collectionRequestID).toBe('new');
    expect(tree.workflows.q.pendingRequests[0].collectionRequestID).toBe('new');
  });
  test('deployed input submits through application/run/alias provenance instead of the standalone endpoint', async () => {
    const submitWorkflowInput = jest.fn().mockResolvedValue({ success: true });
    await act(async () => renderer.update(React.createElement(AppPageRuntimeProvider, { tenantID: 't', pageID: 'p', runtimeServices: { identity: 'release1', executionEnabled: true, submitWorkflowInput } },
      React.createElement(Probe), React.createElement(AppPageWorkflowInputHost))));
    await show();
    await act(async () => mockModalProps.onSubmit({ decision: 'approve' }));
    expect(submitWorkflowInput).toHaveBeenCalledWith({ alias: 'q', instanceID: 'run', collectionRequestID: 'request', submittedData: { decision: 'approve' } });
    expect(submitDataCollectionAPI).not.toHaveBeenCalled();
  });
});
