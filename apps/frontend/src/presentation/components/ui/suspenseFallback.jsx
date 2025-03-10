import { CircularProgress } from "@mui/material";

export const SuspenseFallback = () => {
  return (
    <div className="h-screen w-screen bg-white flex flex-col justify-center items-center">
      <CircularProgress />
    </div>
  );
};
