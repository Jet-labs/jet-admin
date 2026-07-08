import React from 'react';
import { DataQueryNode, DataQueryNodeConfigurator } from './nodes/dataQueryNode';
import { JavascriptNode, JavascriptNodeConfigurator } from './nodes/javascriptNode';
import { ConditionNode, ConditionNodeConfigurator } from './nodes/conditionNode';
import { StartNode, StartNodeConfigurator } from './nodes/startNode';
import { LoopNode, LoopNodeConfigurator } from './nodes/loopNode';
import { DelayNode, DelayNodeConfigurator } from './nodes/delayNode';
import { EndNode, EndNodeConfigurator } from './nodes/endNode';
import { DataCollectionNode, DataCollectionNodeConfigurator } from './nodes/dataCollectionNode';

export const WORKFLOW_NODE_TYPES = {
    START: { value: 'start', label: 'Start' },
    DATA_QUERY: { value: 'dataQuery', label: 'Data Query' },
    CONNECTOR_PULL: { value: 'connectorPull', label: 'Connector Pull' },
    CONNECTOR_PUSH: { value: 'connectorPush', label: 'Connector Push' },
    JAVASCRIPT: { value: 'javascript', label: 'Javascript' },
    CONDITION: { value: 'condition', label: 'Condition' },
    LOOP: { value: 'loop', label: 'Loop' },
    DELAY: { value: 'delay', label: 'Delay' },
    END: { value: 'end', label: 'End' },
    DATA_COLLECTION: { value: 'dataCollection', label: 'Data Collection' },
};

