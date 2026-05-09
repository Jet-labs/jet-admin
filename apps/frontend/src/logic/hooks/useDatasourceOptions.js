import { DATASOURCE_TYPES } from "@jet-admin/datasource-types";
import { DATASOURCE_UI_COMPONENTS } from "@jet-admin/datasources-ui";
import { useMemo } from "react";
import { useDatasources } from "./useDatasources";

const DIRECT_QUERY_DATASOURCES = Object.keys(DATASOURCE_TYPES)
  .map((key) => {
    if (!DATASOURCE_UI_COMPONENTS[DATASOURCE_TYPES[key].value]) {
      return null;
    } else if (DATASOURCE_TYPES[key].formConfig) {
      return null;
    } else {
      return {
        value: DATASOURCE_TYPES[key].value,
        label: DATASOURCE_TYPES[key].name,
        type: DATASOURCE_TYPES[key].value,
      };
    }
  })
  .filter((v) => v != null);

export const useDatasourceOptions = (tenantID) => {
  const {
    datasources: _datasources,
    isLoadingDatasources,
    isFetchingDatasources,
    loadDatasourcesError,
    isRefetchingDatasources,
    refetchDatasources,
  } = useDatasources(tenantID);

  const datasources = useMemo(() => {
    return _datasources && _datasources.length > 0
      ? [
          ..._datasources.map((datasource) => {
            return {
              label: datasource.datasourceTitle,
              value: datasource.datasourceID,
              type: datasource.datasourceType,
            };
          }),
          ...DIRECT_QUERY_DATASOURCES,
        ]
      : [...DIRECT_QUERY_DATASOURCES];
  }, [_datasources]);

  return {
    datasources,
    isLoadingDatasources,
    isFetchingDatasources,
    loadDatasourcesError,
    isRefetchingDatasources,
    refetchDatasources,
  };
};
