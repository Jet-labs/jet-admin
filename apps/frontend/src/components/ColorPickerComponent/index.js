import { Button } from "@douyinfe/semi-ui";
import { IconCheckboxTick } from "@douyinfe/semi-icons";

import { useTranslation } from "react-i18next";
import { LOCAL_CONSTANTS } from "../../constants";
import { TextField } from "@mui/material";

export const ColorPickerComponent = ({
  currentColor,
  onClearColor,
  onPickColor,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex justify-between items-center">
        <TextField
          fullWidth
          size="medium"
          variant="outlined"
          type="color"
          value={currentColor}
          onChange={(e) => {
            onPickColor(e.target.value);
          }}
        />
      </div>

      <div className="py-3 space-y-3">
        <div className="flex flex-wrap w-full gap-y-2">
          {LOCAL_CONSTANTS.TABLE_EDITOR_TABLE_THEME.map((c) => (
            <button
              key={c}
              style={{ backgroundColor: c }}
              className="w-6 h-6 rounded mx-1"
              onClick={() => onPickColor(c)}
            >
              <IconCheckboxTick
                className="pt-1"
                style={{
                  color: currentColor === c ? "white" : c,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
