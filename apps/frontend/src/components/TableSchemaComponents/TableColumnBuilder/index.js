import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
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

export const TableColumnBuilder = ({ tableForm }) => {
  const theme = useTheme();
  const _handleAddColumn = () => {
    tableForm.setFieldValue("columns", [
      ...tableForm.values.columns,
      {
        column_name: LOCAL_CONSTANTS.STRINGS.FORM_FIELD_PLACEHOLDER_UNTITLED,
        data_type: "",
        storage: "DEFAULT",
        collation: "",
        default: "",
        not_null: true,
        unique: false,
        primary_key: false,
        check: "",
      },
    ]);
  };
  const _handleDeleteColumn = (index) => {
    const _d = structuredClone(tableForm.values.columns);
    _d.splice(index, 1);
    tableForm.setFieldValue("columns", [..._d]);
  };
  return (
    <Grid container xl={6} lg={6} md={12} sm={12} xs={12} className="!p-3">
      {tableForm.values["columns"].map((columns, index) => {
        return (
          <div
            className={`flex flex-row justify-start border rounded  w-full !ml-0 ${
              index === 0 ? "!mt-1" : "!mt-3"
            }`}
            style={{ borderColor: theme.palette.divider }}
          >
            <Grid
              key={`table_form_column_${index}`}
              container
              xl={12}
              lg={12}
              md={12}
              sm={12}
              xs={12}
              spacing={1}
              className="!p-3 !pb-1"
            >
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <TextField
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Column name"
                    type="text"
                    name={`columns[${index}].column_name`}
                    value={tableForm.values.columns[index]["column_name"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["column_name"]}
                  />
                  {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <Select
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    type="text"
                    placeholder="Data type"
                    name={`columns[${index}].data_type`}
                    value={tableForm.values.columns[index]["data_type"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["data_type"]}
                  >
                    {Object.keys(LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES)?.map(
                      (type) => {
                        return (
                          <MenuItem
                            value={
                              LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].name
                            }
                          >
                            {LOCAL_CONSTANTS.POSTGRE_SQL_DATA_TYPES[type].name}
                          </MenuItem>
                        );
                      }
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <Select
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    type="text"
                    placeholder="Data type"
                    name={`columns[${index}].storage`}
                    value={tableForm.values.columns[index]["storage"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["storage"]}
                  >
                    {["PLAIN", "EXTERNAL", "EXTENDED", "MAIN", "DEFAULT"].map(
                      (storage) => {
                        return <MenuItem value={storage}>{storage}</MenuItem>;
                      }
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <TextField
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Default value"
                    type="text"
                    name={`columns[${index}].default`}
                    value={tableForm.values.columns[index]["default"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["default"]}
                  />
                  {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControl fullWidth size="small">
                  <TextField
                    required={true}
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Check expression"
                    type="text"
                    name={`columns[${index}].check`}
                    value={tableForm.values.columns[index]["check"]}
                    onChange={tableForm.handleChange}
                    onBlur={tableForm.handleBlur}
                    error={tableForm.errors?.columns?.[index]["check"]}
                  />
                  {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
                </FormControl>
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tableForm.values.columns[index]["unique"]}
                      onChange={(value) => {
                        tableForm?.setFieldValue(
                          `columns[${index}].unique`,
                          value.target.checked
                        );
                      }}
                    />
                  }
                  label={"Unique"}
                />
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tableForm.values.columns[index]["primary_key"]}
                      onChange={(value) => {
                        tableForm?.setFieldValue(
                          `columns[${index}].primary_key`,
                          value.target.checked
                        );
                      }}
                    />
                  }
                  label={"Primary key"}
                />
              </Grid>
              <Grid item xl={3} lg={3} md={3} sm={3} xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tableForm.values.columns[index]["not_null"]}
                      onChange={(value) => {
                        tableForm?.setFieldValue(
                          `columns[${index}].not_null`,
                          value.target.checked
                        );
                      }}
                    />
                  }
                  label={"Not NULL"}
                />
              </Grid>
            </Grid>
            <div
              className=" rounded-e"
              style={{ background: theme.palette.background.paper }}
            >
              <IconButton
                size="small"
                onClick={() => _handleDeleteColumn(index)}
              >
                <MdDeleteOutline className="!text-xl !text-red-700"></MdDeleteOutline>
              </IconButton>
            </div>
          </div>
        );
      })}
      <Button variant="outlined" className="!mt-3" onClick={_handleAddColumn}>
        <FaPlus className="!mr-1" />
        {LOCAL_CONSTANTS.STRINGS.TABLE_COLUMN_ADDITION_PAGE_TITLE}
      </Button>
    </Grid>
  );
};
