import { CircularProgress } from "@mui/material";
import React from "react";


export const SuspenseFallback = () => {
  return (
    <div className="h-screen w-screen bg-white flex flex-col justify-center items-center">
      <CircularProgress className="!text-[#646cff]" size={16} />
    </div>
  );
};
