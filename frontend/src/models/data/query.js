import { LOCAL_CONSTANTS } from "../../constants";

export class Query {
  constructor({ pm_query_master_id, pm_query_id, pm_query_type, query }) {
    this.pm_query_master_id = parseInt(pm_query_master_id);
    this.pm_query_id = parseInt(pm_query_id);
    this.pm_query_type = pm_query_type;
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
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new Query(item);
      });
    }
  };
}
export class PGSQLQuery {
  constructor({
    pm_postgres_query_title,
    pm_postgres_query_description,
    pm_postgres_query_id,
  }) {
    this.pm_postgres_query_id = parseInt(pm_postgres_query_id);
    this.pm_postgres_query_title = String(pm_postgres_query_title);
    this.pm_postgres_query_description = String(pm_postgres_query_description);
    this.pm_query_type =
      LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE.POSTGRE_QUERY.value;
  }
  getID = () => {
    return this.pm_postgres_query_id;
  };
  getTitle = () => {
    return this.pm_postgres_query_title;
  };
  getDescription = () => {
    return this.pm_postgres_query_description;
  };
  static toList = (data) => {
    if (Array.isArray(data)) {
      return data.map((item) => {
        return new PGSQLQuery(item);
      });
    }
  };
}
