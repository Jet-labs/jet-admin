import React from "react";


import { Spinner } from "@jet-admin/ui";
export const SuspenseFallback = () => {
  return (
    <div className="h-screen w-screen bg-background flex flex-col justify-center items-center">
      <Spinner className="text-primary" size={16} />
    </div>
  );
};
