import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  TextField,
} from "@mui/material";
import React from "react";
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
export const TableGeneralDetailsBuilder = ({ tableForm }) => {
  return (
    <Grid container xl={6} lg={6} md={12} sm={12} xs={12} className="!p-3">
      <FormControl fullWidth size="small" className="">
        <span className="text-xs font-light  !capitalize mb-1">{`Table name`}</span>
        <TextField
          required={true}
          fullWidth
          size="small"
          variant="outlined"
          type="text"
          name={"table_name"}
          value={tableForm.values["table_name"]}
          onChange={tableForm.handleChange}
          onBlur={tableForm.handleBlur}
        />
        {/* {error && <span className="mt-2 text-red-500">{error}</span>} */}
      </FormControl>
      <FormControlLabel
        control={
          <Checkbox
            checked={tableForm.values["if_not_exists"]}
            onChange={(value) => {
              tableForm?.setFieldValue("if_not_exists", value.target.checked);
            }}
          />
        }
        label={"Create table if not exists"}
      />
    </Grid>
  );
};
