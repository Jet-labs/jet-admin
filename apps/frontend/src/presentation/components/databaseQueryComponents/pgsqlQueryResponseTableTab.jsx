import { Box } from "@mui/material";
import React, { useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import jsonSchemaGenerator from "to-json-schema";
import PropTypes from "prop-types";

export const PGSQLQueryResponseTableTab = ({
  data,
  className,
  height = "100%",
  width = "100%",
}) => {
  PGSQLQueryResponseTableTab.propTypes = {
    data: PropTypes.array,
    className: PropTypes.string,
    height: PropTypes.string,
    width: PropTypes.string,
  };

  const dataSchema =
    Array.isArray(data) && data.length > 0
      ? jsonSchemaGenerator(data[0])
      : null;

  const columns = useMemo(() => {
    if (dataSchema && dataSchema.properties) {
      return Object.keys(dataSchema.properties).map((key) => {
        return {
          key,
          name: key,
          field: key,
          display: "flex",
          headerName: String(key),
          width: 300,
        };
      });
    } else {
      return null;
    }
  }, [dataSchema]);

  return (
    <Box
      sx={{ width, height }}
      className={`!flex !flex-col !justify-start !items-stretch ${className}`}
    >
      {!dataSchema ? (
        <div className="!h-32 flex !flex-col !justify-center !items-center w-full text-slate-500">
          <span>Data schema not valid or no data available</span>
        </div>
      ) : !columns ? (
        <div className="!h-32 flex !flex-col !justify-center !items-center w-full text-slate-500">
          <span>Columns cannot be extracted or mapped</span>
        </div>
      ) : data && Array.isArray(data) && data.length && columns ? (
        <DataGrid
          rows={data.map((item, index) => {
            return { _g_uuid: `_index_${index}`, ...item };
          })}
          virtualizeColumnsWithAutoRowHeight={true}
          columns={columns}
          className={`!w-100 !border-0`}
          density="compact"
          showCellVerticalBorder
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'bg-[#646cff]/10' : 'Mui-odd'
          }
          getRowHeight={() => "auto"}
          getRowId={(row) => row._g_uuid}
          defaultColumnOptions={{
            sortable: true,
            resizable: true,
          }}
          sx={{
            "--unstable_DataGrid-radius": "0",
            "& .MuiDataGrid-root": {
              borderRadius: 0,
            },
            "& .MuiIconButton-root": {
              outline: "none",
            },
            "& .MuiDataGrid-cell": {
              fontSize: "0.875rem !important",
              lineHeight: "1.25rem !important",
              fontWeight: "400 !important",
            },
            "& .MuiCheckbox-root": {
              padding: "4px",
            },
            "& .MuiDataGrid-columnHeaderCheckbox": {
              minWidth: "auto !important",
              width: "auto !important",
              flex: "0 0 auto !important",
              padding: "0.25rem !important",
              "& .MuiDataGrid-columnHeaderTitleContainer": {
                width: "auto",
                minWidth: "auto",
                flex: "none",
              },
            },
            "& .MuiDataGrid-cellCheckbox": {
              minWidth: "auto !important",
              width: "auto !important",
              flex: "0 0 auto !important",
              color: "#646cff !important",
              padding: "0.25rem !important",
            },
          }}
        />
      ) : (
        <div className="!h-32 flex !flex-col !justify-center !items-center w-full text-slate-500">
          <span>No data</span>
        </div>
      )}
    </Box>
  );
};
