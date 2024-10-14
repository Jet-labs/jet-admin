import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { getTableInfo } from "../../../api/tables";
import { LOCAL_CONSTANTS } from "../../../constants";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ForeignKeyRenderer = ({
  tableForm,
  tables,
  index,
  handleDeleteForeignKeyCostraint,
}) => {
  const theme = useTheme();
  const {
    isLoading: isLoadingTableInfo,
    data: tableInfo,
    error: loadTableInfoError,
  } = useQuery({
    queryKey: [
      LOCAL_CONSTANTS.REACT_QUERY_KEYS.TABLE_ID_COLUMNS(
        tableForm.values["constraints"]["foreign_keys"][index]?.ref_table
      ),
    ],
    queryFn: () =>
      getTableInfo({
        tableName:
          tableForm.values["constraints"]["foreign_keys"][index]?.ref_table,
      }),
    cacheTime: 0,
    retry: 0,
    staleTime: 0,
  });
  const tableColumns = tableInfo?.columns;

  return (
    <div
      className={`flex flex-row justify-start border rounded  w-full !ml-0 ${
        index === 0 ? "!mt-1" : "!mt-3"
      }`}
      style={{
        borderColor: theme.palette.divider,
        backgroundColor: `${theme.palette.background.paper}30`,
      }}
    >
      <Grid container className="!p-3" columnSpacing={2}>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <FormControl fullWidth size="small" className="!mt-0">
            <span className="text-xs font-light  !capitalize mb-1">{`Columns`}</span>
            <Select
              multiple
              value={
                tableForm.values["constraints"]["foreign_keys"][index].columns
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              name={`constraints.foreign_keys[${index}].columns`}
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .columns
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      className="!rounded"
                      size="small"
                      key={value}
                      label={value}
                    />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {tableForm.values.columns?.map((column) => (
                <MenuItem
                  key={column.column_name}
                  value={column.column_name}
                  // style={getStyles(name, personName, theme)}
                >
                  {column.column_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <FormControl fullWidth size="small" className="!mt-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Reference table`}</span>
            <Select
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              placeholder="Data type"
              name={`constraints.foreign_keys[${index}].ref_table`}
              value={
                tableForm.values["constraints"]["foreign_keys"][index].ref_table
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .ref_table
              }
            >
              {tables?.map((table) => {
                return <MenuItem value={table}>{table}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
          <FormControl fullWidth size="small" className="!mt-3">
            <span className="text-xs font-light  !capitalize mb-1">{`Reference columns`}</span>
            <Select
              multiple
              value={
                tableForm.values["constraints"]["foreign_keys"][index]
                  .ref_columns
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              name={`constraints.foreign_keys[${index}].ref_columns`}
              input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .ref_columns
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      className="!rounded"
                      size="small"
                      key={value}
                      label={value}
                    />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {tableColumns?.map((column) => (
                <MenuItem
                  key={column.name}
                  value={column.name}
                  // style={getStyles(name, personName, theme)}
                >
                  {column.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
          <FormControl fullWidth size="small" className="!mt-3">
            <span className="text-xs font-light  !capitalize mb-1">{`On delete`}</span>
            <Select
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              placeholder="Data type"
              name={`constraints.foreign_keys[${index}].on_delete`}
              value={
                tableForm.values["constraints"]["foreign_keys"][index].on_delete
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .on_delete
              }
            >
              {["NO ACTION", "RESTRICT", "CASCADE"]?.map((action) => {
                return <MenuItem value={action}>{action}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xl={6} lg={6} md={6} sm={6} xs={6}>
          <FormControl fullWidth size="small" className="!mt-3">
            <span className="text-xs font-light  !capitalize mb-1">{`On update`}</span>
            <Select
              required={true}
              fullWidth
              size="small"
              variant="outlined"
              type="text"
              placeholder="Data type"
              name={`constraints.foreign_keys[${index}].on_update`}
              value={
                tableForm.values["constraints"]["foreign_keys"][index].on_update
              }
              onChange={tableForm.handleChange}
              onBlur={tableForm.handleBlur}
              error={
                tableForm.errors?.["constraints"]?.["foreign_keys"]?.[index]
                  .on_update
              }
            >
              {["NO ACTION", "RESTRICT", "CASCADE"]?.map((action) => {
                return <MenuItem value={action}>{action}</MenuItem>;
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <div
        className=" rounded-e"
        style={{ background: theme.palette.background.paper }}
      >
        <IconButton
          size="small"
          onClick={() => handleDeleteForeignKeyCostraint(index)}
        >
          <MdDeleteOutline className="!text-xl !text-red-700"></MdDeleteOutline>
        </IconButton>
      </div>
    </div>
  );
};
export const TableConstraintBuilder = ({ tables, tableForm }) => {
  const theme = useTheme();
  const _handleAddForeignKeyCostraint = () => {
    tableForm.setFieldValue("constraints.foreign_keys", [
      ...tableForm.values["constraints"]["foreign_keys"],
      {
        columns: [],
        ref_table: "",
        ref_columns: [],
        on_delete: "",
        on_update: "",
      },
    ]);
  };
  const _handleDeleteForeignKeyCostraint = (index) => {
    const _d = structuredClone(tableForm.values["constraints"]["foreign_keys"]);
    _d.splice(index, 1);
    tableForm.setFieldValue("constraints.foreign_keys", [..._d]);
  };

  return (
    <Grid container className="!p-3" xl={6} lg={6} md={12} sm={12} xs={12}>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <FormControl fullWidth size="small" className="!mt-3">
          <span className="text-xs font-light  !capitalize mb-1">{`Primary keys`}</span>
          <Select
            multiple
            value={tableForm.values["constraints"]["primary_key"]}
            onChange={tableForm.handleChange}
            onBlur={tableForm.handleBlur}
            name={`constraints.primary_key`}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            error={tableForm.errors?.["constraints"]?.["primary_key"]}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    className="!rounded"
                    size="small"
                    key={value}
                    label={value}
                  />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {tableForm.values.columns?.map((column) => (
              <MenuItem
                key={column.column_name}
                value={column.column_name}
                // style={getStyles(name, personName, theme)}
              >
                {column.column_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <FormControl fullWidth size="small" className="!mt-3">
          <span className="text-xs font-light  !capitalize mb-1">{`Unique keys`}</span>
          <Select
            multiple
            value={tableForm.values["constraints"]["unique"]}
            onChange={tableForm.handleChange}
            onBlur={tableForm.handleBlur}
            name={`constraints.unique`}
            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
            error={tableForm.errors?.["constraints"]?.["unique"]}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    className="!rounded"
                    size="small"
                    key={value}
                    label={value}
                  />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {tableForm.values.columns?.map((column) => (
              <MenuItem
                key={column.column_name}
                value={column.column_name}
                // style={getStyles(name, personName, theme)}
              >
                {column.column_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <FormControl fullWidth size="small" className="!mt-3">
          <span className="text-xs font-light  !capitalize mb-1">{`Check constraint`}</span>
          <TextField
            required={true}
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Check constraint expression..."
            type="text"
            name={`constraints.check`}
            value={tableForm.values["constraints"]["check"]}
            onChange={tableForm.handleChange}
            onBlur={tableForm.handleBlur}
            error={tableForm.errors?.["constraints"]?.["check"]}
          />
          {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
        </FormControl>
      </Grid>
      <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
        <FormControl fullWidth size="small" className="!mt-3">
          <span className="text-xs font-light  !capitalize mb-1">{`Exclude constraint`}</span>
          <TextField
            required={true}
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Exclude constraint..."
            type="text"
            name={`constraints.exclude`}
            value={tableForm.values["constraints"]["exclude"]}
            onChange={tableForm.handleChange}
            onBlur={tableForm.handleBlur}
            error={tableForm.errors?.["constraints"]?.["exclude"]}
          />
          {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
        </FormControl>
      </Grid>
      {tableForm.values["constraints"]["foreign_keys"] &&
        tableForm.values["constraints"]["foreign_keys"].length > 0 && (
          <span className="text-xs font-light  !capitalize mt-3">{`Foreign keys`}</span>
        )}
      {tableForm.values["constraints"]["foreign_keys"].map((_, index) => {
        return (
          <ForeignKeyRenderer
            index={index}
            tables={tables}
            tableForm={tableForm}
            handleDeleteForeignKeyCostraint={_handleDeleteForeignKeyCostraint}
          />
        );
      })}
      <Button
        variant="outlined"
        className="!mt-3"
        onClick={_handleAddForeignKeyCostraint}
      >
        <FaPlus className="!mr-1" />
        {LOCAL_CONSTANTS.STRINGS.TABLE_FOREIGN_KEY_ADDITION_PAGE_TITLE}
      </Button>
    </Grid>
  );
};
