import React, { useCallback, useState, useMemo, useRef } from "react";
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
import { SiQuantconnect } from "react-icons/si";
import { FaCode, FaCodeBranch, FaPlay, FaStop } from "react-icons/fa";
import { TbLayoutDistributeHorizontal, TbRepeat } from "react-icons/tb";
import { VscJson, VscTerminal } from "react-icons/vsc";
import { IoMdTime } from "react-icons/io";
import { TbBraces } from "react-icons/tb";
import { useWorkflowState, useWorkflowActions } from "../../../logic/contexts/workflowContext";
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
            <button
                onClick={() => fitView({ padding: 0.2, maxZoom: 1.5, duration: 300 })}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded shadow-sm hover:bg-slate-50 transition-colors"
                title="Fit View"
            >
                Fit View
            </button>
        </Panel>
    );
};

export const WorkflowEditor = ({ workflowEditorForm }) => {
    // Destructure for cleaner access
    const { values, setFieldValue, errors, handleChange, handleBlur } = workflowEditorForm;
    const { tenantID } = useParams();
    const { dataQueries } = useWorkflowState();
    const { refetchDataQueries } = useWorkflowActions();
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
        clearLogs
    } = useWorkflowRun({ tenantID });

    // UI State only
    const [showConsole, setShowConsole] = useState(false);
    const [showContextPanel, setShowContextPanel] = useState(false);
    const [selectedQueryForTesting, setSelectedQueryForTesting] = useState(null);
    const [showInputModal, setShowInputModal] = useState(false);

    // Auto-show console/context when run starts
    useEffect(() => {
        if (isTestRunning) {
            setShowConsole(true);
            setShowContextPanel(true);
        }
    }, [isTestRunning]);



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
                    stroke: isErrorEdge ? '#ef4444' : '#94a3b8',
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
        console.log("updateNodeData", nodeId, newData);

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
                // Ensure label update propagates if strictly managed
                // NOTE: ReactFlow handles internal data updates but for formik state we need this
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

    // Reset node execution status
    // const resetNodeExecutionStatus = useCallback(() => {
    //     setNodeExecutionStatus({});
    // }, []);

    // Get workflow input args from options
    const workflowArgs = useMemo(() => {
        return values.workflowOptions?.args?.filter(arg => arg.key) || [];
    }, [values.workflowOptions?.args]);

    // Execute test run wrapper
    const executeTestRun = useCallback((inputParams) => {
        startTestRun({
            nodes: values.nodes,
            edges: values.edges,
            inputParams
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
    const handleInputModalSubmit = useCallback((inputParams) => {
        setShowInputModal(false);
        executeTestRun(inputParams);
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
            strings={CONSTANTS.STRINGS}
            onRefreshDataQueries={refetchDataQueries}
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
                        <ResizablePanel defaultSize={20} className="flex flex-col h-full overflow-hidden pb-20">

                            <div className="flex-1 overflow-y-auto space-y-3 p-3 flex flex-col justify-start items-stretch">


                            <div>
                                <label htmlFor="title" className="block mb-1 text-xs font-medium text-slate-500">
                                    {CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_NAME_FIELD_LABEL}
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    className="placeholder:text-slate-400 text-sm bg-white border border-slate-300 text-slate-700 rounded focus:ring-1 focus:ring-slate-400 block w-full px-2.5 py-1.5 mb-2"
                                    placeholder={CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_NAME_FIELD_PLACEHOLDER}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.title}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nodes</p>
                                {Object.values(WORKFLOW_NODES_MAP)
                                    .filter(node => {
                                        // Hide dataQuery node if no queries available
                                        if (node.value === 'dataQuery' && (!dataQueries || dataQueries.length === 0)) {
                                            return false;
                                        }
                                        return true;
                                    })
                                    .map((node) => (
                                    <button
                                        key={node.value}
                                        type="button"
                                        onClick={() => onAddNode(node.value)}
                                        className="px-3 py-2 text-left text-sm text-slate-700 bg-slate-100 rounded hover:bg-[#646cff]/10 transition-colors border-none hover:border-none"
                                    >
                                            {/* Icon mapping for node types */}
                                            {node.value === 'start' && <FaPlay className="inline-block h-3.5 w-3.5 mr-2 text-green-500" />}
                                            {node.value === 'dataQuery' && <SiQuantconnect className="inline-block h-4 w-4 mr-2 text-blue-500" />}
                                            {node.value === 'javascript' && <FaCode className="inline-block h-4 w-4 mr-2 text-yellow-500" />}
                                            {node.value === 'condition' && <FaCodeBranch className="inline-block h-4 w-4 mr-2 text-purple-500" />}
                                            {node.value === 'loop' && <TbRepeat className="inline-block h-4 w-4 mr-2 text-cyan-500" />}
                                            {node.value === 'delay' && <IoMdTime className="inline-block h-4 w-4 mr-2 text-amber-500" />}
                                            {node.value === 'end' && <FaStop className="inline-block h-3.5 w-3.5 mr-2 text-red-500" />}
                                        {node.label}
                                    </button>
                                ))}
                            </div>

                            {/* Settings Section */}
                            <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settings</p>
                                <div>
                                    <label className="text-[10px] text-slate-500 mb-1 block">Edge Style</label>
                                    <select
                                        value={values.edgeType || 'smoothstep'}
                                        onChange={(e) => {
                                            setFieldValue("edgeType", e.target.value);
                                            updateAllEdgesType(e.target.value);
                                        }}
                                        className="w-full px-2 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded focus:outline-none focus:border-[#646cff]"
                                    >
                                        <option value="default">Bezier (Curved)</option>
                                        <option value="straight">Straight</option>
                                        <option value="step">Step (Sharp corners)</option>
                                        <option value="smoothstep">Smooth Step (Rounded corners)</option>
                                        <option value="simplebezier">Simple Bezier</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-slate-500">Snap to Grid</label>
                                    <input
                                        type="checkbox"
                                        checked={values.snapToGrid ?? true}
                                        onChange={(e) => setFieldValue("snapToGrid", e.target.checked)}
                                        className="w-4 h-4 text-[#646cff] rounded border-slate-300 focus:ring-[#646cff]"
                                    />
                                </div>
                            </div>

                                {/* Input Arguments Section */}
                                <WorkflowInputArgsPanel workflowForm={workflowEditorForm} />

                            {/* Actions Section */}
                            <div className="flex flex-col gap-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</p>
                                    <div className="flex flex-row gap-2">
                                        <button
                                            type="button"
                                            onClick={onTestRunClick}
                                            disabled={values.nodes.length === 0 || isTestRunning}
                                            className="flex-1 px-3 py-2 text-left text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center border-none hover:border-none"
                                        >
                                            <FaPlay className="inline-block h-3 w-3 mr-2" />
                                            {isTestRunning ? "Running..." : "Test Run"}
                                        </button>
                                        {isTestRunning && (
                                            <button
                                                type="button"
                                                onClick={stopTestRun}
                                                className="px-3 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors flex items-center border-none hover:border-none"
                                                title="Stop Test"
                                            >
                                                <FaStop className="inline-block h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                            </div>

                                {/* Utilities - Minimal */}
                                <div className="flex flex-row flex-wrap gap-1">
                                    <button
                                        type="button"
                                        onClick={() => onAutoLayout("TB")}
                                        disabled={values.nodes.length === 0}
                                        title="Auto-layout"
                                        className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <TbLayoutDistributeHorizontal className="h-3.5 w-3.5" />
                                    </button>
                                <button
                                    type="button"
                                    onClick={() => setShowSchemaPanel(true)}
                                        title="View Schema"
                                        className="p-1.5 text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                >
                                        <VscJson className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowConsole(!showConsole)}
                                        title={showConsole ? 'Hide Console' : 'Show Console'}
                                        className={`p-1.5 text-slate-500 bg-white border rounded hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center gap-1 ${showConsole ? 'border-[#646cff] text-[#646cff]' : 'border-slate-200'}`}
                                >
                                        <VscTerminal className="h-3.5 w-3.5" />
                                    {consoleLogs.length > 0 && (
                                            <span className="px-1 py-0.5 text-[8px] bg-slate-200 text-slate-600 rounded-full leading-none">
                                            {consoleLogs.length}
                                        </span>
                                    )}
                                </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowContextPanel(!showContextPanel)}
                                        title={showContextPanel ? 'Hide Context' : 'Show Context'}
                                        className={`p-1.5 text-slate-500 bg-white border rounded hover:bg-slate-100 hover:text-slate-700 transition-colors flex items-center gap-1 ${showContextPanel ? 'border-[#646cff] text-[#646cff]' : 'border-slate-200'}`}
                                    >
                                        <TbBraces className="h-3.5 w-3.5" />
                                        {Object.keys(workflowContext).filter(k => !k.startsWith('__')).length > 0 && (
                                            <span className="px-1 py-0.5 text-[8px] bg-slate-200 text-slate-600 rounded-full leading-none">
                                                {Object.keys(workflowContext).filter(k => !k.startsWith('__')).length}
                                            </span>
                                        )}
                                    </button>
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
                                    <div className="h-full w-full relative">
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
                                                    stroke: '#94a3b8',
                                                },
                                            }}
                                            connectionLineType={ConnectionLineType.SmoothStep}
                                            connectionLineStyle={{ stroke: '#646cff', strokeWidth: 2 }}
                                            snapToGrid={values.snapToGrid ?? true}
                                            snapGrid={[20, 20]}
                                            fitView
                                            fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }}
                                            className="bg-slate-100"
                                            proOptions={{ hideAttribution: true }}
                                        >
                                            <Controls />
                                            <MiniMap />
                                            <Background variant="dots" gap={12} size={1} />
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
                                                            className="h-full rounded-none"
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
                                                            className="h-full rounded-none"
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