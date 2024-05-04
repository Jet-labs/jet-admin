import { ButtonBase, LinearProgress, useTheme } from "@mui/material";

import "./styles.css";

export const HorizontalButton = ({
  variant,
  textColor,
  justifyBetween,
  style,
  color,
  startIcon,
  endIcon,
  size,
  text,
  type,
  disabled,
  isLoading,
  fullWidth,
  onClick,
  borderColor,
  sx,
  className,
}) => {
  const theme = useTheme();

  return (
    <ButtonBase
      color={color}
      focusRipple={true}
      onClick={onClick}
      type={type}
      disabled={disabled}
      style={style}
      sx={{
        padding: 0,
        boxShadow: 0,
        outline: 0,
        border: 1,
        borderColor: borderColor
          ? borderColor
          : variant == "error"
          ? theme?.palette?.error.main
          : theme?.palette?.primary.main,
        background: color
          ? color
          : variant == "error"
          ? theme?.palette?.error.main
          : theme?.palette?.primary.main,
        width: fullWidth ? "100%" : null,
        borderRadius: 1,
        color: textColor
          ? textColor
          : variant == "error"
          ? theme?.palette?.error.contrastText
          : theme?.palette?.primary.contrastText,
        overflow: "hidden",
        opacity: disabled ? 0.5 : 1,
        ...sx,
      }}
      className={`${className}`}
    >
      <div className="flex-column justify-center items-stretch w-full">
        <div
          style={{ paddingTop: 4, paddingBottom: isLoading ? 0 : 4 }}
          className={
            justifyBetween
              ? "flex-row flex !w-full justify-between items-center px-3"
              : "flex-row flex !w-full justify-center items-center px-3"
          }
        >
          {startIcon}
          <span
            style={{ textAlign: "center", padding: 2 }}
            className="font-bold"
          >
            {text}
          </span>
          {endIcon}
        </div>

        {isLoading ? <LinearProgress color="inherit" /> : null}
      </div>
    </ButtonBase>
  );
};
