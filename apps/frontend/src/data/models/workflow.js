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
  }) {
    this.workflowID = workflowID;
    this.title = title;
    this.tenantID = tenantID;
    this.creatorID = creatorID;
    this.isDisabled = isDisabled;
    this.disabledAt = disabledAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.nodes = nodes;
    this.edges = edges;
  }
  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Workflow(item));
    }
    return [];
  }
}