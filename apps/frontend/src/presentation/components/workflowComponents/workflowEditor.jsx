import React, { useCallback, useState, useMemo, useRef } from "react";
import { ArrowRightToLine, Braces, Clock, Code, Columns, Eraser, FileJson, GitBranch, Play, Repeat, Square, Terminal, Zap } from 'lucide-react';
import ReactFlow, {
    ReactFlowProvider,
    Controls,
    MiniMap,
    Background,
    Panel,
    useReactFlow,
    applyNodeChanges, // Required to handle dragging/selection
    applyEdgeChanges, // Required to handle edge interactions
    addEdge,          // Required to create valid connections
    ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css"; // Ensure styles are imported
import dagre from "dagre";
import { WorkflowDataCollectionModal } from "./workflowDataCollectionModal";

import { v4 as uuidv4 } from "uuid";
import PropTypes from "prop-types";
import { WORKFLOW_NODES_MAP, WorkflowNodesProvider } from "@jet-admin/workflow-nodes";
import { WORKFLOW_EDGES_MAP, WorkflowEdgeContext } from "@jet-admin/workflow-edges";
import { CONSTANTS } from "../../../constants";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "../ui/resizable";

import { useDataQueries } from "../../../logic/hooks/useDataQueries";
import { useDatasources } from "../../../logic/hooks/useDatasources";
import { WorkflowNodeConfigPanel } from "./workflowNodeConfigPanel";
import { WorkflowSchemaPanel } from "./workflowSchemaPanel";
import { WorkflowConsole } from "./workflowConsole";
import { WorkflowContextPanel } from "./workflowContextPanel";
import { WorkflowInputArgsPanel } from "./workflowInputArgsPanel";
import { WorkflowInputModal } from "./workflowInputModal";
import { DataQueryTestingPanel } from "../dataQueryComponents/dataQueryTestingPanel";
import { useParams } from "react-router-dom";
import { useWorkflowRun } from "./useWorkflowRun";
import { useEffect } from "react";

import { Button, Checkbox, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
// Dagre graph for auto-layout
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Node dimensions for layout calculation
const NODE_WIDTH = 340;
const NODE_HEIGHT = 80;

/**
 * Auto-layout nodes using dagre algorithm
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @param {string} direction - Layout direction: 'LR' (left-right) or 'TB' (top-bottom)
 * @returns {Array} Nodes with updated positions
 */
const getLayoutedNodes = (nodes, edges, direction = "LR") => {
    dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

    // Clear existing nodes/edges
    dagreGraph.nodes().forEach((n) => dagreGraph.removeNode(n));

    // Add nodes to dagre
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    // Add edges to dagre
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run the layout
    dagre.layout(dagreGraph);

    // Apply positions back to React Flow nodes
    return nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - NODE_WIDTH / 2,
                y: nodeWithPosition.y - NODE_HEIGHT / 2,
            },
        };
    });
};

// Create nodeTypes from the map
const nodeTypes = Object.entries(WORKFLOW_NODES_MAP).reduce((acc, [key, node]) => {
    acc[node.value] = node.component;
    return acc;
}, {});

const edgeTypes = Object.entries(WORKFLOW_EDGES_MAP).reduce((acc, [key, edge]) => {
    acc[edge.value] = edge.component;
    return acc;
}, {});

// Fit View Button Component (must be inside ReactFlow)
const FitViewButton = () => {
    const { fitView } = useReactFlow();
    return (
        <Panel position="top-right">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fitView({ padding: 0.2, maxZoom: 1.5, duration: 300 })}
                title="Fit View"
            >
                Fit View
            </Button>
        </Panel>
    );
};

