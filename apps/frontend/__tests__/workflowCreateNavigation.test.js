import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { WorkflowAdditionForm } from '../src/presentation/components/workflowComponents/workflowAdditionForm';

const mockNavigate = jest.fn(), mockGuard = jest.fn(), mockInvalidate = jest.fn();
let mockMutationOptions;
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
  useMutation: options => { mockMutationOptions = options; return { mutate: jest.fn(), isPending: false }; },
}));
jest.mock('../src/data/apis/workflow', () => ({ createWorkflowAPI: jest.fn() }));
jest.mock('../src/utils/notification', () => ({ displayError: jest.fn(), displaySuccess: jest.fn() }));
jest.mock('../src/utils/formValidation', () => ({ formValidations: {} }));
jest.mock('../src/constants', () => ({ CONSTANTS: {
  STRINGS: {}, REACT_QUERY_KEYS: { WORKFLOWS: tenant => tenant },
  ROUTES: { UPDATE_WORKFLOW_BY_ID: { path: (tenant, workflow) => `/tenants/${tenant}/workflows/${workflow}` } },
} }));
jest.mock('../src/logic/hooks/useUnsavedChangesGuard', () => ({ useUnsavedChangesGuard: value => mockGuard(value) }));
jest.mock('../src/presentation/components/workflowComponents/workflowEditor', () => ({ WorkflowEditor: 'workflow-editor' }));
jest.mock('@jet-admin/ui', () => ({ PageHeader: 'page-header' }));
global.IS_REACT_ACT_ENVIRONMENT = true;

test('saving a new workflow resets the dirty guard and opens its saved editor', async () => {
  let renderer;
  await act(async () => { renderer = TestRenderer.create(React.createElement(WorkflowAdditionForm, { tenantID: 'tenant' })); });
  const form = renderer.root.findByType('workflow-editor').props.workflowEditorForm;
  await act(async () => form.setFieldValue('title', 'Saved graph'));
  const submitted = renderer.root.findByType('workflow-editor').props.workflowEditorForm.values;
  await act(async () => mockMutationOptions.onSuccess({ workflowID: 'saved-id' }, submitted));
  expect(mockNavigate).toHaveBeenCalledWith('/tenants/tenant/workflows/saved-id', { replace: true });
  expect(mockGuard.mock.calls.at(-1)[0].isDirty).toBe(false);
  expect(renderer.root.findByType('workflow-editor').props.workflowEditorForm.values.title).toBe('Saved graph');
  await act(async () => renderer.unmount());
});
