import styled from "@emotion/styled";
import {
  Box,
  Chip,
  FormControl,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  useTheme,
} from "@mui/material";
import {
  DateTimePicker,
  LocalizationProvider,
  StaticDateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { capitalize, isNull, lowerCase } from "lodash";
import moment from "moment";
import { LOCAL_CONSTANTS } from "../../constants";
import { CodeEditor } from "../CodeEditorComponent";
import { FaChevronDown } from "react-icons/fa";

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
  language,
  customLabel,
}) => {
  const theme = useTheme();
  const CustomDateTimePicker = styled(
    dateTimePicker === "normal" ? DateTimePicker : StaticDateTimePicker
  )(({ theme }) => ({
    "& .MuiInputBase-input": {
      padding: "8.5px 14px",
    },
  }));
  const label = lowerCase(name);
  let component = null;
  switch (type) {
    case LOCAL_CONSTANTS.DATA_TYPES.STRING: {
      component = (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
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
    case LOCAL_CONSTANTS.DATA_TYPES.COLOR: {
      component = (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
          <TextField
            disabled={readOnly}
            required={required}
            fullWidth
            size="small"
            variant="outlined"
            type="color"
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
    case LOCAL_CONSTANTS.DATA_TYPES.CODE: {
      component = (
        <FormControl
          fullWidth
          className="!flex !flex-col !justify-start !items-start"
          size="small"
        >
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
          <CodeEditor
            disabled={readOnly}
            required={required}
            fullWidth
            size="small"
            variant="outlined"
            type="color"
            name={name}
            // placeholder={label}
            setCode={(value) => {
              setFieldValue(
                name,
                value ? String(value).replace(/\n/g, "") : value
              );
            }}
            onBlur={onBlur}
            code={value}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}

          <Select
            id={name}
            value={value}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
          <Select
            id={name}
            multiple
            value={value}
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
                  <Chip
                    key={value.value}
                    label={value.label}
                    size="small"
                    color="primary"
                  />
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
          <Select
            id={name}
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            value={Boolean(value)}
            error={error}
            IconComponent={() => <FaChevronDown className="!text-sm" />}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
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
      component = (
        <FormControl fullWidth size="small">
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
          <CodeEditor
            disabled={readOnly}
            required={required}
            fullWidth
            size="small"
            variant="outlined"
            type="color"
            name={name}
            // placeholder={label}
            setCode={(value) => {
              setFieldValue(
                name,
                value ? String(value).replace(/\n/g, "") : value
              );
            }}
            language={language ? language : "json"}
            onBlur={onBlur}
            code={
              typeof value === "object" ? JSON.stringify(value, null, 2) : value
            }
            helperText={helperText}
            error={error}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
          <Select
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            value={parseInt(value)}
            IconComponent={() => <FaChevronDown className="!text-sm" />}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
          <Select
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            value={parseInt(value)}
            IconComponent={() => <FaChevronDown className="!text-sm" />}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
          <Select
            name={name}
            onChange={onChange}
            onBlur={onBlur}
            value={parseInt(value)}
            IconComponent={() => <FaChevronDown className="!text-sm" />}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
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
          {customLabel
            ? customLabel
            : label && <span className="text-xs font-light mb-1">{label}</span>}
          <CodeEditor
            disabled={readOnly}
            required={required}
            fullWidth
            size="small"
            variant="outlined"
            type="color"
            name={name}
            // placeholder={label}
            setCode={(value) => {
              setFieldValue(
                name,
                value ? String(value).replace(/\n/g, "") : value
              );
            }}
            language={language ? language : "json"}
            onBlur={onBlur}
            code={
              typeof value === "object" ? JSON.stringify(value, null, 2) : value
            }
            helperText={helperText}
            error={error}
          />
        </FormControl>
      ) : null;
    }
  }

  return component;
};
