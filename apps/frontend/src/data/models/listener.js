export class Listener {
  constructor({
    listenerID,
    tenantID,
    datasourceID,
    listenerTitle,
    listenerDescription,
    listenerType,
    listenerConfig,
    transformScript,
    status,
    endpointPath,
    createdAt,
    updatedAt,
    tblListenerActions,
    tblDatasources,
  }) {
    this.listenerID = listenerID;
    this.tenantID = tenantID;
    this.datasourceID = datasourceID;
    this.listenerTitle = listenerTitle;
    this.listenerDescription = listenerDescription;
    this.listenerType = listenerType;
    this.listenerConfig = listenerConfig || {};
    this.transformScript = transformScript || "";
    this.status = status || "inactive";
    this.endpointPath = endpointPath || null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.actions = tblListenerActions || [];
    this.datasource = tblDatasources || null;
  }

  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Listener(item));
    }
    return [];
  }
}
