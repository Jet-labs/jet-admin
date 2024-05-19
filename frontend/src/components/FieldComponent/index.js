import styled from "@emotion/styled";
import { ExpandMore } from "@mui/icons-material";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import {
  DateTimePicker,
  LocalizationProvider,
  StaticDateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { isNull } from "lodash";
import moment from "moment";
import { LOCAL_CONSTANTS } from "../../constants";
import { JSONEditorReact } from "../JSONEditorReact";

export const FieldComponent = ({
  type,
  isList,
  onChange,
  onBlur,
  value,
  helperText,
  error,
  name,
  required,
  readOnly,
  dateTimePicker = "normal",
  customMapping,
  selectOptions,
  setFieldValue,
  showDefault,
  jsonMode,
}) => {
  const CustomDateTimePicker = styled(
    dateTimePicker === "normal" ? DateTimePicker : StaticDateTimePicker
  )(({ theme }) => ({
    "& .MuiInputBase-input": {
      padding: "8.5px 14px",
    },
  }));
  console.log({ type });
  const label = name
    ? String(name).charAt(0).toUpperCase() + String(name).slice(1)
    : null;
  let component = null;
  switch (type) {
    case LOCAL_CONSTANTS.DATA_TYPES.STRING: {
      component = (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          {label && (
            <span className="text-xs font-light mb-1 !lowercase">{label}</span>
          )}
          <TextField
            disabled={readOnly}
            required={required}
            fullWidth
            size="small"
            variant="outlined"
            type="text"
            name={name}
            // placeholder={label}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            helperText={helperText}
            error={error}
          />
        </FormControl>
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.SINGLE_SELECT: {
      component = (
        <FormControl fullWidth size="small">
          {label && <InputLabel id="select-small-label">{label}</InputLabel>}

          <Select
            labelId="select-small-label"
            id="select-small"
            value={value}
            label={label}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            name={name}
            disabled={readOnly}
            required={required}
            fullWidth
            size="small"
          >
            {selectOptions?.map((option) => {
              const value = isNull(option.value) ? option : option.value;
              const label = option.label ? option.label : value;
              return <MenuItem value={value}>{label}</MenuItem>;
            })}
          </Select>
          {error && <span className="mt-2 text-red-500">{error}</span>}
        </FormControl>
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.MULTIPLE_SELECT: {
      component = (
        <FormControl fullWidth size="small">
          {label && (
            <InputLabel id="multiple-select-small-label">{label}</InputLabel>
          )}
          <Select
            labelId="multiple-select-small-label"
            id="multiple-select-small"
            multiple
            value={value}
            label={label}
            onChange={onChange}
            onBlur={onBlur}
            error={error}
            name={name}
            disabled={readOnly}
            required={required}
            fullWidth
            size="small"
            input={
              <OutlinedInput
                id="select-multiple-chip"
                label="Chip"
                size="small"
              />
            }
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value.value} label={value.label} size="small" />
                ))}
              </Box>
            )}
            // MenuProps={MenuProps}
          >
            {selectOptions?.map((row) => {
              return (
                <MenuItem key={row.value} value={row}>
                  {row.label}
                </MenuItem>
              );
            })}
          </Select>
          {error && (
            <span className="mt-2 text-red-500 font-thin text-xs">{error}</span>
          )}
        </FormControl>
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.BOOLEAN: {
      component = (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          <Select
            id={name}
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            value={Boolean(value)}
            error={error}
            IconComponent={ExpandMore}
            className=" !w-full"
            required={required}
            disabled={readOnly}
          >
            <MenuItem
              value={true}
              className="!break-words !whitespace-pre-line"
              // className="!break-words !flex !text-left"
            >
              True
            </MenuItem>
            <MenuItem
              value={false}
              className="!break-words !whitespace-pre-line"
              // className="!break-words !flex !text-left"
            >
              False
            </MenuItem>
          </Select>
        </FormControl>
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.DATETIME: {
      component = (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start !w-full"
          size="small"
        >
          <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <CustomDateTimePicker
              name={name}
              // placeholder={label}
              onChange={onChange}
              onBlur={onBlur}
              value={value ? moment(new Date(value)) : null}
              helperText={helperText}
              error={error}
              className="!w-full"
              disabled={readOnly}
            />
          </LocalizationProvider>
        </FormControl>
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.JSON: {
      console.log({ value });
      component = (
        <FormControl fullWidth size="small">
          {label && (
            <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          )}
          <JSONEditorReact
            json={value ? value : null}
            mode={jsonMode ? jsonMode : "text"}
            modes={["tree", "form", "view", "code", "text"]}
            indentation={4}
            onChange={(value) => {
              console.log({ value });
              setFieldValue(name, value);
            }}
            // onModeChange={this.onModeChange}
          />
        </FormControl>
      );

      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.INT: {
      component = customMapping ? (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          <Select
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            value={parseInt(value)}
            IconComponent={ExpandMore}
            size="small"
            className=""
            fullWidth
          >
            {Object.keys(customMapping)?.map((value, index) => {
              return (
                <MenuItem
                  value={parseInt(value)}
                  className="!break-words !whitespace-pre-line"
                  key={index}
                >
                  {customMapping[value]}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          <TextField
            required={required}
            fullWidth
            size="small"
            variant="outlined"
            type="number"
            name={name}
            // placeholder={label}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            helperText={helperText}
            error={error}
            disabled={readOnly}
          />
        </FormControl>
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.FLOAT: {
      component = customMapping ? (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          <Select
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            value={parseInt(value)}
            IconComponent={ExpandMore}
            size="small"
            className=""
            fullWidth
          >
            {Object.keys(customMapping)?.map((value, index) => {
              return (
                <MenuItem
                  value={parseInt(value)}
                  className="!break-words !whitespace-pre-line"
                  key={index}
                >
                  {customMapping[value]}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          <TextField
            required={required}
            fullWidth
            size="small"
            variant="outlined"
            type="number"
            name={name}
            // placeholder={label}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            helperText={helperText}
            error={error}
            disabled={readOnly}
          />
        </FormControl>
      );
      break;
    }
    case LOCAL_CONSTANTS.DATA_TYPES.DECIMAL: {
      component = customMapping ? (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          <Select
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            value={parseInt(value)}
            IconComponent={ExpandMore}
            size="small"
            className=""
            fullWidth
          >
            {Object.keys(customMapping)?.map((value, index) => {
              return (
                <MenuItem
                  value={parseInt(value)}
                  className="!break-words !whitespace-pre-line"
                  key={index}
                >
                  {customMapping[value]}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      ) : (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          <TextField
            required={required}
            fullWidth
            size="small"
            variant="outlined"
            type="number"
            name={name}
            // placeholder={label}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            helperText={helperText}
            error={error}
            disabled={readOnly}
          />
        </FormControl>
      );
      break;
    }
    default: {
      component = showDefault ? (
        <FormControl fullWidth size="small">
          {label && (
            <span className="text-xs font-light  !lowercase mb-1">{label}</span>
          )}
          <JSONEditorReact
            json={value}
            mode={jsonMode ? jsonMode : "text"}
            modes={["tree", "form", "view", "code", "text"]}
            indentation={4}
            onChange={(value) => {
              console.log({ value });
              setFieldValue(name, value);
            }}
          />
        </FormControl>
      ) : null;
    }
  }

  return component;
};
