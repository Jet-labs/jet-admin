import DeletableEdge from './edges/DeletableEdge';
import ErrorEdge from './edges/ErrorEdge';
import { WorkflowEdgeContext } from './context';

export const WORKFLOW_EDGES_MAP = {
    default: {
        value: 'default',
        label: 'Default',
        component: DeletableEdge,
    },
    deletable: {
        value: 'deletable',
        label: 'Deletable',
        component: DeletableEdge,
    },
    error: {
        value: 'error',
        label: 'Error',
        component: ErrorEdge,
    }
};

export { DeletableEdge, ErrorEdge, WorkflowEdgeContext };
