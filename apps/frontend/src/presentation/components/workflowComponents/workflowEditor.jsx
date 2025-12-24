import React, { useCallback, useState } from "react";
import ReactFlow, {
    ReactFlowProvider,
    Controls,
    MiniMap,
    Background,
    applyNodeChanges, // Required to handle dragging/selection
    applyEdgeChanges, // Required to handle edge interactions
    addEdge           // Required to create valid connections
} from "reactflow";
import "reactflow/dist/style.css"; // Ensure styles are imported

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
import { FaCode, FaCodeBranch } from "react-icons/fa";
import { useWorkflowState } from "../../../logic/contexts/workflowContext";
import { WorkflowNodeConfigPanel } from "./workflowNodeConfigPanel";

// Create nodeTypes from the map
const nodeTypes = Object.entries(WORKFLOW_NODES_MAP).reduce((acc, [key, node]) => {
    acc[node.value] = node.component;
    return acc;
}, {});

const edgeTypes = Object.entries(WORKFLOW_EDGES_MAP).reduce((acc, [key, edge]) => {
    acc[edge.value] = edge.component;
    return acc;
}, {});

export const WorkflowEditor = ({ workflowEditorForm }) => {
    // Destructure for cleaner access
    const { values, setFieldValue, errors, handleChange, handleBlur } = workflowEditorForm;
    const { dataQueries } = useWorkflowState();
    const [selectedNodeId, setSelectedNodeId] = useState(null);

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
            let type = 'deletable'; // Default type
            if (connection.sourceHandle === 'error') {
                type = 'error';
            }
            const updatedEdges = addEdge({ ...connection, type }, values.edges);
            setFieldValue("edges", updatedEdges);
        },
        [values.edges, setFieldValue]
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

    // Find selected node
    const selectedNode = values.nodes.find(n => n.id === selectedNodeId);

    return (
        <WorkflowNodesProvider
            dataQueries={dataQueries}
            strings={CONSTANTS.STRINGS}
        >
            <WorkflowEdgeContext.Provider value={{ deleteEdge, updateEdge }}>
                <ReactFlowProvider>
                    <ResizablePanelGroup
                        direction="horizontal"
                        autoSaveId={CONSTANTS.RESIZABLE_PANEL_KEYS.WORKFLOW_ADDITION_FORM_QUERY_EDITOR_SEPARATION}
                        className="!w-full !h-full relative"
                    >
                        {/* Sidebar Controls */}
                        <ResizablePanel defaultSize={20} className="space-y-3 p-3 ">
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
                                {Object.values(WORKFLOW_NODES_MAP).map((node) => (
                                    <button
                                        key={node.value}
                                        type="button"
                                        onClick={() => onAddNode(node.value)}
                                        className="px-3 py-2 text-left text-sm text-slate-700 bg-slate-100 rounded hover:bg-[#646cff]/10 transition-colors border-none hover:border-none"
                                    >
                                        {/* You might want to add icons to the map if you want them dynamic too, 
                                    or map them here based on type */}
                                        {node.value === 'dataQuery' && <SiQuantconnect className="inline-block h-4 w-4 mr-2" />}
                                        {node.value === 'javascript' && <FaCode className="inline-block h-4 w-4 mr-2" />}
                                        {node.value === 'condition' && <FaCodeBranch className="inline-block h-4 w-4 mr-2" />}
                                        {node.label}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <pre className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{JSON.stringify(values, null, 2)}</pre>
                            </div>


                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Canvas Area */}
                        <ResizablePanel defaultSize={80}>
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
                                    className="bg-slate-100"
                                    proOptions={{ hideAttribution: true }}
                                >
                                    <Controls />
                                    <MiniMap />
                                    <Background variant="dots" gap={12} size={1} />
                                </ReactFlow>

                                {/* Configuration Panel Overlay */}
                                {selectedNode && (
                                    <WorkflowNodeConfigPanel
                                        node={selectedNode}
                                        onChange={updateNodeData}
                                        onClose={() => setSelectedNodeId(null)}
                                    />
                                )}
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
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