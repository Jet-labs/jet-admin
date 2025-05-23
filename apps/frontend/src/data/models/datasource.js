export class Datasource {

  constructor({
    datasourceID,
    datasourceTitle,
    datasourceType,
    createdAt,
    updatedAt,
    tenantID,
    creatorID,
    datasourceOptions,
  }) {
    this.datasourceID = datasourceID;
    this.datasourceTitle = datasourceTitle;
    this.datasourceType = datasourceType;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.tenantID = tenantID;
    this.creatorID = creatorID;
    this.datasourceOptions = datasourceOptions;
  }

  static toList(data) {
    if (Array.isArray(data)) {
      return data.map((item) => new Datasource(item));
    }
    return [];
  }
}