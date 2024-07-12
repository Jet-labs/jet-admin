import { LOCAL_CONSTANTS } from "../../constants";

export class Query {
  constructor({
    pm_query_id,
    pm_query,
    pm_query_type,
    pm_query_title,
    pm_query_description,
  }) {
    this.pm_query_id = parseInt(pm_query_id);
    this.pm_query_type = pm_query_type;
    this.pm_query_title = String(pm_query_title);
    this.pm_query_description = String(pm_query_description);
    this.pm_query = this.getQueryClass({ pm_query_type, queryData: pm_query });
  }
  getQueryClass = ({ pm_query_type, queryData }) => {
    console.log({ pm_query_type, queryData });
    if(!queryData){
      return null;
    }
    switch (pm_query_type) {
      case LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE.POSTGRE_QUERY.value:
        return new PGSQLQuery(queryData);
      default:
        return new PGSQLQuery(queryData);
    }
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
