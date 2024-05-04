import "./styles.css";
import ErrorIcon from "@mui/icons-material/Error";
import { extractError } from "../../utils/error";
import { Button, useTheme } from "@mui/material";
export const ErrorComponent = ({ error, action, actionText, icon, style }) => {
  const theme = useTheme();
  return (
    <div
      className="flex flex-row justify-between items-center w-full py-1"
      style={{ ...style }}
    >
      <div className="flex flex-row justify-start items-center">
        {icon ? icon : <ErrorIcon fontSize="small" color="error" />}
        <span
          className="text-left font-medium text-sm ml-2"
          style={{ color: theme?.palette?.error.main }}
        >
          {typeof error === "string" ? error : extractError(error)}
        </span>
      </div>
      {actionText ? (
        <Button color="error" size="small" onClick={action}>
          {actionText}
        </Button>
      ) : null}
    </div>
  );
};
