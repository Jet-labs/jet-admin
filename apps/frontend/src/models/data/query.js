export class Query {
  constructor({
    pm_query_id,
    pm_query,
    pm_query_type,
    pm_query_title,
    pm_query_description,
    pm_query_args,
    pm_query_metadata,
    is_disabled,
    created_at,
    updated_at,
    disabled_at,
    disable_reason,
  }) {
    this.pm_query_id = parseInt(pm_query_id);
    this.pm_query_type = pm_query_type;
    this.pm_query_title = String(pm_query_title);
    this.pm_query_description = String(pm_query_description);
    this.pm_query = this.getQueryClass({
      pm_query_type,
      queryData: typeof pm_query === "object" ? pm_query : JSON.parse(pm_query),
    });
    this.pm_query_args =
      typeof pm_query_args === "object"
        ? pm_query_args
        : JSON.parse(pm_query_args);

    this.pm_query_metadata =
      typeof pm_query_metadata === "object"
        ? pm_query_metadata
        : JSON.parse(pm_query_metadata);
    this.is_disabled = is_disabled;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.disabled_at = disabled_at;
    this.disable_reason = disable_reason;
  }
  getQueryClass = ({ pm_query_type, queryData }) => {
    if (!queryData) {
      return null;
    }
    return new PGSQLQuery(queryData);
  };
  getTitle = () => {
    return this.pm_query_title;
  };
  getDescription = () => {
    return this.pm_query_description;
  };
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Query(item);
      });
    }
  };
}
export class PGSQLQuery {
  constructor({ raw_query }) {
    this.raw_query = String(raw_query);
  }

  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new PGSQLQuery(item);
      });
    }
  };
}
