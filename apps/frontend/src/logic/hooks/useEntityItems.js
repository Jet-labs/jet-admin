import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../constants";
import { getAllListenersAPI } from "../../data/apis/listener";
import { getAllWorkflowsAPI } from "../../data/apis/workflow";
import { getAllWidgetsAPI } from "../../data/apis/widget";
import { getAllDataQueriesAPI } from "../../data/apis/dataQuery";
import { getAllAppPagesAPI } from "../../data/apis/appPage";
import { getAllCronJobsAPI } from "../../data/apis/cronJob";

const CONFIG_BY_TYPE = {
  widget: { api: getAllWidgetsAPI, key: CONSTANTS.REACT_QUERY_KEYS.WIDGETS, listKey: "widgets" },
  workflow: { api: getAllWorkflowsAPI, key: CONSTANTS.REACT_QUERY_KEYS.WORKFLOWS, listKey: "workflows" },
  dataQuery: { api: getAllDataQueriesAPI, key: CONSTANTS.REACT_QUERY_KEYS.QUERIES, listKey: "dataQueries" },
  cronJob: { api: getAllCronJobsAPI, key: CONSTANTS.REACT_QUERY_KEYS.DATABASE_CRON_JOBS, listKey: "cronJobs" },
  appPage: { api: getAllAppPagesAPI, key: CONSTANTS.REACT_QUERY_KEYS.APP_PAGES, listKey: "appPages" },
  listener: { api: getAllListenersAPI, key: CONSTANTS.REACT_QUERY_KEYS.LISTENERS, listKey: "listeners" },
};

/**
 * Fetches every item of an entity type (folders included on each row) so the
 * drawer can render a full folder/item tree. Server-side search narrows the
 * result set; when searching the drawer renders a flat list instead.
 */
export const useEntityItems = ({ tenantID, entityType, search = "" }) => {
  const config = CONFIG_BY_TYPE[entityType];
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [config.key(tenantID), "explorer", search],
    queryFn: () => config.api({ tenantID, search: search || undefined, page: 1, pageSize: 1000 }),
    enabled: Boolean(tenantID) && Boolean(config),
    refetchOnWindowFocus: false,
  });

  return { items: data?.[config.listKey] || [], isLoading, error };
};
