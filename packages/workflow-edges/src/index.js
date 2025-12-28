import React from 'react';
import DeletableEdge from './edges/DeletableEdge';
import ErrorEdge from './edges/ErrorEdge';
import { WorkflowEdgeContext } from './context';

// Create edge type wrapper components that pass the correct pathType
const SmoothStepEdge = (props) => <DeletableEdge {...props} pathType="smoothstep" />;
const StraightEdge = (props) => <DeletableEdge {...props} pathType="straight" />;
const StepEdge = (props) => <DeletableEdge {...props} pathType="step" />;
const BezierEdge = (props) => <DeletableEdge {...props} pathType="bezier" />;
const SimpleBezierEdge = (props) => <DeletableEdge {...props} pathType="simplebezier" />;

export const WORKFLOW_EDGES_MAP = {
    // Default bezier edge
    default: {
        value: 'default',
        label: 'Bezier (Curved)',
        component: BezierEdge,
    },
    // Smooth step edge (rounded corners)
    smoothstep: {
        value: 'smoothstep',
        label: 'Smooth Step',
        component: SmoothStepEdge,
    },
    // Straight edge
    straight: {
        value: 'straight',
        label: 'Straight',
        component: StraightEdge,
    },
    // Step edge (sharp corners)
    step: {
        value: 'step',
        label: 'Step',
        component: StepEdge,
    },
    // Simple bezier edge
    simplebezier: {
        value: 'simplebezier',
        label: 'Simple Bezier',
        component: SimpleBezierEdge,
    },
    // Error edge (red, for error handles)
    error: {
        value: 'error',
        label: 'Error',
        component: ErrorEdge,
    },
    // Deletable is an alias for default
    deletable: {
        value: 'deletable',
        label: 'Deletable',
        component: BezierEdge,
    },
};

export {
    DeletableEdge,
    ErrorEdge,
    WorkflowEdgeContext,
    SmoothStepEdge,
    StraightEdge,
    StepEdge,
    BezierEdge,
    SimpleBezierEdge,
};
