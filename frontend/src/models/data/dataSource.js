export class DataSource {
  constructor({
    pm_data_source_id,
    pm_data_source_title,
    pm_data_source_type,
    pm_query_ids,
  }) {
    this.pm_data_source_id = parseInt(pm_data_source_id);
    this.pm_data_source_title = String(pm_data_source_title);
    this.pm_data_source_type = String(pm_data_source_type);
    this.pm_query_ids =
      typeof pm_query_ids === "object"
        ? pm_query_ids
        : Array.from(pm_query_ids);
  }
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new DataSource(item);
      });
    }
  };
}
