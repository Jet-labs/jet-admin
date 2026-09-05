import React, { useCallback, useState, useMemo, useRef } from "react";
import { ArrowRightToLine, Braces, Clock, Code, Columns, Eraser, FileJson, GitBranch, Layers, Map as MapIcon, Play, Repeat, Square, Terminal, User, Zap } from 'lucide-react';
import ReactFlow, {
    ReactFlowProvider,
    Controls,
    ControlButton,
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

import { useInfiniteDataQueries } from "../../../logic/hooks/useDataQueries";
import { useInfiniteDatasources } from "../../../logic/hooks/useDatasources";
import { getDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { getAllWorkflowsAPI, getWorkflowByIDAPI } from "../../../data/apis/workflow";
import { useQueries, useQuery } from "@tanstack/react-query";
import debounce from "lodash/debounce";
import { WorkflowNodeConfigPanel } from "./workflowNodeConfigPanel";
import { WorkflowSchemaPanel } from "./workflowSchemaPanel";
import { WorkflowConsole } from "./workflowConsole";
import { WorkflowContextPanel } from "./workflowContextPanel";
import { WorkflowInputDefinitionsPanel } from "./workflowInputDefinitionsPanel";
import { WorkflowExecutionPolicyPanel } from "./workflowExecutionPolicyPanel";
import { WorkflowInputModal } from "./workflowInputModal";
import { DataQueryTestingPanel } from "../dataQueryComponents/dataQueryTestingPanel";
import { useParams } from "react-router-dom";
import { useWorkflowRun } from "./useWorkflowRun";
import { useEffect } from "react";

import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator } from "@jet-admin/ui";
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

// Sidebar node palette icons (single source for the Add-nodes grid)
const NODE_PALETTE_ICONS = {
    start: <Play className="size-3.5 mr-1.5 shrink-0 text-emerald-500" />,
    dataQuery: <Zap className="size-3.5 mr-1.5 shrink-0 text-blue-500" />,
    javascript: <Code className="size-3.5 mr-1.5 shrink-0 text-amber-500" />,
    condition: <GitBranch className="size-3.5 mr-1.5 shrink-0 text-indigo-500" />,
    loop: <Repeat className="size-3.5 mr-1.5 shrink-0 text-cyan-500" />,
    delay: <Clock className="size-3.5 mr-1.5 shrink-0 text-orange-500" />,
    end: <Square className="size-3.5 mr-1.5 shrink-0 text-destructive" />,
    dataCollection: <ArrowRightToLine className="size-3.5 mr-1.5 shrink-0 text-violet-500" />,
    subWorkflow: <Layers className="size-3.5 mr-1.5 shrink-0 text-fuchsia-500" />,
    switch: <GitBranch className="size-3.5 mr-1.5 shrink-0 text-teal-500" />,
    approval: <User className="size-3.5 mr-1.5 shrink-0 text-rose-500" />,
    fanout: <GitBranch className="size-3.5 mr-1.5 shrink-0 text-sky-500" />,
    join: <GitBranch className="size-3.5 mr-1.5 shrink-0 text-lime-500" />,
};

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
    // workflowID is present on the update route only; test runs from there
    // are attributed to the saved workflow so they appear in its history.
    const { tenantID, workflowID } = useParams();
    
    // Infinite Search Hooks
    const [querySearch, setQuerySearch] = useState("");
    const debouncedSetQuerySearch = useMemo(() => debounce(setQuerySearch, 300), []);
    const { 
        dataQueries = [], 
        refetchDataQueries, 
        isLoadingDataQueries, 
        loadDataQueriesError,
        fetchNextPage: fetchNextQueriesPage,
        hasNextPage: hasNextQueriesPage,
        isFetchingNextPage: isFetchingNextQueriesPage
    } = useInfiniteDataQueries(tenantID, querySearch);

    const [datasourceSearch, setDatasourceSearch] = useState("");
    const debouncedSetDatasourceSearch = useMemo(() => debounce(setDatasourceSearch, 300), []);
    const { 
        datasources = [], 
        refetchDatasources, 
        isLoadingDatasources, 
        loadDatasourcesError,
        fetchNextPage: fetchNextDatasourcesPage,
        hasNextPage: hasNextDatasourcesPage,
        isFetchingNextPage: isFetchingNextDatasourcesPage
    } = useInfiniteDatasources(tenantID, datasourceSearch);

    // Collect Data Query IDs from Nodes to fetch specific details
    const neededQueryIDsStr = useMemo(() => {
        const ids = new Set();
        values.nodes?.forEach((node) => {
            if (node.type === "dataQuery" && node.data?.dataQueryID) {
                ids.add(String(node.data.dataQueryID));
            }
        });
        return Array.from(ids).sort().join(",");
    }, [values.nodes]);

    const neededQueryIDs = useMemo(() => {
        return neededQueryIDsStr ? neededQueryIDsStr.split(",") : [];
    }, [neededQueryIDsStr]);

    const queryOptions = useMemo(() => {
        return neededQueryIDs.map((id) => ({
            queryKey: [CONSTANTS.REACT_QUERY_KEYS.QUERIES(tenantID), "detail", id],
            queryFn: () => getDataQueryByIDAPI({ tenantID, dataQueryID: id }),
            staleTime: Infinity,
        }));
    }, [neededQueryIDs, tenantID]);

    // Fetch details for specific node references
    const queryDetails = useQueries({
        queries: queryOptions
    });

    // Create a union of infinite paginated list and specifically resolved node references
    const unionDataQueries = useMemo(() => {
        const map = new Map();
        dataQueries.forEach(q => map.set(String(q.dataQueryID), q));
        queryDetails.forEach(qRes => {
            if (qRes.data && qRes.data.dataQueryID) {
                map.set(String(qRes.data.dataQueryID), qRes.data);
            }
        });
        return Array.from(map.values());
    }, [dataQueries, queryDetails]);

    // Workflows for the Sub-Workflow node picker (searchable list + details
    // for referenced children so the configurator can render guided inputs).
    const [workflowSearch, setWorkflowSearch] = useState("");
    const debouncedSetWorkflowSearch = useMemo(() => debounce(setWorkflowSearch, 300), []);
    const workflowsQuery = useQuery({
        queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID), "list", workflowSearch],
        queryFn: () => getAllWorkflowsAPI({ tenantID, search: workflowSearch || undefined, page: 1, pageSize: 100 }),
        staleTime: 30_000,
        enabled: Boolean(tenantID),
    });
    const workflowsList = useMemo(() => {
        const res = workflowsQuery.data;
        if (!res) return [];
        return Array.isArray(res) ? res : (res.workflows || []);
    }, [workflowsQuery.data]);

    // Collect child Workflow IDs from subWorkflow nodes to fetch details
    const neededChildWorkflowIDs = useMemo(() => {
        const ids = new Set();
        values.nodes?.forEach((node) => {
            if (node.type === "subWorkflow" && node.data?.childWorkflowID) {
                ids.add(String(node.data.childWorkflowID));
            }
        });
        return Array.from(ids).sort();
    }, [values.nodes]);

    const childWorkflowDetails = useQueries({
        queries: neededChildWorkflowIDs.map((id) => ({
            queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS(tenantID), "detail", id],
            queryFn: () => getWorkflowByIDAPI({ tenantID, workflowID: id }),
            staleTime: Infinity,
        })),
    });

    // Union of list + details (details carry workflowOptions.inputDefinitions)
    const unionWorkflows = useMemo(() => {
        const map = new Map();
        workflowsList.forEach(w => map.set(String(w.workflowID), w));
        childWorkflowDetails.forEach(wRes => {
            if (wRes.data && wRes.data.workflowID) {
                map.set(String(wRes.data.workflowID), wRes.data);
            }
        });
        return Array.from(map.values());
    }, [workflowsList, childWorkflowDetails]);

    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [showSchemaPanel, setShowSchemaPanel] = useState(false);
    const [showMiniMap, setShowMiniMap] = useState(true);

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

    // Get workflow input values from options
    const workflowInputDefinitions = useMemo(() => {
        return values.workflowOptions?.inputDefinitions?.filter(arg => arg.key) || [];
    }, [values.workflowOptions?.inputDefinitions]);

    const hasRunState = useMemo(() => {
        return Boolean(testResult)
            || consoleLogs.length > 0
            || Object.keys(nodeExecutionStatus).length > 0
            || Object.keys(workflowContext).length > 0;
    }, [testResult, consoleLogs, nodeExecutionStatus, workflowContext]);

    // Execute test run wrapper
    const executeTestRun = useCallback((inputValues) => {
        startTestRun({
            nodes: values.nodes,
            edges: values.edges,
            inputValues,
            workflowOptions: values.workflowOptions,
            ...(workflowID ? { workflowID } : {}),
        });
    }, [startTestRun, values.nodes, values.edges, values.workflowOptions, workflowID]);


    // Handle Test Run button click - show modal if inputDefinitions exist
    const onTestRunClick = useCallback(() => {
        if (workflowInputDefinitions.length > 0) {
            setShowInputModal(true);
        } else {
            // No inputDefinitions, run directly with empty params
            executeTestRun({});
        }
    }, [workflowInputDefinitions, executeTestRun]);


    // Handle input modal submit
    const handleInputModalSubmit = useCallback((inputValues) => {
        setShowInputModal(false);
        executeTestRun(inputValues);
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
            dataQueries={unionDataQueries}
            workflows={unionWorkflows}
            currentWorkflowID={workflowID}
            workflowSearch={workflowSearch}
            setWorkflowSearch={debouncedSetWorkflowSearch}
            datasources={datasources}
            strings={CONSTANTS.STRINGS}
            onRefreshDataQueries={refetchDataQueries}
            onRefreshDatasources={refetchDatasources}
            workflowNodes={values.nodes}
            workflowEdges={values.edges}
            workflowInputDefinitions={workflowInputDefinitions}
            nodeExecutionStatus={nodeExecutionStatus}
            workflowContext={workflowContext}
            tenantID={tenantID}
            onQueryTest={handleQueryTest}
            
            // Infinite Scroll props for UI
            querySearch={querySearch}
            setQuerySearch={debouncedSetQuerySearch}
            fetchNextQueriesPage={fetchNextQueriesPage}
            hasNextQueriesPage={hasNextQueriesPage}
            isFetchingNextQueriesPage={isFetchingNextQueriesPage}
            isLoadingDataQueries={isLoadingDataQueries}
            
            datasourceSearch={datasourceSearch}
            setDatasourceSearch={debouncedSetDatasourceSearch}
            fetchNextDatasourcesPage={fetchNextDatasourcesPage}
            hasNextDatasourcesPage={hasNextDatasourcesPage}
            isFetchingNextDatasourcesPage={isFetchingNextDatasourcesPage}
            isLoadingDatasources={isLoadingDatasources}
        >
            <WorkflowEdgeContext.Provider value={{ deleteEdge, updateEdge }}>
                <ReactFlowProvider>
                    <ResizablePanelGroup
                        direction="horizontal"
                        autoSaveId={CONSTANTS.RESIZABLE_PANEL_KEYS.WORKFLOW_ADDITION_FORM_QUERY_EDITOR_SEPARATION}
                        className="!w-full !h-full relative"
                    >
                        {/* Sidebar Controls */}
                        <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.WORKFLOW_SIDEBAR_PANEL} defaultSize={20} className="flex flex-col h-full overflow-hidden">

                            <div className="flex-1 overflow-y-auto flex flex-col justify-start items-stretch bg-background p-2 space-y-2">
                                <div className="space-y-1">
                                    <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">
                                        {CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_NAME_FIELD_LABEL}
                                    </Label>
                                    <Input
                                        type="text"
                                        name="title"
                                        id="title"
                                        size="sm"
                                        className="w-full"
                                        placeholder={CONSTANTS.STRINGS.ADD_WORKFLOW_FORM_NAME_FIELD_PLACEHOLDER}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.title}
                                    />
                                    {errors.title && (
                                        <p className="text-destructive text-xs">{errors.title}</p>
                                    )}
                                </div>

                                {/* <Separator /> */}

                                {/* ── Node palette ──────────────────────────── */}
                                <div className="space-y-2">
                                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        Nodes
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                    {Object.values(WORKFLOW_NODES_MAP)
                                        .filter(node => {
                                            return true;
                                        })
                                        .map((node) => (
                                            <Button
                                                key={node.value}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onAddNode(node.value)}
                                                title={`Add ${node.label}`}
                                                className="justify-start min-w-0"
                                            >
                                                {NODE_PALETTE_ICONS[node.value]}
                                                <span className="truncate">{node.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* <Separator /> */}

                                <WorkflowInputDefinitionsPanel workflowForm={workflowEditorForm} />

                                <Separator />

                                <WorkflowExecutionPolicyPanel workflowForm={workflowEditorForm} />

                                {/* <Separator /> */}

                                {/* ── Execution ─────────────────────────────── */}
                                <div className="space-y-2">
                                    <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        Run
                                    </p>
                                    <div className="flex items-center gap-2">
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
                                        <Eraser className="size-3.5 mr-2" />
                                        Clear results
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

                                {/* <Separator /> */}

                                <div className="space-y-1">
                                    <Label className="text-xs font-medium text-muted-foreground">Edge style</Label>
                                    <Select
                                        value={values.edgeType || 'smoothstep'}
                                        onValueChange={(val) => {
                                            setFieldValue("edgeType", val);
                                            updateAllEdgesType(val);
                                        }}
                                    >
                                        <SelectTrigger size="sm" className="w-full text-xs">
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default" className="text-xs">Bezier (Curved)</SelectItem>
                                            <SelectItem value="straight" className="text-xs">Straight</SelectItem>
                                            <SelectItem value="step" className="text-xs">Step (Sharp)</SelectItem>
                                            <SelectItem value="smoothstep" className="text-xs">Smooth Step</SelectItem>
                                            <SelectItem value="simplebezier" className="text-xs">Simple Bezier</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* <Separator /> */}

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => onAutoLayout("TB")}
                                        disabled={values.nodes.length === 0}
                                        title="Auto-layout"
                                        variant="outline"
                                        size="sm"
                                        className="justify-start text-muted-foreground hover:text-foreground"
                                    >
                                        <Columns className="size-3.5" />
                                        Layout
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowSchemaPanel(true)}
                                        title="View Schema"
                                        variant="outline"
                                        size="sm"
                                        className={`justify-start ${showSchemaPanel ? 'border-primary/50 bg-primary/10 text-primary hover:text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <FileJson className="size-3.5" />
                                        Schema
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowConsole(!showConsole)}
                                        title={showConsole ? 'Hide Console' : 'Show Console'}
                                        variant="outline"
                                        size="sm"
                                        className={`justify-start ${showConsole ? 'border-primary/50 bg-primary/10 text-primary hover:text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <Terminal className="size-3.5" />
                                        Console
                                        {consoleLogs.length > 0 && (
                                            <span className="ml-auto text-xs text-muted-foreground">
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
                                        className={`justify-start ${showContextPanel ? 'border-primary/50 bg-primary/10 text-primary hover:text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <Braces className="size-3.5" />
                                        Context
                                        {Object.keys(workflowContext).filter(k => !k.startsWith('__')).length > 0 && (
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                {Object.keys(workflowContext).filter(k => !k.startsWith('__')).length}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle />

                        {/* Canvas Area */}
                        <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.WORKFLOW_MAIN_PANEL} defaultSize={80}>
                            <ResizablePanelGroup
                                direction="vertical"
                                autoSaveId={CONSTANTS.RESIZABLE_PANEL_KEYS.WORKFLOW_EDITOR_CANVAS_TERMINAL_SPLIT}
                                className="!h-full"
                            >
                                {/* ReactFlow Canvas */}
                                <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.WORKFLOW_CANVAS_PANEL} defaultSize={showConsole || showContextPanel ? 70 : 100} minSize={30}>
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
                                            <Controls>
                                                <ControlButton onClick={() => setShowMiniMap(!showMiniMap)} title="Toggle MiniMap">
                                                    <MapIcon />
                                                </ControlButton>
                                            </Controls>
                                            {showMiniMap && <MiniMap />}
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
                                        <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.WORKFLOW_BOTTOM_PANEL} defaultSize={30} minSize={15} maxSize={60}>
                                            <ResizablePanelGroup
                                                direction="horizontal"
                                                autoSaveId={CONSTANTS.RESIZABLE_PANEL_KEYS.WORKFLOW_EDITOR_CONSOLE_CONTEXT_SPLIT}
                                                className="!h-full"
                                            >
                                                {/* Console Panel */}
                                                {showConsole && (
                                                    <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.WORKFLOW_CONSOLE_PANEL} defaultSize={showContextPanel ? 50 : 100} minSize={25}>
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
                                                    <ResizablePanel id={CONSTANTS.RESIZABLE_PANEL_IDS.WORKFLOW_CONTEXT_PANEL} defaultSize={showConsole ? 50 : 100} minSize={25}>
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
                            inputDefinitions={workflowInputDefinitions}
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