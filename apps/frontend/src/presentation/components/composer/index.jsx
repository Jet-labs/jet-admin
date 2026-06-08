import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GlobalDialogs } from "../ui/GlobalDialogs";
import { RootRouter } from "../routes/rootRouter";
import { SuspenseFallback } from "../ui/suspenseFallback";

const queryClient = new QueryClient(
  {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    }
  }
);

export const Composer = () => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <QueryClientProvider client={queryClient}>
        <RootRouter />
      </QueryClientProvider>
      <GlobalDialogs />
      <ToastContainer theme="dark" />
    </Suspense>
  );
};
