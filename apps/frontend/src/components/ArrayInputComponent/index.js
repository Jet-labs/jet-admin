import {
  Chip,
  Divider,
  Grid,
  IconButton,
  Input,
  InputBase,
  Paper,
  TextField,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
const LocalEditableChip = ({ value, onChange, onDelete, type }) => {
  const theme = useTheme();
  return (
    <Grid item xs={6} sm={4} md={4} lg={3} xl={3} className="!p-1">
      <div
        style={{
          borderColor: theme.palette.divider,
          borderWidth: 1,
          background: theme.palette.background.paper,
        }}
        className="flex flex-row justify-start items-center rounded px-2 h-[32px]"
      >
        <InputBase
          sx={{
            flex: 1,
            "& .MuiInputBase-input": {
              padding: 0,
            },
          }}
          placeholder="Add value here"
          className="!p-0"
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />

        <IconButton
          color="primary"
          aria-label="directions"
          className="!p-0"
          onClick={onDelete}
        >
          <IoClose className="!text-base" style={{ margin: 0 }} />
        </IconButton>
      </div>
    </Grid>
  );
};

const LocalInput = ({ handleAddValue, type }) => {
  const theme = useTheme();
  const [newValue, setNewValue] = useState(type == "number" ? 0 : "");
  return (
    <Grid item xs={6} sm={4} md={4} lg={3} xl={3} className="!p-1">
      <div
        style={{
          borderColor: theme.palette.divider,
          borderWidth: 1,
          background: theme.palette.background.secondary,
        }}
        className="flex flex-row justify-start items-center rounded px-2 h-[32px]"
      >
        <InputBase
          sx={{
            flex: 1,
            "& .MuiInputBase-input": {
              padding: 0,
            },
          }}
          placeholder="Add value here"
          className="!p-0"
          type={type}
          value={newValue}
          onChange={(e) => {
            setNewValue(e.target.value);
          }}
        />

        <IconButton
          color="primary"
          aria-label="directions"
          className="!p-0"
          onClick={() => handleAddValue(newValue)}
        >
          <FaPlus className="!text-sm" style={{ margin: 0 }} />
        </IconButton>
      </div>
    </Grid>
  );
};

export const ArrayInput = ({ value, onChange, type }) => {
  const theme = useTheme();
  const _handleOnDelete = (index) => {
    const _value = [...value];
    _value.splice(index, 1);
    onChange(_value);
  };
  const _handleAddValue = (v) => {
    const _value = [...value];
    _value.push(type === "number" ? parseInt(v) : v);
    onChange(_value);
  };

  const _handleOnIndexValueChange = (index, v) => {
    const _value = [...value];
    _value[index] = type === "number" ? parseInt(v) : v;
    onChange(_value);
  };
  return (
    <Grid
      container
      className="!w-full !rounded !flex-grow"

      // style={{ borderColor: theme.palette.divider, borderWidth: 1 }}
    >
      {Array.isArray(value) &&
        value.map((v, index) => {
          return (
            <LocalEditableChip
              value={v}
              type={type}
              onChange={(value) => _handleOnIndexValueChange(index, value)}
              onDelete={() => _handleOnDelete(index)}
            />
          );
        })}

      <LocalInput type={type} handleAddValue={_handleAddValue} />
    </Grid>
  );
};
