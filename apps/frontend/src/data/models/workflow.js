import { WorkflowNode } from "./workflowNode";
import { WorkflowEdge } from "./workflowEdge";

/**
 * Workflow Model
 * 
 * Represents a workflow with nodes and edges.
 * Uses WorkflowNode and WorkflowEdge models for type-safe node/edge handling.
 */
export class Workflow {
  constructor({
    workflowID,
    title,
    tenantID,
    creatorID,
    isDisabled,
    disabledAt,
    createdAt,
    updatedAt,
    nodes,
    edges,
    tblWorkflowNodes,
    tblWorkflowEdge,
    workflowOptions,
  }) {
    this.workflowID = workflowID;
    this.title = title;
    this.tenantID = tenantID;
    this.creatorID = creatorID;
    this.isDisabled = isDisabled;
    this.disabledAt = disabledAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.workflowOptions = workflowOptions || {};

    // Transform nodes using WorkflowNode model
    // Handle both backend format (tblWorkflowNodes) and direct format (nodes)
    const rawNodes = tblWorkflowNodes || nodes || [];
    this.nodes = WorkflowNode.toList(rawNodes);

    // Transform edges using WorkflowEdge model
    // Handle both backend format (tblWorkflowEdge) and direct format (edges)
    const rawEdges = tblWorkflowEdge || edges || [];
    this.edges = WorkflowEdge.toList(rawEdges);
  }

  /**
   * Get nodes in React Flow format for rendering
   */
  getReactFlowNodes() {
    return this.nodes.map(node => node.toReactFlow());
  }

  /**
   * Get edges in React Flow format for rendering
   */
  getReactFlowEdges() {
    return this.edges.map(edge => edge.toReactFlow());
  }

  /**
   * Get the start node
   */
  get startNode() {
    return this.nodes.find(node => node.isStart) || null;
  }

  /**
   * Get the end node
   */
  get endNode() {
    return this.nodes.find(node => node.isEnd) || null;
  }

  /**
   * Get all nodes that produce output variables
   */
  get outputNodes() {
    return this.nodes.filter(node => node.hasOutput);
  }

  /**
   * Get workflow inputs from workflowOptions.inputDefinitions
   */
  get inputs() {
    return this.workflowOptions?.inputDefinitions || [];
  }

  /**
   * Get workflow outputs from end node config
   */
  get outputs() {
    return this.endNode?.data?.outputs || [];
  }

  /**
   * Convert array of raw workflow data to Workflow instances
   */
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Workflow(item));
    }
    return [];
  }
}