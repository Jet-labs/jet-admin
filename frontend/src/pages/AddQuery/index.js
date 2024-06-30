import { FormControl, Grid, MenuItem, Select, useTheme } from "@mui/material";
import React, { useCallback, useState } from "react";
import "react-data-grid/lib/styles.css";
import { PGSQLQueryBuilder } from "../../components/QueryBuilders/PGSQLQueryBuilder";
import { LOCAL_CONSTANTS } from "../../constants";
import "./style.css";

const AddQuery = () => {
  const theme = useTheme();
  const [queryType, setQueryType] = useState(
    LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE.POSTGRE_QUERY.value
  );
  const _handleOnQueryTypeChange = useCallback(
    (e) => {
      setQueryType(e.target.value);
    },
    [setQueryType]
  );

  return (
    <div className="w-full !h-[calc(100vh-123px)]">
      <div
        className="flex flex-col items-start justify-start p-3 px-6 !border-b !border-white !border-opacity-10"
        style={{ background: theme.palette.background.paper }}
      >
        <span className="text-lg font-bold text-start mt-1">{`Add new query`}</span>
      </div>

      <Grid container className="!h-full">
        <Grid item sx={12} md={12} lg={12} className="w-full !h-full">
          <FormControl fullWidth size="small" className="!mt-2 !px-3">
            <span className="text-xs font-light  !lowercase mb-1">{`Query type`}</span>

            <Select
              value={queryType}
              onChange={_handleOnQueryTypeChange}
              name={"query_type"}
              required={true}
              size="small"
              fullWidth={false}
            >
              {Object.keys(LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE).map(
                (queryType) => {
                  const value =
                    LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE[queryType].value;
                  const name =
                    LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE[queryType].name;
                  return <MenuItem value={value}>{name}</MenuItem>;
                }
              )}
            </Select>
            {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
          </FormControl>
          {queryType ==
            LOCAL_CONSTANTS.DATA_SOURCE_QUERY_TYPE.POSTGRE_QUERY.value && (
            <PGSQLQueryBuilder />
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default AddQuery;
