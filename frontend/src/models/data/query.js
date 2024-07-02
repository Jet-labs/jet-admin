import { LOCAL_CONSTANTS } from "../../constants";

export class Query {
  constructor({
    pm_master_query_id,
    pm_query_id,
    pm_query_type,
    pm_master_query_title,
    pm_master_query_description,
    query,
  }) {
    this.pm_master_query_id = parseInt(pm_master_query_id);
    this.pm_query_id = parseInt(pm_query_id);
    this.pm_query_type = pm_query_type;
    this.pm_master_query_title = String(pm_master_query_title);
    this.pm_master_query_description = String(pm_master_query_description);
    this.query = this.getQueryClass({ pm_query_type, queryData: query });
  }
  getQueryClass = ({ pm_query_type, queryData }) => {
    switch (pm_query_type) {
      case LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE.POSTGRE_QUERY.value:
        return new PGSQLQuery(queryData);
      default:
        return new PGSQLQuery(queryData);
    }
  };
  getTitle = () => {
    return this.pm_master_query_title;
  };
  getDescription = () => {
    return this.pm_master_query_description;
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
  constructor({ pm_postgres_query_id, pm_postgres_query }) {
    this.pm_postgres_query_id = parseInt(pm_postgres_query_id);
    this.pm_postgres_query = String(pm_postgres_query);
  }
  getID = () => {
    return this.pm_postgres_query_id;
  };

  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new PGSQLQuery(item);
      });
    }
  };
}
