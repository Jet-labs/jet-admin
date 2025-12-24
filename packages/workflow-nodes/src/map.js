import React from 'react';
import { DataQueryNode, DataQueryNodeConfigurator } from './nodes/dataQueryNode';
import { JavascriptNode } from './nodes/javascriptNode';
import { ConditionNode } from './nodes/conditionNode';

export const WORKFLOW_NODE_TYPES = {
    DATA_QUERY: { value: 'dataQuery', label: 'Data Query' },
    JAVASCRIPT: { value: 'javascript', label: 'Javascript' },
    CONDITION: { value: 'condition', label: 'Condition' },
};

export const WORKFLOW_NODES_MAP = {
    [WORKFLOW_NODE_TYPES.DATA_QUERY.value]: {
        label: WORKFLOW_NODE_TYPES.DATA_QUERY.label,
        value: WORKFLOW_NODE_TYPES.DATA_QUERY.value,
        component: DataQueryNode,
        configurator: DataQueryNodeConfigurator,
        defaultValue: { dataQueryID: "", label: "Data Query", args: {} },
        schema: {
            type: "object",
            properties: {
                label: { type: "string", title: "Node Name" },
                dataQueryID: { type: "string", title: "Data Query", enum: [] }, // Enum populated dynamically
                // Args added dynamically
            },
            required: ["dataQueryID"],
        },
        uischema: {
            type: "VerticalLayout",
            elements: [
                { type: "Control", scope: "#/properties/label" },
                { type: "Control", scope: "#/properties/dataQueryID" },
            ],
        },
    },
    [WORKFLOW_NODE_TYPES.JAVASCRIPT.value]: {
        label: WORKFLOW_NODE_TYPES.JAVASCRIPT.label,
        value: WORKFLOW_NODE_TYPES.JAVASCRIPT.value,
        component: JavascriptNode,
        defaultValue: { label: "Script", code: "return true;" },
        schema: {
            type: "object",
            properties: {
                label: { type: "string", title: "Node Name" },
                code: { type: "string", title: "Code", description: "JavaScript code to execute" },
            },
            required: ["code"],
        },
        uischema: {
            type: "VerticalLayout",
            elements: [
                { type: "Control", scope: "#/properties/label" },
                { 
                    type: "Control", 
                    scope: "#/properties/code",
                    options: { multi: true, rows: 10, format: "javascript" } 
                },
            ],
        },
    },
    [WORKFLOW_NODE_TYPES.CONDITION.value]: {
        label: WORKFLOW_NODE_TYPES.CONDITION.label,
        value: WORKFLOW_NODE_TYPES.CONDITION.value,
        component: ConditionNode,
        defaultValue: { label: "Condition", condition: "true" },
        schema: {
            type: "object",
            properties: {
                label: { type: "string", title: "Node Name" },
                condition: { type: "string", title: "Condition Expression", description: "Evaluates to true/false" },
            },
            required: ["condition"],
        },
        uischema: {
            type: "VerticalLayout",
            elements: [
                { type: "Control", scope: "#/properties/label" },
                { type: "Control", scope: "#/properties/condition" },
            ],
        },
    },
};
