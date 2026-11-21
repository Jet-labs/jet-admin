import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useFormik } from 'formik';
import DeletableEdge from '../../../packages/workflow-edges/src/edges/DeletableEdge';
import { WorkflowInputDefinitionsPanel } from '../src/presentation/components/workflowComponents/workflowInputDefinitionsPanel';

jest.mock('@jet-admin/ui', () => ({
  Button: 'button', Input: 'input', Label: 'label', Checkbox: 'checkbox',
  CodeEditor: 'code-editor', Select: 'select', SelectTrigger: 'select-trigger',
  SelectValue: 'select-value', SelectContent: 'select-content', SelectItem: 'select-item',
}));
jest.mock('lucide-react', () => ({ Plus: 'plus-icon', Trash2: 'trash-icon' }));
jest.mock('reactflow', () => ({
  BaseEdge: () => null,
  EdgeLabelRenderer: ({ children }) => children,
  getBezierPath: () => ['', 0, 0], getSmoothStepPath: () => ['', 0, 0],
  getStraightPath: () => ['', 0, 0], getSimpleBezierPath: () => ['', 0, 0],
}));
const mockUpdateEdge = jest.fn();
jest.mock('../../../packages/workflow-edges/src/context', () => ({
  useWorkflowEdge: () => ({ updateEdge: mockUpdateEdge, deleteEdge: jest.fn() }),
}));
global.IS_REACT_ACT_ENVIRONMENT = true;

describe('workflow editor regression controls', () => {
  let renderer;
  afterEach(async () => {
    if (renderer) await act(async () => renderer.unmount());
    jest.clearAllMocks();
  });

  test('Enter commits an edge label without submitting the surrounding workflow form', async () => {
    await act(async () => { renderer = TestRenderer.create(React.createElement(DeletableEdge, { id: 'edge', label: 'old' })); });
    const label = renderer.root.findAll(node => node.type === 'div' && node.props.onClick)[0];
    await act(async () => label.props.onClick({ stopPropagation: jest.fn() }));
    await act(async () => renderer.root.findByType('input').props.onChange({ target: { value: 'new label' } }));
    const event = { key: 'Enter', preventDefault: jest.fn(), stopPropagation: jest.fn() };
    await act(async () => renderer.root.findByType('input').props.onKeyDown(event));
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockUpdateEdge).toHaveBeenCalledWith('edge', expect.objectContaining({ label: 'new label' }));
    expect(renderer.root.findByType('button').props.type).toBe('button');
  });

  test('edge labels follow reloaded props rather than retaining an obsolete local draft', async () => {
    await act(async () => { renderer = TestRenderer.create(React.createElement(DeletableEdge, { id: 'edge', label: 'old' })); });
    await act(async () => renderer.update(React.createElement(DeletableEdge, { id: 'edge', label: 'reloaded' })));
    expect(renderer.root.findAll(node => node.type === 'div' && node.children.includes('reloaded'))).toHaveLength(1);
  });

  test('batched parameter edits preserve defaults changed by another callback', async () => {
    let form;
    function Probe() {
      form = useFormik({ initialValues: { workflowOptions: { inputDefinitions: [
        { key: 'first', type: 'string', defaultValue: 'old' },
        { key: 'second', type: 'string', defaultValue: 'keep' },
      ] } }, onSubmit: () => {} });
      return React.createElement(WorkflowInputDefinitionsPanel, { workflowForm: form });
    }
    await act(async () => { renderer = TestRenderer.create(React.createElement(Probe)); });
    const inputs = renderer.root.findAllByType('input');
    const firstDefault = inputs.find(node => node.props.placeholder === 'Default first');
    const secondName = inputs.find(node => node.props.value === 'second');
    await act(async () => {
      firstDefault.props.onChange({ target: { value: 'updated' } });
      secondName.props.onChange({ target: { value: 'renamed' } });
    });
    expect(form.values.workflowOptions.inputDefinitions).toEqual([
      { key: 'first', type: 'string', defaultValue: 'updated' },
      { key: 'renamed', type: 'string', defaultValue: 'keep' },
    ]);
  });
});
