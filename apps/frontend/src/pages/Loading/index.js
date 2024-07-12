import { CircularProgress } from "@mui/material";
import "./styles.css";
export const Loading = ({ fullScreen = false, adjust = true }) => {
  return (
    <div
      className={
        fullScreen
          ? "loading_main_full_screen"
          : adjust
          ? "w-full h-full justify-center items-center flex-grow"
          : "w-full h-full justify-center items-center"
      }
    >
      <CircularProgress />
    </div>
  );
};
