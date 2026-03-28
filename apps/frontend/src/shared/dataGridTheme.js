export const DATAGRID_SX = {
  border: 0,
  "--unstable_DataGrid-radius": "0.5rem",
  "& .MuiDataGrid-root": { borderRadius: 0 },
  "& .MuiIconButton-root": { outline: "none" },
  "& .MuiDataGrid-cell": {
    fontSize: "0.8125rem",
    lineHeight: "1.25rem",
    fontWeight: "400",
    padding: "8px 10px",
    maxHeight: "none !important",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: "hsl(var(--muted) / 0.5)",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  "& .MuiCheckbox-root": { padding: "4px" },
  "& .MuiDataGrid-columnHeaderCheckbox, & .MuiDataGrid-cellCheckbox": {
    minWidth: "auto !important",
    width: "auto !important",
    flex: "0 0 auto !important",
    padding: "0.25rem !important",
  },
  "& .MuiDataGrid-cellCheckbox": { color: "hsl(var(--primary))" },
  "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer": {
    width: "auto",
    minWidth: "auto",
    flex: "none",
  },
};