export const WorkflowEditor = ({ workflowEditorForm }) => {
    // Destructure for cleaner access
    const { values, setFieldValue, errors, handleChange, handleBlur } = workflowEditorForm;
    const { tenantID } = useParams();
    const { dataQueries, refetchDataQueries } = useDataQueries(tenantID);
    const { datasources, refetchDatasources } = useDatasources(tenantID);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [showSchemaPanel, setShowSchemaPanel] = useState(false);

    // New Hook for Workflow Execution
    const {
        isRunning: isTestRunning,
        result: testResult,
        nodeExecutionStatus,
        logs: consoleLogs,
        context: workflowContext,
        startTestRun,
        stopRun: stopTestRun,
        clearLogs,
        clearRunState,
        dataCollectionRequest,
        submitCollectedData,  
    } = useWorkflowRun({ tenantID });

    // UI State only
    const [showConsole, setShowConsole] = useState(false);
    const [showContextPanel, setShowContextPanel] = useState(false);
    const [selectedQueryForTesting, setSelectedQueryForTesting] = useState(null);
    const [showInputModal, setShowInputModal] = useState(false);
    const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);
    const [isDataCollectionModalOpen, setIsDataCollectionModalOpen] = useState(false);


    // Auto-show console/context when run starts
    useEffect(() => {
        if (isTestRunning) {
            setShowConsole(true);
            setShowContextPanel(true);
        }
    }, [isTestRunning]);

    // Auto-show data collection modal when request arrives
    useEffect(() => {
        if (dataCollectionRequest) {
            setIsDataCollectionModalOpen(true);
        }
    }, [dataCollectionRequest]);

    const handleDataCollectionSubmit = useCallback(async (submittedData) => {
        setIsSubmittingCollection(true);
        try {
            await submitCollectedData(submittedData);
        } finally {
            setIsSubmittingCollection(false);
        }
    }, [submitCollectedData]);


    // 1. Handle Node Changes (Dragging, selecting, deleting)
    const onNodesChange = useCallback(
        (changes) => {
            const updatedNodes = applyNodeChanges(changes, values.nodes);
            setFieldValue("nodes", updatedNodes);
        },
        [values.nodes, setFieldValue]
    );

    // 2. Handle Edge Changes
    const onEdgesChange = useCallback(
        (changes) => {
            const updatedEdges = applyEdgeChanges(changes, values.edges);
            setFieldValue("edges", updatedEdges);
        },
        [values.edges, setFieldValue]
    );

    // 3. Handle Connections between nodes
    const onConnect = useCallback(
        (connection) => {
            const isErrorEdge = connection.sourceHandle === 'error';
            const currentEdgeType = values.edgeType || 'smoothstep';
            const newEdge = {
                ...connection,
                type: isErrorEdge ? 'error' : currentEdgeType,
                style: {
                    strokeWidth: 2,
                    stroke: isErrorEdge ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
                },
            };
            const updatedEdges = addEdge(newEdge, values.edges);
            setFieldValue("edges", updatedEdges);
        },
        [values.edges, values.edgeType, setFieldValue]
    );

    // 4. Add New Node logic
    const onAddNode = (type) => {
        const id = uuidv4();
        const position = {
            x: Math.random() * 400,
            y: Math.random() * 400,
        };

        const nodeConfig = WORKFLOW_NODES_MAP[type];
        if (!nodeConfig) return;

        let data = {
            ...nodeConfig.defaultValue,
            label: nodeConfig.label
        };
        // Specific overrides if needed, though defaultValue should handle most
        if (type === "dataQuery") {
            data = { ...data, dataQueryID: "" };
        }

        const newNode = {
            id,
            type: nodeConfig.value,
            position,
            data,
        };

        setFieldValue("nodes", [...values.nodes, newNode]);
    };


    const deleteEdge = useCallback((id) => {
        setFieldValue("edges", values.edges.filter((e) => e.id !== id));
    }, [values.edges, setFieldValue]);

    const updateEdge = useCallback((id, update) => {
        setFieldValue(
            "edges",
            values.edges.map((e) => (e.id === id ? { ...e, ...update } : e))
        );
    }, [values.edges, setFieldValue]);

    const onNodeClick = useCallback((event, node) => {
        setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const updateNodeData = useCallback((nodeId, newData) => {
        // Validate outputVariable uniqueness if it's being set
        if (newData.outputVariable) {
            const duplicate = values.nodes.find(n =>
                n.id !== nodeId &&
                n.data?.outputVariable === newData.outputVariable
            );
            if (duplicate) {
                alert(`Error: Output variable name "${newData.outputVariable}" is already used by node "${duplicate.data?.title || duplicate.type}".\n\nPlease choose a unique name.`);
                return; // Prevent update
            }
        }

        const updatedNodes = values.nodes.map(node => {
            if (node.id === nodeId) {
                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        });
        setFieldValue("nodes", updatedNodes);
    }, [values.nodes, setFieldValue]);

    const deleteNode = useCallback((nodeId) => {
        // Remove the node
        const updatedNodes = values.nodes.filter(node => node.id !== nodeId);
        // Remove any edges connected to this node
        const updatedEdges = values.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
        setFieldValue("nodes", updatedNodes);
        setFieldValue("edges", updatedEdges);
        setSelectedNodeId(null);
    }, [values.nodes, values.edges, setFieldValue]);

    // Auto-layout nodes using dagre
    const onAutoLayout = useCallback((direction = "TB") => {
        if (values.nodes.length === 0) return;
        const layoutedNodes = getLayoutedNodes(values.nodes, values.edges, direction);
        setFieldValue("nodes", layoutedNodes);
    }, [values.nodes, values.edges, setFieldValue]);

    // Update all existing edges when edge type changes
    const updateAllEdgesType = useCallback((newType) => {
        const updatedEdges = values.edges.map(edge => ({
            ...edge,
            type: edge.sourceHandle === 'error' ? 'error' : newType,
        }));
        setFieldValue("edges", updatedEdges);
    }, [values.edges, setFieldValue]);

    // Get workflow input args from options
    const workflowArgs = useMemo(() => {
        return values.workflowOptions?.args?.filter(arg => arg.key) || [];
    }, [values.workflowOptions?.args]);

    const hasRunState = useMemo(() => {
        return Boolean(testResult)
            || consoleLogs.length > 0
            || Object.keys(nodeExecutionStatus).length > 0
            || Object.keys(workflowContext).length > 0;
    }, [testResult, consoleLogs, nodeExecutionStatus, workflowContext]);

    // Execute test run wrapper
    const executeTestRun = useCallback((inputArgs) => {
        startTestRun({
            nodes: values.nodes,
            edges: values.edges,
            inputArgs
        });
    }, [startTestRun, values.nodes, values.edges]);


    // Handle Test Run button click - show modal if args exist
    const onTestRunClick = useCallback(() => {
        if (workflowArgs.length > 0) {
            setShowInputModal(true);
        } else {
            // No args, run directly with empty params
            executeTestRun({});
        }
    }, [workflowArgs, executeTestRun]);


    // Handle input modal submit
    const handleInputModalSubmit = useCallback((inputArgs) => {
        setShowInputModal(false);
        executeTestRun(inputArgs);
    }, [executeTestRun]);

    // Query testing callback for node configurators
    const handleQueryTest = useCallback((dataQueryID) => {
        const query = dataQueries.find(q => String(q.dataQueryID) === String(dataQueryID));
        if (query) {
            setSelectedQueryForTesting(query);
        }
    }, [dataQueries]);

    // Find selected node
    const selectedNode = values.nodes.find(n => n.id === selectedNodeId);

    return (
        <WorkflowNodesProvider
            dataQueries={dataQueries}
            datasources={datasources}
            strings={CONSTANTS.STRINGS}
            onRefreshDataQueries={refetchDataQueries}
            onRefreshDatasources={refetchDatasources}
            workflowNodes={values.nodes}
            workflowEdges={values.edges}
            workflowInputArgs={workflowArgs}
            nodeExecutionStatus={nodeExecutionStatus}
            tenantID={tenantID}
            onQueryTest={handleQueryTest}
        >
            <WorkflowEdgeContext.Provider value={{ deleteEdge, updateEdge }}>
                <ReactFlowProvider>
                    <ResizablePanelGroup
                        direction="horizontal"
                        autoSaveId={CONSTANTS.RESIZABLE_PANEL_KEYS.WORKFLOW_ADDITION_FORM_QUERY_EDITOR_SEPARATION}
                        className="!w-full !h-full relative"
                    >
                        {/* Sidebar Controls */}
                        <ResizablePanel defaultSize={20} className="flex flex-col h-full overflow-hidden">

                            <div className="flex-1 overflow-y-auto space-y-4 p-4 flex flex-col justify-start items-stretch bg-background">
                                <div>
                                    <label htmlFor="title" className="block mb-1.5 text-xs font-medium text-muted-foreground">
                                        {CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_NAME_FIELD_LABEL}
                                    </label>
                                    <Input
                                        type="text"
                                        name="title"
                                        id="title"
                                        className="w-full"
                                        placeholder={CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_NAME_FIELD_PLACEHOLDER}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.title}
                                    />
                                    {errors.title && (
                                        <p className="text-destructive text-xs mt-1">{errors.title}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider mb-0.5">Nodes</p>
                                    {Object.values(WORKFLOW_NODES_MAP)
                                        .filter(node => {
                                            if (node.value === 'dataQuery' && (!dataQueries || dataQueries.length === 0)) {
                                                return false;
                                            }
                                            return true;
                                        })
                                        .map((node) => (
                                            <Button
                                                key={node.value}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onAddNode(node.value)}
                                                className="justify-start bg-background hover:bg-muted font-medium border-border"
                                            >
                                                {node.value === 'start' && <Play className="size-3.5 mr-2 text-emerald-500" />}
                                                {node.value === 'dataQuery' && <Zap className="size-4 mr-2 text-blue-500" />}

                                                {node.value === 'javascript' && <Code className="size-4 mr-2 text-amber-500" />}
                                                {node.value === 'condition' && <GitBranch className="size-4 mr-2 text-indigo-500" />}
                                                {node.value === 'loop' && <Repeat className="size-4 mr-2 text-cyan-500" />}
                                                {node.value === 'delay' && <Clock className="size-4 mr-2 text-orange-500" />}
                                                {node.value === 'end' && <Square className="size-3.5 mr-2 text-destructive" />}
                                                {node.value === 'dataCollection' && <ArrowRightToLine className="size-4 mr-2 text-violet-500" />}
                                                {node.label}
                                            </Button>
                                        ))}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div>
                                        <label className="text-[10px] text-muted-foreground mb-1 block font-medium">Edge Style</label>
                                        <Select
                                            value={values.edgeType || 'smoothstep'}
                                            onValueChange={(val) => {
                                                setFieldValue("edgeType", val);
                                                updateAllEdgesType(val);
                                            }}
                                        >
                                            <SelectTrigger className="text-sm h-8">
                                                <SelectValue placeholder="Select style" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">Bezier (Curved)</SelectItem>
                                                <SelectItem value="straight">Straight</SelectItem>
                                                <SelectItem value="step">Step (Sharp)</SelectItem>
                                                <SelectItem value="smoothstep">Smooth Step</SelectItem>
                                                <SelectItem value="simplebezier">Simple Bezier</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] text-muted-foreground font-medium">Snap to Grid</label>
                                        <Checkbox
                                            checked={values.snapToGrid ?? true}
                                            onCheckedChange={(checked) => setFieldValue("snapToGrid", checked)}
                                        />
                                    </div>
                                </div>

                                <WorkflowInputArgsPanel workflowForm={workflowEditorForm} />

                                <div className="flex flex-col gap-2">
                                    <p className="text-[10px] font-bold text-muted-foreground tracking-wider">Actions</p>
                                    <div className="flex flex-row gap-2">
                                        <Button
                                            type="button"
                                            onClick={onTestRunClick}
                                            disabled={values.nodes.length === 0 || isTestRunning}
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <Play className="size-3 mr-2" />
                                            {isTestRunning ? "Running..." : "Test Run"}
                                        </Button>
                                        {isTestRunning && (
                                            <Button
                                                type="button"
                                                onClick={stopTestRun}
                                                variant="destructive"
                                                size="sm"
                                                square
                                                className="h-8 w-8"
                                                title="Stop Test"
                                            >
                                                <Square className="size-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={clearRunState}
                                        disabled={isTestRunning || !hasRunState}
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        title="Clear test run state"
                                    >
                                        <Eraser className="size-4 mr-2" />
                                        Clear
                                    </Button>
                                    {dataCollectionRequest && !isDataCollectionModalOpen && (
                                        <Button
                                            type="button"
                                            onClick={() => setIsDataCollectionModalOpen(true)}
                                            variant="outline"
                                            size="sm"
                                            className="w-full bg-violet-600/10 text-violet-600 border-violet-600/30 hover:bg-violet-600/20 active:bg-violet-600/30 animate-pulse font-medium shadow-sm transition-all"
                                        >
                                            <ArrowRightToLine className="size-4 mr-2" />
                                            Input Required
                                        </Button>
                                    )}
                                </div>

                                <div className="flex flex-row flex-wrap gap-1.5 mt-2">
                                    <Button
                                        type="button"
                                        onClick={() => onAutoLayout("TB")}
                                        disabled={values.nodes.length === 0}
                                        title="Auto-layout"
                                        variant="outline"
                                        size="sm"
                                        className="px-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <Columns className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowSchemaPanel(true)}
                                        title="View Schema"
                                        variant="outline"
                                        size="sm"
                                        className="px-2 text-muted-foreground hover:text-foreground"
                                    >
                                        <FileJson className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowConsole(!showConsole)}
                                        title={showConsole ? 'Hide Console' : 'Show Console'}
                                        variant="outline"
                                        size="sm"
                                        className={`px-2 flex items-center gap-1.5 transition-colors ${showConsole ? 'border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <Terminal className="size-4" />
                                        {consoleLogs.length > 0 && (
                                            <span className="px-1 py-0.5 text-[9px] font-bold bg-muted text-muted-foreground rounded-full leading-none min-w-[16px] text-center">
                                                {consoleLogs.length}
                                            </span>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowContextPanel(!showContextPanel)}
                                        title={showContextPanel ? 'Hide Context' : 'Show Context'}
                                        variant="outline"
                                        size="sm"
                                        className={`px-2 flex items-center gap-1.5 transition-colors ${showContextPanel ? 'border-primary text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <Braces className="size-4" />
                                        {Object.keys(workflowContext).filter(k => !k.startsWith('__')).length > 0 && (
                                            <span className="px-1 py-0.5 text-[9px] font-bold bg-muted text-muted-foreground rounded-full leading-none min-w-[16px] text-center">
                                                {Object.keys(workflowContext).filter(k => !k.startsWith('__')).length}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Canvas Area */}
                        <ResizablePanel defaultSize={80}>
                            <ResizablePanelGroup
                                direction="vertical"
                                autoSaveId="workflow-editor-canvas-terminal-split"
                                className="!h-full"
                            >
                                {/* ReactFlow Canvas */}
                                <ResizablePanel defaultSize={showConsole || showContextPanel ? 70 : 100} minSize={30}>
                                    <div className="h-full w-full relative bg-muted/30">
                                        <ReactFlow
                                            nodes={values.nodes}
                                            edges={values.edges}
                                            onNodesChange={onNodesChange}
                                            onEdgesChange={onEdgesChange}
                                            onConnect={onConnect}
                                            onNodeClick={onNodeClick}
                                            onPaneClick={onPaneClick}
                                            nodeTypes={nodeTypes}
                                            edgeTypes={edgeTypes}
                                            defaultEdgeOptions={{
                                                type: values.edgeType || 'smoothstep',
                                                animated: false,
                                                style: {
                                                    strokeWidth: 2,
                                                    stroke: 'hsl(var(--muted-foreground))',
                                                },
                                            }}
                                            connectionLineType={ConnectionLineType.SmoothStep}
                                            connectionLineStyle={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                                            snapToGrid={values.snapToGrid ?? true}
                                            snapGrid={[20, 20]}
                                            fitView
                                            fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }}
                                            className="bg-transparent"
                                            proOptions={{ hideAttribution: true }}
                                        >
                                            <Controls />
                                            <MiniMap />
                                            <Background variant="dots" gap={20} size={1} color="hsl(var(--border))" />
                                            <FitViewButton />
                                        </ReactFlow>

                                        {/* Configuration Panel Overlay */}
                                        {selectedNode && (
                                            <WorkflowNodeConfigPanel
                                                node={selectedNode}
                                                onChange={updateNodeData}
                                                onClose={() => setSelectedNodeId(null)}
                                                onDelete={deleteNode}
                                            />
                                        )}

                                        {/* Schema Viewer Panel */}
                                        {showSchemaPanel && (
                                            <WorkflowSchemaPanel
                                                values={values}
                                                onClose={() => setShowSchemaPanel(false)}
                                            />
                                        )}
                                    </div>
                                </ResizablePanel>

                                {/* Terminal Section - Console and Context */}
                                {(showConsole || showContextPanel) && (
                                    <>
                                        <ResizableHandle withHandle />
                                        <ResizablePanel defaultSize={30} minSize={15} maxSize={60}>
                                            <ResizablePanelGroup
                                                direction="horizontal"
                                                autoSaveId="workflow-editor-console-context-split"
                                                className="!h-full"
                                            >
                                                {/* Console Panel */}
                                                {showConsole && (
                                                    <ResizablePanel defaultSize={showContextPanel ? 50 : 100} minSize={25}>
                                                        <WorkflowConsole
                                                            logs={consoleLogs}
                                                            isRunning={isTestRunning}
                                                            onClear={clearLogs}
                                                            className="h-full rounded-none border-t-0 border-l-0"
                                                        />
                                                    </ResizablePanel>
                                                )}

                                                {/* Resize Handle between Console and Context */}
                                                {showConsole && showContextPanel && (
                                                    <ResizableHandle withHandle />
                                                )}

                                                {/* Context Panel */}
                                                {showContextPanel && (
                                                    <ResizablePanel defaultSize={showConsole ? 50 : 100} minSize={25}>
                                                        <WorkflowContextPanel
                                                            context={workflowContext}
                                                            isRunning={isTestRunning}
                                                            className="h-full rounded-none border-t-0 border-r-0"
                                                        />
                                                    </ResizablePanel>
                                                )}
                                            </ResizablePanelGroup>
                                        </ResizablePanel>
                                    </>
                                )}
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>

                    {/* Render Query Testing Panel when a query is selected for testing */}
                    {selectedQueryForTesting && (
                        <DataQueryTestingPanel
                            selectedQueryForTesting={selectedQueryForTesting}
                            setSelectedQueryForTesting={setSelectedQueryForTesting}
                        />
                    )}

                    {/* Workflow Input Modal */}
                    {showInputModal && (
                        <WorkflowInputModal
                            args={workflowArgs}
                            onSubmit={handleInputModalSubmit}
                            onClose={() => setShowInputModal(false)}
                        />
                    )}
                    {dataCollectionRequest && isDataCollectionModalOpen && (
                        <WorkflowDataCollectionModal
                            request={dataCollectionRequest}
                            onSubmit={handleDataCollectionSubmit}
                            onDismiss={() => setIsDataCollectionModalOpen(false)}
                            isSubmitting={isSubmittingCollection}
                        />
                    )}

                </ReactFlowProvider>
            </WorkflowEdgeContext.Provider>
        </WorkflowNodesProvider>
    );
};

WorkflowEditor.propTypes = {
    workflowEditorForm: PropTypes.shape({
        values: PropTypes.object.isRequired,
        setFieldValue: PropTypes.func.isRequired,
        errors: PropTypes.object,
        handleChange: PropTypes.func,
        handleBlur: PropTypes.func,
    }).isRequired,
};