export const WORKFLOW_NODES_MAP = {
    [WORKFLOW_NODE_TYPES.DATA_COLLECTION.value]: {
        label: WORKFLOW_NODE_TYPES.DATA_COLLECTION.label,
        value: WORKFLOW_NODE_TYPES.DATA_COLLECTION.value,
        component: DataCollectionNode,
        configurator: DataCollectionNodeConfigurator,
        defaultValue: {
            title: 'Input required',
            description: '',
            collectionType: 'form',
            fields: [
                { id: 'f1', key: 'response', label: 'Response', fieldType: 'text', required: true, placeholder: '', options: '' },
            ],
            formSchema: { type: 'object', properties: { response: { type: 'string', title: 'Response' } }, required: ['response'] },
            formUischema: { type: 'VerticalLayout', elements: [{ type: 'Control', scope: '#/properties/response' }] },
            outputVariable: 'collectedData',
            expiryMinutes: 60,
            isDisabled: false,
        },
    },
    [WORKFLOW_NODE_TYPES.DATA_QUERY.value]: {
        label: WORKFLOW_NODE_TYPES.DATA_QUERY.label,
        value: WORKFLOW_NODE_TYPES.DATA_QUERY.value,
        component: DataQueryNode,
        configurator: DataQueryNodeConfigurator,
        defaultValue: {
            title: "Data Query",
            description: "",
            dataQueryID: "",
            inputValues: {},
            outputVariable: "queryResult",
            timeoutSeconds: 300,
            retryLimit: 0,
            retryDelaySeconds: 5,
            errorHandling: "fail_workflow",
            isDisabled: false,
        },
        schema: {
            type: "object",
            properties: {
                title: { type: "string", title: "Node Title" },
                description: { type: "string", title: "Description" },
                dataQueryID: { type: "string", title: "Data Query" }, // Schema populated dynamically in DataQueryNodeConfigurator
                outputVariable: {
                    type: "string",
                    title: "Output Variable Name",
                    pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$",
                    default: "queryResult"
                },
                timeoutSeconds: {
                    type: "integer",
                    title: "Timeout (seconds)",
                    minimum: 1,
                    maximum: 3600,
                    default: 300
                },
                retryLimit: {
                    type: "integer",
                    title: "Retry Attempts",
                    minimum: 0,
                    maximum: 10,
                    default: 0
                },
                retryDelaySeconds: {
                    type: "integer",
                    title: "Retry Delay (seconds)",
                    minimum: 1,
                    maximum: 300,
                    default: 5
                },
                errorHandling: {
                    type: "string",
                    title: "Error Behavior",
                    enum: ["fail_workflow", "continue", "retry_then_continue", "retry_then_fail"],
                    default: "fail_workflow"
                },
                isDisabled: {
                    type: "boolean",
                    title: "Skip this node",
                    default: false
                },
                // Inputs added dynamically
            },
            required: ["dataQueryID"],
        },
        uischema: {
            type: "Categorization",
            elements: [
                {
                    type: "Category",
                    label: "General",
                    elements: [
                        { type: "Control", scope: "#/properties/title" },
                        { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
                        { type: "Control", scope: "#/properties/dataQueryID" },
                    ],
                },
                {
                    type: "Category",
                    label: "Output",
                    elements: [
                        { type: "Control", scope: "#/properties/outputVariable" },
                    ],
                },
                {
                    type: "Category",
                    label: "Advanced",
                    elements: [
                        { type: "Control", scope: "#/properties/timeoutSeconds" },
                        { type: "Control", scope: "#/properties/retryLimit" },
                        { type: "Control", scope: "#/properties/retryDelaySeconds" },
                        { type: "Control", scope: "#/properties/errorHandling" },
                        { type: "Control", scope: "#/properties/isDisabled" },
                    ],
                },
            ],
        },
    },
    [WORKFLOW_NODE_TYPES.JAVASCRIPT.value]: {
        label: WORKFLOW_NODE_TYPES.JAVASCRIPT.label,
        value: WORKFLOW_NODE_TYPES.JAVASCRIPT.value,
        component: JavascriptNode,
        configurator: JavascriptNodeConfigurator,
        defaultValue: {
            title: "JavaScript",
            description: "",
            code: "// Your JavaScript code here\n// Access context: ctx.variableName\n// Return a value to store in outputVariable\nreturn true;",
            outputVariable: "scriptResult",
            timeoutSeconds: 30,
            retryLimit: 0,
            retryDelaySeconds: 5,
            errorHandling: "fail_workflow",
            isDisabled: false,
        },
        schema: {
            type: "object",
            properties: {
                title: { type: "string", title: "Node Title" },
                description: { type: "string", title: "Description" },
                code: { type: "string", title: "JavaScript Code" },
                outputVariable: {
                    type: "string",
                    title: "Output Variable Name",
                    pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$",
                    default: "scriptResult"
                },
                timeoutSeconds: {
                    type: "integer",
                    title: "Timeout (seconds)",
                    minimum: 1,
                    maximum: 300,
                    default: 30
                },
                retryLimit: {
                    type: "integer",
                    title: "Retry Attempts",
                    minimum: 0,
                    maximum: 10,
                    default: 0
                },
                retryDelaySeconds: {
                    type: "integer",
                    title: "Retry Delay (seconds)",
                    minimum: 1,
                    maximum: 300,
                    default: 5
                },
                errorHandling: {
                    type: "string",
                    title: "Error Behavior",
                    enum: ["fail_workflow", "continue", "retry_then_continue", "retry_then_fail"],
                    default: "fail_workflow"
                },
                isDisabled: {
                    type: "boolean",
                    title: "Skip this node",
                    default: false
                },
            },
            required: ["code"],
        },
        uischema: {
            type: "Categorization",
            elements: [
                {
                    type: "Category",
                    label: "General",
                    elements: [
                        { type: "Control", scope: "#/properties/title" },
                        { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
                        { type: "Control", scope: "#/properties/code", options: { format: "code-javascript", multi: true, rows: 12 } },
                    ],
                },
                {
                    type: "Category",
                    label: "Output",
                    elements: [
                        { type: "Control", scope: "#/properties/outputVariable" },
                    ],
                },
                {
                    type: "Category",
                    label: "Advanced",
                    elements: [
                        { type: "Control", scope: "#/properties/timeoutSeconds" },
                        { type: "Control", scope: "#/properties/retryLimit" },
                        { type: "Control", scope: "#/properties/retryDelaySeconds" },
                        { type: "Control", scope: "#/properties/errorHandling" },
                        { type: "Control", scope: "#/properties/isDisabled" },
                    ],
                },
            ],
        },
    },
    [WORKFLOW_NODE_TYPES.CONDITION.value]: {
        label: WORKFLOW_NODE_TYPES.CONDITION.label,
        value: WORKFLOW_NODE_TYPES.CONDITION.value,
        component: ConditionNode,
        configurator: ConditionNodeConfigurator,
        defaultValue: {
            title: "Condition",
            description: "",
            branches: [
                {
                    id: "branch_1",
                    name: "Branch 1",
                    conditionType: "expression",
                    expression: "true",
                    leftOperand: "",
                    rightOperand: "",
                },
            ],
            evaluationMode: "first_match",
            errorHandling: "fail_workflow",
            isDisabled: false,
        },
        schema: {
            type: "object",
            properties: {
                title: { type: "string", title: "Node Title" },
                description: { type: "string", title: "Description" },
                branches: {
                    type: "array",
                    title: "Condition Branches",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string", title: "Branch Name" },
                            conditionType: {
                                type: "string",
                                title: "Condition Type",
                                enum: ["expression", "equals", "not_equals", "contains", "greater_than", "less_than", "is_empty", "is_not_empty", "regex"]
                            },
                            expression: { type: "string", title: "Expression" },
                            leftOperand: { type: "string", title: "Left Operand" },
                            rightOperand: { type: "string", title: "Right Operand" },
                        },
                    },
                },
                evaluationMode: {
                    type: "string",
                    title: "Evaluation Mode",
                    enum: ["first_match", "all_matches"],
                    default: "first_match"
                },
                errorHandling: {
                    type: "string",
                    title: "Error Behavior",
                    enum: ["fail_workflow", "continue_default"],
                    default: "fail_workflow"
                },
                isDisabled: {
                    type: "boolean",
                    title: "Skip this node",
                    default: false
                },
            },
            required: ["branches"],
        },
        uischema: {
            type: "Categorization",
            elements: [
                {
                    type: "Category",
                    label: "General",
                    elements: [
                        { type: "Control", scope: "#/properties/title" },
                        { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
                    ],
                },
                {
                    type: "Category",
                    label: "Advanced",
                    elements: [
                        { type: "Control", scope: "#/properties/evaluationMode" },
                        { type: "Control", scope: "#/properties/errorHandling" },
                        { type: "Control", scope: "#/properties/isDisabled" },
                    ],
                },
            ],
        },
    },
    [WORKFLOW_NODE_TYPES.START.value]: {
        label: WORKFLOW_NODE_TYPES.START.label,
        value: WORKFLOW_NODE_TYPES.START.value,
        component: StartNode,
        configurator: StartNodeConfigurator,
        defaultValue: {
            title: "Start",
            description: "",
            // Note: Input parameters are managed at workflow level (workflowOptions.inputDefinitions)
        },
        schema: {
            type: "object",
            properties: {
                title: { type: "string", title: "Node Title" },
                description: { type: "string", title: "Description" },
            },
        },
        uischema: {
            type: "VerticalLayout",
            elements: [
                { type: "Control", scope: "#/properties/title" },
                { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
            ],
        },
    },
    [WORKFLOW_NODE_TYPES.LOOP.value]: {
        label: WORKFLOW_NODE_TYPES.LOOP.label,
        value: WORKFLOW_NODE_TYPES.LOOP.value,
        component: LoopNode,
        configurator: LoopNodeConfigurator,
        defaultValue: {
            title: "Loop",
            description: "",
            sourceVariable: "",
            itemVariable: "item",
            indexVariable: "index",
            maxIterations: 1000,
            delayBetweenItems: 0,
            errorHandling: "fail_workflow",
            isDisabled: false,
        },
        schema: {
            type: "object",
            properties: {
                title: { type: "string", title: "Node Title" },
                description: { type: "string", title: "Description" },
                sourceVariable: { type: "string", title: "Source Array" },
                itemVariable: { type: "string", title: "Item Variable Name", pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$", default: "item" },
                indexVariable: { type: "string", title: "Index Variable Name", pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$", default: "index" },
                maxIterations: { type: "integer", title: "Max Iterations", minimum: 1, maximum: 100000, default: 1000 },
                delayBetweenItems: { type: "integer", title: "Delay Between Items (ms)", minimum: 0, maximum: 60000, default: 0 },
                errorHandling: { type: "string", title: "Error Behavior", enum: ["fail_workflow", "continue", "skip_item"], default: "fail_workflow" },
                isDisabled: { type: "boolean", title: "Skip this node", default: false },
            },
            required: ["sourceVariable", "itemVariable"],
        },
        uischema: {
            type: "Categorization",
            elements: [
                {
                    type: "Category",
                    label: "General",
                    elements: [
                        { type: "Control", scope: "#/properties/title" },
                        { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
                    ],
                },
                {
                    type: "Category",
                    label: "Loop Config",
                    elements: [
                        { type: "Control", scope: "#/properties/sourceVariable" },
                        { type: "Control", scope: "#/properties/itemVariable" },
                        { type: "Control", scope: "#/properties/indexVariable" },
                    ],
                },
                {
                    type: "Category",
                    label: "Advanced",
                    elements: [
                        { type: "Control", scope: "#/properties/maxIterations" },
                        { type: "Control", scope: "#/properties/delayBetweenItems" },
                        { type: "Control", scope: "#/properties/errorHandling" },
                        { type: "Control", scope: "#/properties/isDisabled" },
                    ],
                },
            ],
        },
    },
    [WORKFLOW_NODE_TYPES.DELAY.value]: {
        label: WORKFLOW_NODE_TYPES.DELAY.label,
        value: WORKFLOW_NODE_TYPES.DELAY.value,
        component: DelayNode,
        configurator: DelayNodeConfigurator,
        defaultValue: {
            title: "Delay",
            description: "",
            delayType: "fixed",
            delayMs: 0,
            delaySeconds: 1,
            delayMinutes: 0,
            delayVariable: "",
            untilTime: "",
            isDisabled: false,
        },
        schema: {
            type: "object",
            properties: {
                title: { type: "string", title: "Node Title" },
                description: { type: "string", title: "Description" },
                delayType: { type: "string", title: "Delay Type", enum: ["fixed", "dynamic", "until"], default: "fixed" },
                delayMs: { type: "integer", title: "Milliseconds", minimum: 0, maximum: 999, default: 0 },
                delaySeconds: { type: "integer", title: "Seconds", minimum: 0, maximum: 59, default: 1 },
                delayMinutes: { type: "integer", title: "Minutes", minimum: 0, maximum: 1440, default: 0 },
                delayVariable: { type: "string", title: "Delay Variable" },
                untilTime: { type: "string", title: "Until Time" },
                isDisabled: { type: "boolean", title: "Skip this node", default: false },
            },
        },
        uischema: {
            type: "Categorization",
            elements: [
                {
                    type: "Category",
                    label: "General",
                    elements: [
                        { type: "Control", scope: "#/properties/title" },
                        { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
                    ],
                },
                {
                    type: "Category",
                    label: "Delay Config",
                    elements: [
                        { type: "Control", scope: "#/properties/delayType" },
                        { type: "Control", scope: "#/properties/delayMinutes" },
                        { type: "Control", scope: "#/properties/delaySeconds" },
                        { type: "Control", scope: "#/properties/delayMs" },
                    ],
                },
                {
                    type: "Category",
                    label: "Advanced",
                    elements: [
                        { type: "Control", scope: "#/properties/isDisabled" },
                    ],
                },
            ],
        },
    },
    [WORKFLOW_NODE_TYPES.END.value]: {
        label: WORKFLOW_NODE_TYPES.END.label,
        value: WORKFLOW_NODE_TYPES.END.value,
        component: EndNode,
        configurator: EndNodeConfigurator,
        defaultValue: {
            title: "End",
            description: "",
            status: "success",
            outputParameters: [],
        },
        schema: {
            type: "object",
            properties: {
                title: { type: "string", title: "Node Title" },
                description: { type: "string", title: "Description" },
                status: {
                    type: "string",
                    title: "Completion Status",
                    enum: ["success", "failure", "cancelled"],
                    default: "success",
                },
                outputParameters: {
                    type: "array",
                    title: "Output Parameters",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string", title: "Output Name", pattern: "^[a-zA-Z_][a-zA-Z0-9_]*$" },
                            sourceVariable: { type: "string", title: "Source Variable" },
                            description: { type: "string", title: "Description" },
                        },
                    },
                },
            },
        },
        uischema: {
            type: "VerticalLayout",
            elements: [
                { type: "Control", scope: "#/properties/title" },
                { type: "Control", scope: "#/properties/description", options: { multi: true, rows: 2 } },
                { type: "Control", scope: "#/properties/status" },
            ],
        },
    },
};

/**
 * Aggregated workflow node schemas, keyed by node type value.
 * Each entry has: nodeType, label, schema (JSON Schema), uischema (jsonforms UISchema), defaultValue.
 * Derived directly from WORKFLOW_NODES_MAP — no separate authoring needed.
 *
 * @type {Record<string, { nodeType: string, label: string, schema: object, uischema: object, defaultValue: object }>}
 */
export const WORKFLOW_NODE_SCHEMAS = Object.fromEntries(
  Object.values(WORKFLOW_NODES_MAP)
    .filter((n) => n.schema)
    .map((n) => [
      n.value,
      {
        nodeType: n.value,
        label: n.label,
        schema: n.schema,
        uischema: n.uischema,
        defaultValue: n.defaultValue,
      },
    ])
);

